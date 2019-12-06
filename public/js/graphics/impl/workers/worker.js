importScripts(
    "./../../composer/map_composer.js",
    "./../../composer/player_composer.js",
    "./../../composer/resources_composer.js"
);

const instance = {};

function assertReady() {
    if (instance.ctx && instance.composer) return true;

    console.warn("Worker has not been initialized");
    return false;
}

function setupCanvas(canvas, world) {
    instance.canvas = canvas;
    instance.ctx = canvas.getContext("2d");
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
        map: new MapComposer(instance.ctx, true),
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

function drawPlayers(players, colors) {
    if (!assertReady()) return;

    players.forEach((it) => {
        const color = colors[it.color];
        instance.composer.player.build(it.components, color, it.position);
    });
}

function drawResources(resources) {
    if (!assertReady()) return;

    instance.composer.resources.draw(resources);
}

function clearCanvas() {
    if (!assertReady()) return;

    instance.ctx.clearRect(0, 0, instance.canvas.width, instance.canvas.height);
}

onmessage = function (e) {
    switch (e.data.action) {
        case "setup":
            setupCanvas(e.data.canvas, e.data.world);
            break;
        case "update":
            updateCanvas(e.data.canvasSize);
            break;
        case "players":
            drawWorld(e.data.bgOffset);
            drawPlayers(e.data.players, e.data.playerColors);
            drawResources(e.data.resources);
            break;
        case "clear":
            clearCanvas();
            break;
        default:
            console.warn("Unknown data: " + e.data);
            break;
    }
};