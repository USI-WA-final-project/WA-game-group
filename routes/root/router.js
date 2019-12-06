/** @module root/router */

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    // TODO: send something
    res.render('index');
    res.end();
});

router.get('/help', (req, res) => {
    // TODO: send something
    res.render('help_page');
    res.end();
});

/** router for /root */
module.exports = router;
