/** @module root/router */

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    let worldData = res.app.locals.worldData;
    
    res.render('index', { worldData });
    res.end();
});

router.get('/help', (req, res) => {
    res.render('help_page');
    res.end();
});

router.get('/demo', (req, res) => {
    res.status(301).redirect("https://youtu.be/pu-7xPSx81U");
});

/* Unwanted */
[
    "/wp-login",
    "/wp-login.php",
    "/wp-admin",
    "/wp-admin.php",
    "/admin",
    "/admin.php",
    "/cpanel",
    "/cpanel.php",
    "/siena"
].forEach((url) => (router.get(url, (req, res) => {
    res.status(301).redirect("https://bit.ly/IqT6zt");
})));

/** router for /root */
module.exports = router;
