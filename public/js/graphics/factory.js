/**
 * This class provides the right implementation
 * for the graphic stack depending on whether
 * OffScreenCanvas is supported by the browser
 */
class GraphicsFactory {

    static provideImplementation() {
        return new DefaultImpl();
        // return this.isOffscreenCanvasSupported() ? new WorkersImpl() : new DefaultImpl();
    }

    static isOffscreenCanvasSupported() {
        return typeof OffscreenCanvas === "function" && 
            HTMLCanvasElement.prototype.transferControlToOffscreen !== undefined;
    }
}