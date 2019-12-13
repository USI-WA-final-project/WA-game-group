class WorkersImpl extends Graphics {

    constructor() {
        super();
        this.worker = new Worker("/js/graphics/impl/workers/worker.js");
        this.worker.onerror = (e) => {
            throw e;
        };
    }

    /**
     * Send a canvas.
     *
     * @param mapCanvas The canvas
     * @param minCanvas The canvas
     */
    setCanvas(mapCanvas, minCanvas) {
        this.canvas = mapCanvas.transferControlToOffscreen();
        this.minCanvas = minCanvas.transferControlToOffscreen();
        this.worker.postMessage({
                action: "setup",
                canvas: this.canvas,
                minCanvas: this.minCanvas,
                world: this.world,
            },
            [
                this.canvas,
                this.minCanvas
            ]);
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
        this.worker.postMessage({
            action: "update",
            canvasSize: {
                width: width,
                height: height
            }
        });
    }

    /**
     * Draw all the players
     *
     * @param players All the players
     * @param playerColors All the players colors
     * @param resources All the resources
     */
    drawContents(players, playerColors, resources) {
        this.worker.postMessage({
            action: "contents",
            players: players,
            playerColors: playerColors,
            bgOffset: this.offset,
            resources: resources
        });
    }

    /**
     * Draw the world grid background
     */
    drawBackground(offset = undefined) {
        this.offset = offset;
    }

    /**
     * Clear the canvas
     */
    clearCanvas() {
        // Do nothing
    }

    /**
     * Get canvas context for drawing.
     * This <b>MUST</b> never be called from app.js
     */
    getContext() {
        this.canvas.getContext("2d");
    }
}