const bodyParser = require('body-parser');
// const dustjsLinkedin = require('dustjs-linkedin');
const express = require('express');
const logger = require('morgan');
const dust = require('klei-dust');
const mongoose = require('mongoose');
const app = express();

//Our custom game engine and API
const engine = require('./engine/engine.js');
const database = require('./database.js');
const playerColors = require('./colors.js');

const RENDER_DISTANCE = 1000;

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
// app.use(bodyParser.text());
// app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(__dirname + '/public'));

app.set('view engine', 'dust');
app.set('views', __dirname + '/views');
app.engine('dust', dust.dust);

//Routers initialization
const routers = require(__dirname + '/routes/routers');
app.use('/', routers.root);
app.use('/players', routers.players);
app.use('/moments', routers.moments);

// APIs
app.locals.imgur = {
    album: 's5aWjcn',
    token: '258d66df9a9d57fbdc2b3efd21fb59167df70ce9'
};

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

const io = require('socket.io')(server);

//Socket communication
io.on('connection', function(socket){
    console.log('Client connected');

    let player = { id: -1 };

    app.locals.playerColors = playerColors;

    socket.emit('worldData', { 
        colors: playerColors,
        width: engine.WORLD_WIDTH, 
        height: engine.WORLD_HEIGHT 
    });

    //Register user in DB and engine
    socket.on('registerUser', function(user) {
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
            
            //Update score
            player.score = data.kills + data.resources;
    
            let players = [];
    
            worldState.players.forEach(function(el) {    
                let adjustedX = el.position.x - x;
                let adjustedY = el.position.y - y;

                if (Math.abs(adjustedX) < RENDER_DISTANCE && 
                    Math.abs(adjustedY) < RENDER_DISTANCE) {
                    let player = {
                        color: el.custom.color,
                        health: el.bodyparts[0].health,
                        rotation: el.rotation,
                        kills: el.kills,
                        resources: el.resources,
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
                        })
                    };
    
                    //Only send relative positions of the other players
                    if (el.id != player.id) {
                        player.position = {
                            x: adjustedX,
                            y: adjustedY
                        }
                    }
    
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
        let dirEnum;

        switch(direction) {
            case 0:
                dirEnum = engine.DIRECTION.UP;
            break;
            case 1:
                dirEnum = engine.DIRECTION.UP_RIGHT;
            break;
            case 2:
                dirEnum = engine.DIRECTION.RIGHT;
            break;
            case 3:
                dirEnum = engine.DIRECTION.DOWN_RIGHT;
            break;
            case 4:
                dirEnum = engine.DIRECTION.DOWN;
            break;
            case 5:
                dirEnum = engine.DIRECTION.DOWN_LEFT;
            break;
            case 6:
                dirEnum = engine.DIRECTION.LEFT;
            break;
            case 7:
                dirEnum = engine.DIRECTION.UP_LEFT;
            break;
            default:
                console.log("Impossible direction", direction);
                return;
        }
        
        engine.move(player.id, dirEnum);
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
        console.log('Client disconnected');
        engine.remove(player.id);
    });
});