/** @module players/router */
'use strict';

const express = require('express');
const router = express.Router();
const database = require('../../database.js');

//Display all players
router.get('/', function(req, res) {
    let colors = req.app.locals.worldData.colors;
    let players = req.app.locals.players.sort(function(a, b) { return b.score - a.score; });
    console.log(players);

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
    let playersArr = req.app.locals.players;
    let user = req.query.name;

    for (let i = 0; i < playersArr.length; i++) {
        playersArr[i].playerColor = colors[playersArr[i].color].core;
    }

    let filtered = playersArr.filter(function(el) {
        return el.username.toLowerCase().includes(user.toLowerCase());
    });

    database.getPlayersByFilter({ username: {'$regex': user, '$options': 'i'}, active: false }).then(function(data) {
        let sortFunction;

        if (req.query.kills) {
            sortFunction = function(a, b) { return b.kills - a.kills; }
        } else if (req.query.resources) {
            sortFunction = function(a, b) { return b.resources - a.resources; }
        } else if (req.query.parts) {
            sortFunction = function(a, b) { return b.parts - a.parts; }
        } else {
            sortFunction = function(a, b) { return b.score - a.score; };
        }

        let olds = data.sort(sortFunction);
        let players = filtered.sort(sortFunction);

        for (let i = 0; i < olds.length; i++) {
            olds[i].playerColor = colors[olds[i].color].core;
        }

        if (req.accepts("html")) {        
            res.render("players", { result: players, olds: olds });
        } else if (req.accepts("json")){
            res.json({ result: players, olds: olds });
        } else {
            res.status(406).end();    //Not acceptable
        } 
    });
});

/** router for /players */
module.exports = router;