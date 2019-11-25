/** @module stats/router */
'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

require('../../models/Stats');
const Stats = mongoose.model('Stats');


//Display all stats
router.get('/', function(req, res) {
    Stats.find({}).then(function(found) {
        if (req.accepts("html")){
            res.render("stats", {result: found});
        } else if (req.accepts("json")){
            res.json(found);
        } else {
            res.status(406).end();    //Not acceptable
        }
    }).catch(function(err) {
        console.log(err.message);
        res.status(500).end();
    });
});

/** router for /stats */
module.exports = router;