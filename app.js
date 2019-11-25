// We're not using the commented modules but may want to later on.
const express = require('express');
// const path = require('path');
const logger = require('morgan');
// const bodyParser = require('body-parser');
const dust = require('klei-dust');
// const dustjsLinkedin = require('dustjs-linkedin');
const mongoose = require('mongoose');

const app = express();

//DB Connection
mongoose.connect('mongodb://localhost/loa', { useNewUrlParser: true, useUnifiedTopology: true });

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


const server = app.listen(3000, function() {
    console.log('Express server listening on port ' + server.address().port);
});

const io = require('socket.io')(server);

io.on('connection', function(socket){
    console.log('Client connected');
});