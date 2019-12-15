/** @module players/router */
'use strict';

const express = require('express');
const router = express.Router();
const database = require('../../database.js');

//Display all players
router.get('/', function(req, res) {
    let colors = req.app.locals.worldData.colors;
    let players = req.app.locals.players.sort(function(a, b) { return b.score - a.score; });

    for (let i = 0; i < players.length; i++) {
        players[i].playerColor = colors[players[i].color].core;
    }

    database.getPlayersByFilter({ active: false }).then(function(data) {
        let olds = data.sort(function(a, b) { return b.score - a.score; });

        for (let i = 0; i < olds.length; i++) {
            olds[i].playerColor = colors[olds[i].color].core;
        }

        if (req.accepts("html")) {        
            res.render("players", { result: players, olds: olds });
        } else if (req.accepts("json")){
            res.json(players);
        } else {
            res.status(406).end();    //Not acceptable
        } 
    });
});

//Filter players by username
router.get('/search', function(req, res) {
    let colors = req.app.locals.worldData.colors;
    let players = req.app.locals.players.sort(function(a, b) { return b.score - a.score; });
    let user = req.query.name;

    for (let i = 0; i < players.length; i++) {
        players[i].playerColor = colors[players[i].color].core;
    }

    let filtered = players.filter(function(el) {
        return el.username.includes(user);
    });

    database.getPlayersByFilter({ username: {'$regex': user, '$options': 'i'}, active: false }).then(function(data) {
        console.log(data);
        let olds = data.sort(function(a, b) { return b.score - a.score; });

        for (let i = 0; i < olds.length; i++) {
            olds[i].playerColor = colors[olds[i].color].core;
        }

        if (req.accepts("html")) {        
            res.render("players", { result: filtered, olds: olds });
        } else if (req.accepts("json")){
            res.json(filtered);
        } else {
            res.status(406).end();    //Not acceptable
        } 
    });
});

/** router for /players */
module.exports = router;