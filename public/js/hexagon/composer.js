const CHILD_TYPE_FREE = -1;
const CHILD_TYPE_CELL = 0;
const CHILD_TYPE_SPIKE = 1;
const CHILD_TYPE_SHIELD = 2;

const STATUS_TO_VISIT = undefined;
const STATUS_VISITING = 0;
const STATUS_VISITED = 1;

class Composer {

    /**
     * The player composer.
     *
     * See the documentation in <b>docs/client/characters</b> for more info.
     *
     * @param canvasInterface A {@link CanvasInterface}
     */
    constructor(canvasInterface) {
        this.canvasInterface = canvasInterface;
        this.colors = {
            spike: SPIKE_COLOR,
            shield: SHIELD_COLOR,
        }
    }

    /**
     * Draw a player to the canvas
     *
     * @param obj the object that represents the character
     * @param color the color of the character
     * @param deltaPosition the delta of the position from the center
     */
    build(obj, color, deltaPosition = undefined) {
        this.colors.cell = color;
        const ctx = this.canvasInterface.getContext();
        const screenCenter = this.canvasInterface.getCenter();
        const center = deltaPosition ? {
            x: screenCenter.x + deltaPosition.x,
            y: screenCenter.y + deltaPosition.y
        } : screenCenter;

        const begin = {
            x: center.x - 8,
            y: center.y - 14
        };

        this.visited = {};

        this.drawHexagon0(obj, 0, ctx, begin, center, true);
        ctx.fillStyle = color.body;
    }

    /* Hexagon */

    initHexagon(index, ctx, isCore = false) {
        if (this.visited[index] !== STATUS_TO_VISIT) return false;
        this.visited[index] = STATUS_VISITING;

        ctx.beginPath();
        ctx.fillStyle = isCore ? this.colors.cell.core : this.colors.cell.child;
        return true;
    }

    finalizeHexagon(obj, index, ctx, begin, center) {
        ctx.closePath();
        ctx.fill();

        this.drawHexagonFaces(obj, index, ctx, begin, center);
        this.visited[index] = STATUS_VISITED;
    }

    drawHexagon0(obj, index, ctx, begin, center, isCore = false) {
        if (!this.initHexagon(index, ctx, isCore)) return;

        ctx.moveTo(begin.x, begin.y); // M 8 2
        ctx.lineTo(begin.x - 8, begin.y + 14); // l -8 14
        ctx.lineTo(begin.x, begin.y + 28); // l 8 14
        ctx.lineTo(begin.x + 16, begin.y + 28); // l 16 0
        ctx.lineTo(begin.x + 24, begin.y + 14); // l 8 -14
        ctx.lineTo(begin.x + 16, begin.y); // l -8 -14
        ctx.lineTo(begin.x, begin.y); // l -16 0

        if (isCore) {
            ctx.closePath();
            ctx.fill();

            // "Core circle"
            ctx.beginPath();
            ctx.fillStyle = this.colors.cell.child; // 30% white
            ctx.arc(center.x, center.y, 10, 0, 360)
        }

        this.finalizeHexagon(obj, index, ctx, begin, center);
    }

    drawHexagon1(obj, index, ctx, begin, center) {
        if (!this.initHexagon(index, ctx)) return;

        ctx.moveTo(begin.x, begin.y); // M 24 2
        ctx.lineTo(begin.x - 16, begin.y); // l -16 0
        ctx.lineTo(begin.x - 24, begin.y + 14); // l -8 14
        ctx.lineTo(begin.x - 16, begin.y + 28); // l 8 14
        ctx.lineTo(begin.x, begin.y + 28); // l 16 0
        ctx.lineTo(begin.x + 8, begin.y + 14); // l 8 -14
        ctx.lineTo(begin.x, begin.y); // l -8 -14

        this.finalizeHexagon(obj, index, ctx, begin, center);
    }

    drawHexagon2(obj, index, ctx, begin, center) {
        if (!this.initHexagon(index, ctx)) return;

        ctx.moveTo(begin.x, begin.y); // M 32 16
        ctx.lineTo(begin.x - 8, begin.y - 14); // l -8 -14
        ctx.lineTo(begin.x - 24, begin.y - 14); // l -16 0
        ctx.lineTo(begin.x - 32, begin.y); // l -8 14
        ctx.lineTo(begin.x - 24, begin.y + 14); // l 8 14
        ctx.lineTo(begin.x - 8, begin.y + 14); // l 16 0
        ctx.lineTo(begin.x, begin.y); // l 8 -14

        this.finalizeHexagon(obj, index, ctx, begin, center);
    }

    drawHexagon3(obj, index, ctx, begin, center) {
        if (!this.initHexagon(index, ctx)) return;

        ctx.moveTo(begin.x, begin.y); // M 24 30
        ctx.lineTo(begin.x + 8, begin.y - 14); // l 8 -14
        ctx.lineTo(begin.x, begin.y - 28); // l -8 -14
        ctx.lineTo(begin.x - 16, begin.y - 28); // l -16 0
        ctx.lineTo(begin.x - 24, begin.y - 14); // l -8 14
        ctx.lineTo(begin.x - 16, begin.y); // l 8 14
        ctx.lineTo(begin.x, begin.y); // l 16 0

        this.finalizeHexagon(obj, index, ctx, begin, center);
    }

    drawHexagon4(obj, index, ctx, begin, center) {
        if (!this.initHexagon(index, ctx)) return;

        ctx.moveTo(begin.x, begin.y); // M 8 30
        ctx.lineTo(begin.x + 16, begin.y); // l 16 0
        ctx.lineTo(begin.x + 24, begin.y - 14); // l 8 -14
        ctx.lineTo(begin.x + 16, begin.y - 28); // l -8 -14
        ctx.lineTo(begin.x, begin.y - 28); // l -16 0
        ctx.lineTo(begin.x - 8, begin.y - 14); // l -8 14
        ctx.lineTo(begin.x, begin.y); // l 8 14

        this.finalizeHexagon(obj, index, ctx, begin, center);
    }

    drawHexagon5(obj, index, ctx, begin, center) {
        if (!this.initHexagon(index, ctx)) return;

        ctx.moveTo(begin.x, begin.y); // M 0 16
        ctx.lineTo(begin.x + 8, begin.y + 14); // l 8 14
        ctx.lineTo(begin.x + 24, begin.y + 14); // l 16 0
        ctx.lineTo(begin.x + 32, begin.y); // l 8 -14
        ctx.lineTo(begin.x + 24, begin.y - 14); // l -8 -14
        ctx.lineTo(begin.x + 8, begin.y - 14); // l -16 0
        ctx.lineTo(begin.x, begin.y); // l -8 14

        this.finalizeHexagon(obj, index, ctx, begin, center);
    }

    drawHexagonFaces(obj, index, ctx, begin, center) {
        if (!obj[index].faces) return;

        for (let i = 0; i < 6; i++) {
            const childIndex = obj[index].faces[i];
            if (childIndex < 0) continue;

            const nextCenter = this.getNextCenter(center, i);
            const nextPerkBegin = this.getNextPerkBegin(center, i);
            const nextCellBegin = this.getNextCellBegin(center, i);

            this.drawHexagonChild(obj, childIndex, i, ctx, nextPerkBegin, nextCellBegin, nextCenter);
        }
    }

    drawHexagonChild(obj, index, side, ctx, perkBegin, cellBegin, center) {
        if (index < 0) return;
        const type = obj[index].type;

        if (type === CHILD_TYPE_FREE) return;
        if (type === CHILD_TYPE_CELL) {
            switch (side) {
                case 0:
                    return this.drawHexagon0(obj, index, ctx, cellBegin, center);
                case 1:
                    return this.drawHexagon1(obj, index, ctx, cellBegin, center);
                case 2:
                    return this.drawHexagon2(obj, index, ctx, cellBegin, center);
                case 3:
                    return this.drawHexagon3(obj, index, ctx, cellBegin, center);
                case 4:
                    return this.drawHexagon4(obj, index, ctx, cellBegin, center);
                case 5:
                    return this.drawHexagon5(obj, index, ctx, cellBegin, center);
            }
        }
        if (type === CHILD_TYPE_SPIKE) {
            switch (side) {
                case 0:
                    return this.drawSpike0(ctx, perkBegin);
                case 1:
                    return this.drawSpike1(ctx, perkBegin);
                case 2:
                    return this.drawSpike2(ctx, perkBegin);
                case 3:
                    return this.drawSpike3(ctx, perkBegin);
                case 4:
                    return this.drawSpike4(ctx, perkBegin);
                case 5:
                    return this.drawSpike5(ctx, perkBegin);
            }
        }
        if (type === CHILD_TYPE_SHIELD) {
            switch (side) {
                case 0:
                    return this.drawShield0(ctx, perkBegin);
                case 1:
                    return this.drawShield1(ctx, perkBegin);
                case 2:
                    return this.drawShield2(ctx, perkBegin);
                case 3:
                    return this.drawShield3(ctx, perkBegin);
                case 4:
                    return this.drawShield4(ctx, perkBegin);
                case 5:
                    return this.drawShield5(ctx, perkBegin);
            }
        }
    }

    /* Spike */

    drawSpike0(ctx, begin) {
        ctx.beginPath();
        ctx.fillStyle = this.colors.spike;

        ctx.moveTo(begin.x, begin.y); // M 8 2
        ctx.lineTo(begin.x - 8, begin.y + 14); // l -8 14
        ctx.lineTo(begin.x - 21, begin.y - 3); // l -13 -17
        ctx.lineTo(begin.x, begin.y); // l 21 3
        ctx.closePath();
        ctx.fill();
    }

    drawSpike1(ctx, begin) {
        ctx.beginPath();
        ctx.fillStyle = this.colors.spike;

        ctx.moveTo(begin.x, begin.y); // M 24 2
        ctx.lineTo(begin.x - 16, begin.y); // l -16 0
        ctx.lineTo(begin.x - 8, begin.y - 16); // l 8 -16
        ctx.lineTo(begin.x, begin.y); // l 8 16
        ctx.closePath();
        ctx.fill();
    }

    drawSpike2(ctx, begin) {
        ctx.beginPath();
        ctx.fillStyle = this.colors.spike;

        ctx.moveTo(begin.x, begin.y); // M 32 16
        ctx.lineTo(begin.x - 8, begin.y - 14); // l -8 -14
        ctx.lineTo(begin.x + 13, begin.y - 17); // l 21 -3
        ctx.lineTo(begin.x, begin.y); // l -13 17
        ctx.closePath();
        ctx.fill();
    }

    drawSpike3(ctx, begin) {
        ctx.beginPath();
        ctx.fillStyle = this.colors.spike;

        ctx.moveTo(begin.x, begin.y); // M 24 30
        ctx.lineTo(begin.x + 8, begin.y - 14); // l 8 -14
        ctx.lineTo(begin.x + 21, begin.y + 3); // l 13 17
        ctx.lineTo(begin.x, begin.y); // l -21 -3
        ctx.closePath();
        ctx.fill();
    }

    drawSpike4(ctx, begin) {
        ctx.beginPath();
        ctx.fillStyle = this.colors.spike;

        ctx.moveTo(begin.x, begin.y); // M 8 30
        ctx.lineTo(begin.x + 16, begin.y); // l 16 0
        ctx.lineTo(begin.x + 8, begin.y + 14); // l -8 14
        ctx.lineTo(begin.x, begin.y); // l -8 -14
        ctx.closePath();
        ctx.fill();
    }

    drawSpike5(ctx, begin) {
        ctx.beginPath();
        ctx.fillStyle = this.colors.spike;

        ctx.moveTo(begin.x, begin.y); // M 0 16
        ctx.lineTo(begin.x + 8, begin.y + 14); // l 8 14
        ctx.lineTo(begin.x - 13, begin.y + 17); // l -21 3
        ctx.lineTo(begin.x, begin.y); // l 13 -17
        ctx.closePath();
        ctx.fill();
    }

    /* Shield */

    drawShield0(ctx, begin) {
        ctx.beginPath();
        ctx.fillStyle = this.colors.shield;

        ctx.moveTo(begin.x, begin.y); // M 8 2
        ctx.lineTo(begin.x - 8, begin.y + 14); // l -8 14
        ctx.lineTo(begin.x - 9.75, begin.y + 13); // l -1.75 -1
        ctx.lineTo(begin.x - 1.75, begin.y - 1); // l 8 -14
        ctx.lineTo(begin.x, begin.y); // l 1.75 1
        ctx.closePath();
        ctx.fill();
    }

    drawShield1(ctx, begin) {
        ctx.beginPath();
        ctx.fillStyle = this.colors.shield;

        ctx.moveTo(begin.x, begin.y); // M 24 2
        ctx.lineTo(begin.x, begin.y - 2); // l 0 -2
        ctx.lineTo(begin.x - 16, begin.y - 2); // l -16 0
        ctx.lineTo(begin.x - 16, begin.y); // l 0 2
        ctx.lineTo(begin.x, begin.y); // l 16 0
        ctx.closePath();
        ctx.fill();
    }

    drawShield2(ctx, begin) {
        ctx.beginPath();
        ctx.fillStyle = this.colors.shield;

        ctx.moveTo(begin.x, begin.y); // M 32 16
        ctx.lineTo(begin.x + 1.75, begin.y - 1); // l 1.75 -1
        ctx.lineTo(begin.x - 6.25, begin.y - 15); // l -8 -14
        ctx.lineTo(begin.x - 8, begin.y - 14); // l -1.75 1
        ctx.lineTo(begin.x, begin.y); // l 8 14
        ctx.closePath();
        ctx.fill();
    }

    drawShield3(ctx, begin) {
        ctx.beginPath();
        ctx.fillStyle = this.colors.shield;

        ctx.moveTo(begin.x, begin.y); // M 24 30
        ctx.lineTo(begin.x + 1.75, begin.y + 1); // l 1.75 1
        ctx.lineTo(begin.x + 9.75, begin.y - 13); // l 8 -14
        ctx.lineTo(begin.x + 8, begin.y - 14); // l -1.75 -1
        ctx.lineTo(begin.x, begin.y); // l -8 14
        ctx.closePath();
        ctx.fill();
    }

    drawShield4(ctx, begin) {
        ctx.beginPath();
        ctx.fillStyle = this.colors.shield;

        ctx.moveTo(begin.x, begin.y); // M 8 30
        ctx.lineTo(begin.x, begin.y + 2); // l 0 2
        ctx.lineTo(begin.x + 16, begin.y + 2); // l 16 0
        ctx.lineTo(begin.x + 16, begin.y); // l 0 -2
        ctx.lineTo(begin.x, begin.y); // l -16 0
        ctx.closePath();
        ctx.fill();
    }

    drawShield5(ctx, begin) {
        ctx.beginPath();
        ctx.fillStyle = this.colors.shield;

        ctx.moveTo(begin.x, begin.y); // M 0 16
        ctx.lineTo(begin.x - 1.75, begin.y + 1); // l -1.75 1
        ctx.lineTo(begin.x + 6.75, begin.y + 15); // l 8 14
        ctx.lineTo(begin.x + 8, begin.y + 14); // l 1.75 -1
        ctx.lineTo(begin.x, begin.y); // l -8 -14
        ctx.closePath();
        ctx.fill();
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

    getNextPerkBegin(center, newSide) {
        switch (newSide) {
            case 0:
                // [16, 16] -> [8, 2]
                return {x: center.x - 8, y: center.y - 14};
            case 1:
                // [16, 16] -> [24, 2]
                return {x: center.x + 8, y: center.y - 14};
            case 2:
                // [16, 16] -> [32, 16]
                return {x: center.x + 16, y: center.y};
            case 3:
                // [16, 16] -> [24, 30]
                return {x: center.x + 8, y: center.y + 14};
            case 4:
                // [16, 16] -> [8, 30]
                return {x: center.x - 8, y: center.y + 14};
            case 5:
                // [16, 16] -> [0, 16]
                return {x: center.x - 16, y: center.y};
            default:
                return center;
        }
    }

    getNextCellBegin(center, newSide) {
        switch (newSide) {
            case 0:
                // [16, 16] -> [24, 30]
                return {x: center.x - 32, y: center.y - 28};
            case 1:
                // [16, 16] -> [8, 30]
                return {x: center.x + 8, y: center.y - 42};
            case 2:
                // [16, 16] -> [0, 16]
                return {x: center.x + 40, y: center.y - 14};
            case 3:
                // [16, 16] -> [8, 2]
                return {x: center.x + 32, y: center.y + 28};
            case 4:
                // [16, 16] -> [24, 2]
                return {x: center.x - 8, y: center.y + 42};
            case 5:
                // [16, 16] -> [32, 16]
                return {x: center.x - 40, y: center.y + 14};
            default:
                return center;
        }
    }
}
