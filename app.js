// const bodyParser = require('body-parser');
// const dustjsLinkedin = require('dustjs-linkedin');
const express = require('express');
const logger = require('morgan');
const dust = require('klei-dust');
const mongoose = require('mongoose');
const app = express();

//Our custom game engine and API
const engine = require('./engine/engine.js');
const database = require('./database.js');

const RENDER_DISTANCE = 2000;

//DB Connection
mongoose.connect('mongodb://localhost/loa', { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
    console.log('Database connection successful');
})
.catch(err => {
    console.error('Database connection error');
});

app.use(logger('dev'));
// app.use(bodyParser.json({strict: false}));
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

//Server start-up
const server = app.listen(3000, function() {
    console.log('Express server listening on port ' + server.address().port);
    engine.init();
});
const io = require('socket.io')(server);

//Socket communication
io.on('connection', function(socket){
    console.log('Client connected');

    let id = engine.create();
    let username;
    let worldState;

    //Register user in engine and DB
    socket.on('registerUser', function(user) {
        username = user;                     
        database.add(id, username);
        console.log('Created player ', id, ' - ', username);
    });

    //Retrieve whole world data once per tick
    engine.register_global(function(data) {
        worldState = data;
    });

    //Send to each player its customized view (based on RENDER_DISTANCE)
    engine.register(id, function(data) {
        let x = data.position.x;
        let y = data.position.y;

        let players = [];

        worldState.players.forEach(function(el) {            
            if (Math.abs(el.position.x - x) < RENDER_DISTANCE && 
                Math.abs(el.position.y - y) < RENDER_DISTANCE) {
                let player = {
                    color: el.color,
                    rotation: el.rotation,
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
                        }
                        return newItem;
                    })
                };

                if (el.id != id) {
                    player.position = {
                        x: el.position.x - x,
                        y: el.position.y - y
                    }
                }

                players.push(player);
            }            
        });

        let resources = [];

        /* worldState.resources.forEach(function(el) {
            if (Math.abs(el.position.x - x) < RENDER_DISTANCE && 
                Math.abs(el.position.y - y) < RENDER_DISTANCE) {
                resources.push(el);
            }
        }); */

        let structures = [];

        /* worldState.structures.forEach(function(el) {
            if (Math.abs(el.position.x - x) < RENDER_DISTANCE && 
                Math.abs(el.position.y - y) < RENDER_DISTANCE) {
                structures.push(el);
            }
        }); */

        let serializedData = {
            players: players,
            resources: resources,
            structures: structures
        };
        socket.emit('drawWorld', serializedData);
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
        }
        
        engine.move(id, dirEnum);
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
        }
        res = engine.attach(id, type, data.part, data.face);
        if (res != 0) {
            console.log("Error (code ", res, ") attaching part ", data);
        }
    });

    socket.on('disconnect', function(){
        console.log('Client disconnected');
        database.terminate(id);
        console.log('Archived player ', id, ' - ', username);
        //TODO delete player from engine
    });
});