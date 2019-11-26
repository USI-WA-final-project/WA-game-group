class CanvasInterface {
    constructor(canvas) {
        if (canvas.tagName !== 'CANVAS') {
            throw "Argument is not a Canvas";
        }

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
