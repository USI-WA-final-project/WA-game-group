class DefaultImpl extends Graphics {

    constructor() {
        super();
    }

    /**
     * Send a canvas.
     *
     * This will trigger the update of the canvas, the composers
     * and the world grid to match the new size.
     *
     * @param mapCanvas The canvas
     * @param minCanvas The canvas
     */
    setCanvas(mapCanvas, minCanvas) {
        this.canvas = mapCanvas;
        this.ctx = mapCanvas.getContext("2d");
        this.minCtx = minCanvas.getContext("2d");

        this.updateCanvas(mapCanvas.width, mapCanvas.height);
    }

    /**
     * Update a canvas.
     *
     * This will trigger the update of the canvas, the composers
     * and the world grid to match the new size.
     *
     * @param width The width of the canvas
     * @param height The height of the canvas
     */
    updateCanvas(width, height) {
        this.canvas.setAttribute("width", width);
        this.canvas.setAttribute("height", height);

        this.center = {
            x: width / 2,
            y: height / 2
        };

        this.composer = {
            map: new MapComposer(this.ctx, this.minCtx, false),
            player: new PlayerComposer(this.ctx, this.center),
            resources: new ResourcesComposer(this.ctx)
        };

        this.composer.map.prepare(this.world.width, this.world.height, width, height);
    }

    /**
     * Draw all the contents
     *
     * @param players All the players
     * @param playerColors All the players colors
     * @param resources All the resources
     */
    drawContents(players, playerColors, resources) {
        players.forEach((it) => {
            const color = playerColors[it.color];
            this.composer.player.build(it.components, color, it.position);

            if (it.position.x === 0 && it.position.y === 0) {
                // It's a-me, Mario
                this.composer.map.drawMiniMap(this.world.width, this.world.height, color.core, this.offset, resources);
            }
        });

        this.composer.resources.draw(this.center, resources);
    }

    /**
     * Draw the world grid background
     */
    drawBackground(offset) {
        this.offset = offset;
        this.composer.map.drawCached(offset, this.canvas.width, this.canvas.height);
    }

    /**
     * Clear the canvas
     */
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Take a snapshot of the world for sharing
     *
     * @param callback: Callback to be executed once a snapshot has been acquired
     */
    requestSnapshot(callback) {
        const snapshot = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        callback(snapshot);
    }
}