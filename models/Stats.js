const mongoose = require('mongoose');

const Stats = exports.Stats = new mongoose.Schema({
    username: { type: String, required: true },
    score: { type: Number },
    dateStarted: { type: Date, required: true, default: Date.now }
});

mongoose.model('Stats', Stats);