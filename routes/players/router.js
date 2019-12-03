/** @module players/router */
'use strict';

const express = require('express');
const router = express.Router();

const database = require('../../database.js');

//Display all players
router.get('/', function(req, res) {
    database.getAllPlayers()
    .then(function(results) {
        if (req.accepts("html")) {
            for (let i = 0; i < results.length; i++) {
                results[i].playerColor = req.app.locals.playerColors[results[i].color].core;
            }
            res.render("players", { result: results });
        } else if (req.accepts("json")){
            res.json(results);
        } else {
            res.status(406).end();    //Not acceptable
        } 
    });      
});

/** router for /players */
module.exports = router;