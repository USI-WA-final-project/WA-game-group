// We're not using the commented modules but may want to later on.
const express = require('express');
// const path = require('path');
const logger = require('morgan');
// const bodyParser = require('body-parser');
const dust = require('klei-dust');
// const dustjsLinkedin = require('dustjs-linkedin');
const mongoose = require('mongoose');

const engine = require('./engine/engine.js');

const app = express();

//DB Connection
mongoose.connect('mongodb://localhost/loa', { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
    console.log('Database connection successful');
})
.catch(err => {
    console.error('Database connection error');
});

//configure app
app.use(logger('dev'));
// app.use(bodyParser.json({strict: false}));
// app.use(bodyParser.text());
// app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(__dirname + '/public'));

app.set('view engine', 'dust');
app.set('views', __dirname + '/views');
app.engine('dust', dust.dust);


// Initialize routers here
const routers = require(__dirname + '/routes/routers');
app.use('/', routers.root);
app.use('/stats', routers.stats);


const server = app.listen(3000, function() {
    console.log('Express server listening on port ' + server.address().port);
    engine.init();
});

const io = require('socket.io')(server);

io.on('connection', function(socket){
    console.log('Client connected');

    let id = engine.create();
    console.log('Created player ', id);

    engine.register(id, function(data) {
        socket.emit('drawWorld', data);
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
        console.log('Player ', id, ' moved ', dirEnum);
    });

    socket.emit('message', "Welcome!");
});