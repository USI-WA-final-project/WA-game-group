/** @module players/router */
'use strict';

const express = require('express');
const router = express.Router();

const database = require('../../database.js');

//Display all players
router.get('/', function(req, res) {
    let arr = req.app.locals.players;

    for (let i = 0; i < arr.length; i++) {
        arr[i].playerColor = req.app.locals.playerColors[arr[i].color].core;
        arr[i].score = arr[i].kills + arr[i].resources;
    }

    if (req.accepts("html")) {        
        res.render("players", { result: arr });
    } else if (req.accepts("json")){
        res.json(arr);
    } else {
        res.status(406).end();    //Not acceptable
    }     
});

router.get('/search', function(req, res) {
    const filter = {};
    if (req.query.name) {
        filter.username = {'$regex': req.query.name, '$options': 'i'};
    }

    //get the filtered data from Mongodb
    database.getPlayersByFilter(filter).then(function(found) {
        if (req.accepts("html")) {
            for (let i = 0; i < found.length; i++) {
                found[i].playerColor = req.app.locals.playerColors[found[i].color].core;
            }
            res.render("players", { result: found });
        } else {
            res.json(found);
        }
    }).catch(function(err) {
        res.status(500).end();
    });
});

/** router for /players */
module.exports = router;