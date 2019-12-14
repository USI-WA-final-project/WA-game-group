/** @module moments/router */
"use strict";

const express = require("express");
const router = express.Router();

const database = require("../../database.js");

const ImgurProvider = require("./imgur");

function sizeOf(base64) {
    return Buffer.from(base64.substring(base64.indexOf(",") + 1)).length;
}

async function markUploaded(item, provider) {
    item.uploaded[provider.index] = 1;

    // Do not save size (always computed at runtime)
    item.size = undefined;

    return await item.save();
}

async function upload(req, res, provider, id) {
    const item = await database.getMomentById(id);
    item.size = sizeOf(item.src);

    const result = await provider.upload(req, item);

    await markUploaded(item, provider);

    res.writeHead(result ? 200 : 500, "application/json");
    res.write(JSON.stringify({uploadedOn: provider.name, success: result}));
}

router.get("/", async (req, res) => {
    const data = await database.getAllMoments();
    res.status(200);
    if (req.accepts("html")) {
        res.render("moments", {result: data});
    } else {
        res.json(data);
    }
    res.end();
});

router.post("/imgur/:id", async (req, res) => {
    const id = req.params.id;
    await upload(req, res, ImgurProvider, id);
    res.end();
});

router.post("/twitter/:id", async (req, res) => {
    const id = req.params.id;
    await upload(req, res, TwitterProvider, id);
    res.end();
});

router.patch("/:id", async (req, res) => {
    const id = req.params.id;

    const data = {
        name: req.body.name,
        uploaded: req.body.uploaded
    };

    try {
        const saved = await database.updatePlayer(id, data);
        res.writeHead(200, "application/json");
        res.write(JSON.stringify({success: true, data: saved}));
    } catch (e) {
        console.error(e);
        res.writeHead(500, "application/json");
        res.write(JSON.stringify({success: false, message: "Failed to save item"}));
    }
    res.end();
});

router.post("/upload", async (req, res) => {
    const src = req.body.src;
    if (!src) {
        res.writeHead(400, "application/json");
        res.write(JSON.stringify({success: false, message: "Missing src parameter"}));
        res.end();
        return;
    }

    try {
        const saved = await database.addMoment({src: src});
        res.writeHead(200, "application/json");
        console.log("HELLO", JSON.stringify({success: true, data: saved}));
        res.write(JSON.stringify({success: true, data: saved}));
    } catch (e) {
        console.error(e);
        res.writeHead(500, "application/json");
        res.write(JSON.stringify({success: false, message: "Failed to save item"}));
    } finally {
        res.end();
    }
});

router.delete("/:id", async (req, res) => {
    const id = req.params.id;
    if (!id) {
        res.writeHead(400, "application/json");
        res.write(JSON.stringify({success: false, message: "Missing id parameter"}));
        res.end();
        return;
    }

    try {
        const removed = await database.removeMoment({_id: id});
        res.writeHead(200, "application/json");
        console.log("HELLO", JSON.stringify({success: true, data: removed}));
        res.write(JSON.stringify({success: true, data: removed}));
    } catch (e) {
        console.error(e);
        res.writeHead(500, "application/json");
        res.write(JSON.stringify({success: false, message: "Failed to remove item"}));
    } finally {
        res.end();
    }
});

/** router for /moments */
module.exports = router;