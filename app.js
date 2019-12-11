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

const RENDER_DISTANCE = 1500;
const MAX_USER_LENGTH = 14;
const DEFAULT_USERNAME = "ajax";

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
//app.use(bodyParser.text());
//app.use(bodyParser.urlencoded({extended: false}));
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
const server = app.listen(3000, function() {
    console.log('Express server listening on port', server.address().port);
    engine.init();

    //Clear the database - TODO remove in production
    mongoose.connection.collections['players'].drop(function(err) {
        console.log('DB cleared');
    });

    //Retrieve whole world data once per tick
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
            console.log("Impossible direction", direction);
            return null;
    }
}

const io = require('socket.io')(server);

//Socket communication
io.on('connection', function(socket){
    console.log('Client connected');

    let player = { id: -1 };

    socket.emit('worldData', { 
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

        let color = Math.floor(Math.random() * 8);
        player = engine.create({ username: user, color: color});

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
            
            //Update score
            player.score = data.kills + Math.floor(data.resources);
    
            let players = [];
    
            worldState.players.forEach(function(el) {    
                let adjustedX = el.position.x - x;
                let adjustedY = el.position.y - y;

                if (Math.abs(adjustedX) < RENDER_DISTANCE + el.size + size && 
                    Math.abs(adjustedY) < RENDER_DISTANCE + el.size + size) {
                    let player = {
                        color: el.custom.color,
                        health: el.bodyparts[0].health,
                        rotation: el.rotation,
                        kills: el.kills,
                        resources: Math.floor(el.resources),
                        username: el.custom.username,
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
    
            let serializedData = {
                playerPosition: { x: x, y: y },
                players: players,
                resources: resources
            };
    
            socket.emit('drawWorld', serializedData);
        });
    });

    socket.on('move', function(direction) {
        let dirEnum = convertDirection(direction);
        if (dirEnum != null) {
            engine.move(player.id, dirEnum);
        }
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
                console.log("Invalid type", data, "player", player.id, "-", player.username);
                socket.emit("attachError", { type: data.type, message: "Invalid type " + data.type });
                return;
        }

        let playerData = engine.info(player.id);
        if (playerData == null) return;

        player.bodyparts = playerData.bodyparts;

        if (data.part < 0 || player.bodyparts[data.part] === undefined) {
            console.log("Invalid part", data, "player", player.id, "-", player.username);
            socket.emit("attachError", { type: data.type, message: "Invalid part " + data.part });
            return;
        }

        if (data.face < 0 || data.face > 5) {
            console.log("Invalid face", data, "player", player.id, "-", player.username);
            socket.emit("attachError", { type: data.type, message: "Invalid face " + data.face });
            return;
        }

        res = engine.attach(player.id, type, data.part, data.face);

        if (res != 0) {
            console.log("Error (code", res, ") attaching part", data, "player", player.id, "-", player.username);
            socket.emit("attachError", { type: data.type, message: "Invalid attach (code " + res + ")" });
        }
    });

    socket.on('removePart', function(data) {
        let playerData = engine.info(player.id);
        if (playerData == null) return;

        player.bodyparts = playerData.bodyparts;

        if (data.part <= 0 || player.bodyparts[data.part] === undefined) {
            console.log("Invalid part remove", data, "player", player.id, "-", player.username);
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