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

router.get('/search', function(req, res) {
    
    const filter = {};
    if (req.query.name) {
        filter.name = {'$regex': req.query.name, '$options': 'i'};
    }

    //get the filtered date from Mongodb
    Favorite.find(filter).then(function(found) {
        //console.log(found);

        if (req.accepts("html")) {
            res.render("favorites", { result: found });
        } else {
            res.json(found);
        }
    }).catch(function(err) {
        res.status(500).end();
    });
});

/** router for /players */
module.exports = router;