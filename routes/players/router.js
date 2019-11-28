/** @module players/router */
'use strict';

const express = require('express');
const router = express.Router();

const database = require('../../database.js');

const mongoose = require('mongoose');
require('../../models/Player');
const Player = mongoose.model('Player');


//Display all players
router.get('/', function(req, res) {
    database.getAll()
    .then(function(result) {
        if (req.accepts("html")){
            res.render("players", { result });
        } else if (req.accepts("json")){
            res.json(result);
        } else {
            res.status(406).end();    //Not acceptable
        } 
    });      
});

/** router for /players */
module.exports = router;