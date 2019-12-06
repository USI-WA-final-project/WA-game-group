const RESOURCES_FILL_COLOR = "#603D3033";
const RESOURCES_STROKE_COLOR = "#603D30";

class ResourcesComposer {

    /**
     * The Resources composer
     *
     * @param ctx The context of the canvas
     */
    constructor(ctx) {
        this.ctx = ctx;
    }

    /**
     * Draw the resources
     *
     * @param resources A list of points {{x: Number, y: Number}}
     */
    draw(resources) {
        resources.forEach((it) => {
            this.ctx.beginPath();
            this.ctx.fillStyle = RESOURCES_FILL_COLOR;
            this.ctx.strokeStyle = RESOURCES_STROKE_COLOR;

            this.ctx.arc(it.x, it.y, 6, 0, 360);

            this.ctx.fill();
            this.ctx.stroke();
        })
    }
}