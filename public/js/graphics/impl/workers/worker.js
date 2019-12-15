importScripts(
    "./../../composer/map_composer.js",
    "./../../composer/player_composer.js",
    "./../../composer/resources_composer.js"
);

const instance = {};

function assertReady() {
    if (instance.ctx && instance.composer && instance.world) return true;

    console.warn("Worker has not been initialized");
    return false;
}

function setupCanvas(canvas, minCanvas, world) {
    instance.canvas = canvas;
    instance.ctx = canvas.getContext("2d");
    instance.minCtx = minCanvas.getContext("2d");
    instance.world = world;

    updateCanvas({width: canvas.width, height: canvas.height});
}

function updateCanvas(canvasSize) {
    instance.canvas.width = canvasSize.width;
    instance.canvas.height = canvasSize.height;

    const center = {
        x: canvasSize.width / 2,
        y: canvasSize.height / 2
    };

    instance.composer = {
        map: new MapComposer(instance.ctx,  instance.minCtx, true),
        player: new PlayerComposer(instance.ctx, center),
        resources: new ResourcesComposer(instance.ctx)
    };

    instance.composer.map.prepare(
        instance.world.width,
        instance.world.height,
        canvasSize.width,
        canvasSize.height
    );
}

function drawWorld(offset) {
    if (!assertReady()) return;

    instance.composer.map.drawCached(
        offset,
        instance.canvas.width,
        instance.canvas.height
    );
}

function drawMinMap(playerPosition, playerColor, resources) {
    if (!assertReady()) return;

    instance.composer.map.drawMiniMap(
        instance.world.width,
        instance.world.height,
        playerColor,
        playerPosition,
        resources
    )
}

function drawPlayers(players, colors, bgOffset, resources) {
    if (!assertReady()) return;

    players.forEach((it) => {
        const color = colors[it.color];
        instance.composer.player.build(it.components, color, it.position);

        if (it.position.x === 0 && it.position.y === 0) {
            drawMinMap(bgOffset, color, resources);
        }
    });
}

function drawResources(resources) {
    if (!assertReady()) return;

    const center = {
        x: instance.canvas.width / 2,
        y: instance.canvas.height / 2
    };
    instance.composer.resources.draw(center, resources);
}

function clearCanvas() {
    if (!assertReady()) return;

    instance.ctx.clearRect(0, 0, instance.canvas.width, instance.canvas.height);
}

function takeSnapshot() {
    if (!assertReady()) return;

    const data = instance.ctx.getImageData(0, 0, instance.canvas.width, instance.canvas.height);
    self.postMessage({
        action: "snapshotResult",
        result: data
    });
}

onmessage = function (e) {
    switch (e.data.action) {
        case "setup":
            setupCanvas(e.data.canvas, e.data.minCanvas, e.data.world);
            break;
        case "update":
            updateCanvas(e.data.canvasSize);
            break;
        case "contents":
            clearCanvas();
            drawWorld(e.data.bgOffset);
            drawPlayers(e.data.players, e.data.playerColors, e.data.bgOffset, e.data.resources);
            drawResources(e.data.resources);
            break;
        case "snapshot":
            takeSnapshot();
            break;
        case "snapshotResult":
            // Ignore
            break;
        default:
            console.warn("Unknown data: " + e.data);
            break;
    }
};