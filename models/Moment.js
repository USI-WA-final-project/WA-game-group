const mongoose = require('mongoose');

const Moment = exports.Moment = new mongoose.Schema({
    name: { type: String, default: "Epic moment " + JSON.stringify(new Date()) },
    date: { type: Date, default: Date.now() },
    src: { type: String, required: true},
    uploaded: { type: Array, default: [-1, -1] },
});

mongoose.model('Moment', Moment);