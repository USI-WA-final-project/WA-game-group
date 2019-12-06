class MapComposer {

    constructor(context, useOffScreen) {
        this.ctx = context;
        this.useOffScreen = useOffScreen;
    }

    /**
     * Draw the world grid
     *
     * @param worldW The width of the world
     * @param worldH The height of the world
     * @param canvasW The width of the canvas
     * @param canvasH The height of canvas
     * @param ctx Leave undefined - internal usage only
     */
    draw(worldW, worldH, canvasW, canvasH, ctx) {
        const width = worldW + canvasW;
        const height = worldH + canvasH;
        const lineW = worldW + (canvasW * 0.5);
        const lineH = worldH + (canvasH * 0.5);

        ctx.fillStyle = "#f1f2f3";
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = "#fafbfc";
        ctx.fillRect(canvasW / 2, canvasH / 2, worldW, worldH);

        ctx.strokeStyle = "rgba(0, 0, 0, 0.125)";
        ctx.lineWidth = 1;
        ctx.beginPath();

        // vertical grid lines
        for (let x = canvasW / 2; x <= lineW; x += 50) {
            ctx.moveTo(x, canvasH / 2);
            ctx.lineTo(x, lineH);
        }

        // horizontal grid lines
        for (let y = canvasH / 2; y <= lineH; y += 50) {
            ctx.moveTo(canvasW / 2, y);
            ctx.lineTo(lineW, y);
        }

        ctx.stroke();
        ctx.closePath();
    }

    /**
     * Prepare the world grid map
     *
     * @param worldW The width of the world
     * @param worldH The height of the world
     * @param canvasW The width of the canvas
     * @param canvasH The height of canvas
     */
    prepare(worldW, worldH, canvasW, canvasH) {
        const width = worldW + canvasW;
        const height = worldH + canvasH;

        let canvas;
        if (this.useOffScreen) {
            canvas = new OffscreenCanvas(width, height);
        } else {
            canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
        }
        const ctx = canvas.getContext("2d");
        this.draw(worldW, worldH, canvasW, canvasH, ctx);

        if (this.useOffScreen) {
            this.cached = ctx.getImageData(0, 0, width, height);
        } else {
            const img = new Image();
            img.src = canvas.toDataURL();
            this.cached = img;
        }
    }

    /**
     * Draw the cached grid image
     *
     * @param offset The offset for the image to simulate movement
     * @param canvasW The width of the canvas
     * @param canvasH The height of the canvas
     */
    drawCached(offset, canvasW, canvasH) {
        if (!this.cached) return;

        if (this.useOffScreen) {
            console.log(offset, this.cached.width, this.cached.height);
            // TODO: figure this out
            //       https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/putImageData
            this.ctx.putImageData(
                this.cached,
                0, // dest start x
                0, // dest start y
                offset.x, // src start x
                offset.y, // src start y
                canvasW - offset.x, // dest end x
                canvasH - offset.y // dest end y
            );
        } else {
            this.ctx.drawImage(this.cached, offset.x, offset.y, canvasW, canvasH, 0, 0, canvasW, canvasH);
        }
    }
}