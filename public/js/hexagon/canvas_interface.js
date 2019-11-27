class CanvasInterface {
    constructor(canvas) {
        if (canvas.tagName !== 'CANVAS') {
            throw "Argument is not a Canvas";
        }

        const dpi = window.devicePixelRatio / 3;
        const height = +getComputedStyle(canvas).getPropertyValue("height").slice(0, -2);
        const width = +getComputedStyle(canvas).getPropertyValue("width").slice(0, -2);

        canvas.setAttribute("height", height * dpi);
        canvas.setAttribute("width", width * dpi);
        this.internalCanvas = canvas;
    }

    getContext() {
        return this.internalCanvas.getContext('2d');
    }

    getCenter() {
        return {
            x: this.internalCanvas.width / 2,
            y: this.internalCanvas.height / 2
        }
    }
}
