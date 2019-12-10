class MapComposer {

    constructor(mapCtx, minCtx, useOffScreen) {
        this.ctx = mapCtx;
        this.minCtx = minCtx;
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
            this.ctx.putImageData(this.cached, -offset.x, -offset.y,
                offset.x, offset.y, canvasW, canvasH);
        } else {
            this.ctx.drawImage(this.cached, offset.x, offset.y,
                canvasW, canvasH, 0, 0, canvasW, canvasH);
        }
    }

    drawMiniMap(worldW, worldH, playerPosition, resources) {
        const width = this.minCtx.canvas.width;
        const height = this.minCtx.canvas.height;
        const offsetX = (width - height) / 2;

        const viewRay = (height / worldW) * 100;

        const posX = (height / worldW) * playerPosition.x;
        const posY = (height / worldH) * playerPosition.y;

        this.minCtx.clearRect(0, 0, width, height);

        this.minCtx.fillStyle = "#f1f2f3";
        this.minCtx.fillRect(offsetX, 0, height, height);

        // Player
        this.minCtx.beginPath();
        this.minCtx.fillStyle = "#3b4043";
        this.minCtx.strokeStyle = "#121314";

        this.minCtx.arc(offsetX + posX, posY, 3, 0, 360);
        this.minCtx.fill();
        this.minCtx.stroke();
        this.minCtx.closePath();

        this.minCtx.beginPath();
        this.minCtx.strokeStyle = "#121314";
        this.minCtx.arc(offsetX + posX, posY, viewRay, 0, 360);

        this.minCtx.stroke();
        this.minCtx.closePath();

        resources.forEach((it) => {
            let x = offsetX + posX + (width / worldW) * it.position.x;
            let y = posY + (height / worldH) * it.position.y;
            let distance = Math.sqrt(Math.pow(posX - x, 2) + Math.pow(posY - y, 2));
            if (distance <= viewRay) {
                this.minCtx.beginPath();
                this.minCtx.fillStyle = "#8c9096";
                this.minCtx.arc(x, y, 2, 0, 360);
                this.minCtx.fill();
                this.minCtx.closePath();
            }
        });

    }
}