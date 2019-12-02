/** @module players/router */
'use strict';

const express = require('express');
const router = express.Router();

// const database = require('../../database.js');

//Display all favorites
router.get('/', function(req, res) {
    // database.getAll()
    // .then(function(results) {
        if (req.accepts("html")) {
            res.render("favorites");
        } else if (req.accepts("json")){
            res.json();
        } else {
            res.status(406).end();    //Not acceptable
        } 
    });      
// });

/** router for /favorites */
module.exports = router;