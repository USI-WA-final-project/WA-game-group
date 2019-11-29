const mongoose = require('mongoose');

const Player = exports.Player = new mongoose.Schema({
    id: { type: Number, required: true },
    color: { type: Number, required: true },
    username: { type: String, required: true },
    spawnPos: { 
        x: { type: Number, required: true },
        y: { type: Number, required: true }
    },
    //Optional fields
    dateStarted: { type: Date, default: Date.now },
    dateEnded: { type: Date, default: null },
    active: { type: Boolean, default: true },
    score: { type: Number, default: 0 }    
});

mongoose.model('Player', Player);