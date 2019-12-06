/**
 * Base class that defines the behaviours of the Graphic implementations.
 * The class App (app.js) shall only use methods included in this class
 * according to the respective documentation.
 *
 * {@see }
 */
class Graphics {

    /**
     * Set a canvas.
     *
     * @param canvas The canvas
     */
    setCanvas(canvas) {
        throw "This function has not been implemented";
    }

    /**
     * Update a canvas.
     *
     * This will trigger the update of the canvas, the composers
     * and the world grid to match the new size.
     *
     * @param canvas The canvas
     */
    updateCanvas(canvas) {
        throw "This function has not been implemented";
    }

    /**
     * Draw all the players
     *
     * @param players All the players
     * @param colors All the colors
     */
    drawPlayers(players, colors) {
        players.forEach((it) => {
            const color = colors[it.color];
            this.drawPlayer(it.components, color, it.position);
        });
    }

    /**
     * Draw a player
     *
     * @param body The player data
     * @param color The player's color
     * @param position The player's position (defaults to undefined for "own" player)
     */
    drawPlayer(body, color, position = undefined) {
        throw "This function has not been implemented";
    }

    /**
     * Draw the world grid
     */
    drawGrid(offset) {
        throw "This function has not been implemented";
    }

    /**
     * Clear the canvas
     */
    clearCanvas() {
        throw "This function has not been implemented";
    }

    /**
     * Get canvas context for drawing.
     * This <b>MUST</b> never be called from app.js
     */
    getContext() {
        throw "This function has not been implemented";
    }

    /**
     * Get the center of the canvas.
     */
    getCenter() {
        throw "This function has not been implemented";
    }

    /**
     * Get the center of a cell attached to the side of an hexagon
     *
     * @param currCenter The "parent" hexagon's center
     * @param childSide The side of the parent where child is anchored
     * @returns {{x: number, y: number}}
     */
    getNextCenter(currCenter, childSide) {
        if (childSide < 0 || childSide > 5)
            throw "Child position must be between 0 and 5";

        switch (childSide) {
            case 0:
                return {x: currCenter.x - 24, y: currCenter.y - 14};
            case 1:
                return {x: currCenter.x, y: currCenter.y - 28};
            case 2:
                return {x: currCenter.x + 24, y: currCenter.y - 14};
            case 3:
                return {x: currCenter.x + 24, y: currCenter.y + 14};
            case 4:
                return {x: currCenter.x, y: currCenter.y + 28};
            case 5:
                return {x: currCenter.x - 24, y: currCenter.y + 14};
        }
    }

    /**
     * Set the world size
     *
     * @param width The width of the world
     * @param height The height of the world
     */
    setWorldSize(width, height) {
        this.world = {
            width: width,
            height: height
        };
    }
}