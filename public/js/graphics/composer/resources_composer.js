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
    draw(originPoint, resources) {
        //console.log(resources);
        resources.forEach((it) => {
            this.ctx.beginPath();
            let sat = 1;
            let radius = Math.floor(it.amount/10)+5;
            if (it.amount > 235) {
                sat = it.amount - 235 / 500;
                radius = 28;
            }
            this.ctx.fillStyle = "rgba(238, 226, 221, 1)";
            this.ctx.strokeStyle = RESOURCES_STROKE_COLOR;
            this.ctx.arc(originPoint.x + it.position.x, originPoint.y + it.position.y, radius, 0, 360);

            this.ctx.fill();
            this.ctx.stroke();
        })
    }
}