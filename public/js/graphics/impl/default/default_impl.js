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
     * @param canvas The canvas
     */
    setCanvas(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.composer = {
            map: new MapComposer(this.ctx, false),
            player: new PlayerComposer(this.ctx, this.getCenter())
        };

        this.composer.map.prepare(this.world.width, this.world.height, canvas.width, canvas.height);
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
    }

    /**
     * {@inheritDoc}
     */
    drawPlayer(body, color, position = undefined) {
        this.composer.player.build(body, color, position);
    }

    /**
     * Draw the world grid
     */
    drawGrid(offset) {
        this.composer.map.drawCached(offset, this.canvas.width, this.canvas.height);
    }

    /**
     * Clear the canvas
     */
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Get canvas context for drawing.
     * This <b>MUST</b> never be called from app.js
     */
    getContext() {
        this.canvas.getContext("2d");
    }

    /**
     * Get the center of the canvas.
     */
    getCenter() {
        return {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2
        };
    }

}