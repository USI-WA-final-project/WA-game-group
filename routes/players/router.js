/** @module players/router */
'use strict';

const express = require('express');
const router = express.Router();
//const database = require('../../database.js');

//Display all players
router.get('/', function(req, res) {
    let colors = req.app.locals.worldData.colors;
    let players = req.app.locals.players.sort(function(a, b) { return b.score - a.score; });

    for (let i = 0; i < players.length; i++) {
        players[i].playerColor = colors[players[i].color].core;
    }

    if (req.accepts("html")) {        
        res.render("players", { result: players });
    } else if (req.accepts("json")){
        res.json(players);
    } else {
        res.status(406).end();    //Not acceptable
    }     
});

//Filter players by username
router.get('/search', function(req, res) {
    let colors = req.app.locals.worldData.colors;
    let players = req.app.locals.players.sort(function(a, b) { return b.score - a.score; });

    for (let i = 0; i < players.length; i++) {
        players[i].playerColor = colors[players[i].color].core;
    }

    let filtered = players.filter(function(el) {
        return el.username.includes(req.query.name);
    });

    if (req.accepts("html")) {        
        res.render("players", { result: filtered });
    } else if (req.accepts("json")){
        res.json(filtered);
    } else {
        res.status(406).end();    //Not acceptable
    }
});

/** router for /players */
module.exports = router;