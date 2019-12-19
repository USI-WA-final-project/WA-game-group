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
    res.writeHead(200, {
        'Content-Type': 'text/html',
    });
    res.write(`<div style="text-align:center;">
        <video style="max-width:80%;max-height:80%;outline:none;" controls>
            <source src="/media/demo.mp4" type="video/mp4">
        </video>
    </div>`);
    res.end();
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
