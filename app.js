const bodyParser = require('body-parser');
const express = require('express');
const logger = require('morgan');
const dust = require('klei-dust');
const mongoose = require('mongoose');
const app = express();

//Our custom game engine and API
const engine = require('./engine/engine.js');
const database = require('./database.js');
const playerColors = require('./colors.js');

require('./models/Player');
const Player = mongoose.model('Player');

const RENDER_DISTANCE = 1500;
const MAX_USER_LENGTH = 14;
const DEFAULT_USERNAME = "ajax";
const NUM_COLORS = 8;

const SERVER_PORT = 3000;
const PURGE_DB_RESTART = true;

//DB Connection
mongoose.connect('mongodb://localhost/loa', { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
    console.log('Database connection successful');
})
.catch(err => {
    console.error('Database connection error');
});

app.use(logger('dev'));
app.use(bodyParser.json({strict: false, limit: '10mb'}));
app.use(express.static(__dirname + '/public'));

app.set('view engine', 'dust');
app.set('views', __dirname + '/views');
app.engine('dust', dust.dust);

//Routers initialization
const routers = require(__dirname + '/routes/routers');
app.use('/', routers.root);
app.use('/players', routers.players);
app.use('/moments', routers.moments);

//APIs
app.locals.imgur = {
    album: 's5aWjcn',
    token: '258d66df9a9d57fbdc2b3efd21fb59167df70ce9'
};

app.locals.playerColors = playerColors;

let worldState;

//Server start-up
const server = app.listen(SERVER_PORT, function() {
    console.log('Express server listening on port', server.address().port);
    engine.init();

    if (PURGE_DB_RESTART) {
        //Clear the database
        Player.deleteMany({}, function(err) {
            if (err) {
                console.log('[DB]', err);
            } else {
                console.log('DB cleared');
            }
        });
    }

    //Retrieve whole world state once per tick
    engine.register_global(function(data) {
        worldState = data;
    });
});

/**
 * Converts a direction into the correct enum value
 * @param {Number} direction The direction to convert
 * @returns The converted enum or null if invalid
 */
function convertDirection(direction) {
    switch(direction) {
        case 0:
            return engine.DIRECTION.UP;
        case 1:
            return engine.DIRECTION.UP_RIGHT;
        case 2:
            return engine.DIRECTION.RIGHT;
        case 3:
            return engine.DIRECTION.DOWN_RIGHT;
        case 4:
            return engine.DIRECTION.DOWN;
        case 5:
            return engine.DIRECTION.DOWN_LEFT;
        case 6:
            return engine.DIRECTION.LEFT;
        case 7:
            return engine.DIRECTION.UP_LEFT;
        default:
            return null;
    }
}

const io = require('socket.io')(server);

//Socket communication
io.on('connection', function(socket){
    console.log('Client connected');

    let player = { id: -1, score: 0 };
    let moveStatus = -1;

    socket.emit('worldData', { 
        upgradesCosts: { 
            cell: engine.BODYPART_COST[engine.BODYPART_TYPE.CELL], 
            spike: engine.BODYPART_COST[engine.BODYPART_TYPE.SPIKE], 
            shield: engine.BODYPART_COST[engine.BODYPART_TYPE.SHIELD], 
            bounce: engine.BODYPART_COST[engine.BODYPART_TYPE.BOUNCE]
        },
        colors: playerColors,
        width: engine.WORLD_WIDTH, 
        height: engine.WORLD_HEIGHT 
    });

    //Register user in DB and engine
    socket.on('registerUser', function(user) {
        if (user.length == 0 || !(/\S/.test(user)) || user.length > MAX_USER_LENGTH) {
            console.log("Invalid username", user);
            user = DEFAULT_USERNAME;
        }

        let color = Math.floor(Math.random() * NUM_COLORS);
        player = engine.create({ username: user, color: color });

        database.addPlayer(player)
        .then(function(result) {
            if (!result) {
                console.log("Error adding player");
            }
        });

        engine.register(player.id, function(data) {
            if (data == null) {
                //Either game over or disconnection
                return database.terminatePlayer(player.id, player.score)
                .then(function(result) {
                    if (result == null) {
                        console.log("Error terminating player");
                    } else {
                        socket.emit('gameOver', { 
                            score: result.score
                        });
                    }
                    return;
                });
            }
    
            //Player position in the world
            let x = data.position.x;
            let y = data.position.y;
            let size = data.size;
    
            let players = [];
    
            worldState.players.forEach(function(el) {    
                let adjustedX = el.position.x - x;
                let adjustedY = el.position.y - y;

                let scoreNum = el.kills + Math.floor(el.resources);

                if (el.bodyparts.length > 1) {
                    el.bodyparts.forEach(function(part) {
                        scoreNum += engine.BODYPART_COST[part];
                    });
                }

                if (el.id == player.id) {
                    player.score = scoreNum;
                }

                if (Math.abs(adjustedX) < RENDER_DISTANCE + el.size + size && 
                    Math.abs(adjustedY) < RENDER_DISTANCE + el.size + size) {
                    let player = {
                        color: el.custom.color,
                        health: el.bodyparts[0].health,
                        rotation: el.rotation,
                        kills: el.kills,
                        resources: Math.floor(el.resources),
                        username: el.custom.username,
                        score: scoreNum,
                        components: el.bodyparts.map(function(item) {
                            let newItem = Object.assign({}, item);
                            switch(item.type) {
                                case engine.BODYPART_TYPE.CELL:
                                    newItem.type = 0;
                                break;
                                case engine.BODYPART_TYPE.SPIKE:
                                    newItem.type = 1;
                                break;
                                case engine.BODYPART_TYPE.SHIELD:
                                    newItem.type = 2;
                                break;
                                case engine.BODYPART_TYPE.BOUNCE:
                                    newItem.type = 3;
                                break;
                                default:
                                    newItem.type = -1;
                            }
                            return newItem;
                        }),
                        position: {
                            x: adjustedX,
                            y: adjustedY
                        }
                    };
    
                    players.push(player);
                }            
            });

            app.locals.players = players;
    
            let resources = [];
    
            worldState.resources.forEach(function(el) {
                let adjustedX = el.position.x - x;
                let adjustedY = el.position.y - y;

                if (Math.abs(adjustedX) < RENDER_DISTANCE && 
                    Math.abs(adjustedY) < RENDER_DISTANCE) {
                    let resource = {
                        amount: el.amount,
                        position: {
                            x: adjustedX,
                            y: adjustedY
                        }
                    }
                    resources.push(resource);
                }
            });

            let playerParts = {
                cells: 0,
                spikes: 0,
                shields: 0,
                bounces: 0
            };

            data.bodyparts.forEach(function(part) {
                switch(part.type) {
                    case engine.BODYPART_TYPE.CELL:
                        playerParts.cells += 1;
                    break;
                    case engine.BODYPART_TYPE.SPIKE:
                        playerParts.spikes += 1;
                    break;
                    case engine.BODYPART_TYPE.SHIELD:
                        playerParts.shields += 1;
                    break;
                    case engine.BODYPART_TYPE.BOUNCE:
                        playerParts.bounces += 1;
                    break;
                }
            });
    
            let serializedData = {
                playerPosition: { x: x, y: y },
                playerParts: playerParts,
                players: players,
                resources: resources
            };
    
            socket.emit('drawWorld', serializedData);

            //Move player (if applicable)
            let dirEnum = convertDirection(moveStatus);
            if (dirEnum != null) {
                engine.move(player.id, dirEnum);
            }
        });
    });

    socket.on('startMove', function(direction) {
        moveStatus = direction;
    });

    socket.on('stopMove', function() {
        moveStatus = -1;
    });

    socket.on('attachPart', function(data) {
        let res;
        let type;
        switch(data.type) {
            case 0:
                type = engine.BODYPART_TYPE.CELL;
            break;
            case 1:
                type = engine.BODYPART_TYPE.SPIKE;
            break;
            case 2:
                type = engine.BODYPART_TYPE.SHIELD;
            break;
            case 3:
                type = engine.BODYPART_TYPE.BOUNCE;
            break;
            default:
                console.log("Invalid type", data, "player", player.id, "-", player.custom.username);
                socket.emit("attachError", { type: data.type, message: "Invalid type " + data.type });
                return;
        }

        let playerData = engine.info(player.id);
        if (playerData == null) return;

        player.bodyparts = playerData.bodyparts;

        if (data.part < 0 || player.bodyparts[data.part] === undefined) {
            console.log("Invalid part", data, "player", player.id, "-", player.custom.username);
            socket.emit("attachError", { type: data.type, message: "Invalid part " + data.part });
            return;
        }

        if (data.face < 0 || data.face > 5) {
            console.log("Invalid face", data, "player", player.id, "-", player.custom.username);
            socket.emit("attachError", { type: data.type, message: "Invalid face " + data.face });
            return;
        }

        res = engine.attach(player.id, type, data.part, data.face);

        if (res != 0) {
            console.log("[ENGINE] Error (code", res, ") attaching part", data, "player", player.id, "-", player.custom.username);
            socket.emit("attachError", { type: data.type, message: "Invalid attach (code " + res + ")" });
        }
    });

    socket.on('removePart', function(data) {
        let playerData = engine.info(player.id);
        if (playerData == null) return;

        player.bodyparts = playerData.bodyparts;

        if (data.part <= 0 || player.bodyparts[data.part] === undefined) {
            console.log("Invalid part remove", data, "player", player.id, "-", player.custom.username);
            socket.emit("removeError", { message: "Invalid part " + data.part });
            return;
        }

        engine.detach(player.id, data.part);
    });

    socket.on('rotatePlayer', function(data){
        engine.rotate(player.id, data.angle);
    });

    socket.on('disconnect', function(){
        console.log('Client', player.id, 'disconnected');
        engine.remove(player.id);
    });
});