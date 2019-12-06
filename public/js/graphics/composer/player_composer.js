const CHILD_TYPE_FREE = -1;
const CHILD_TYPE_CELL = 0;
const CHILD_TYPE_SPIKE = 1;
const CHILD_TYPE_SHIELD = 2;

const STATUS_TO_VISIT = undefined;
const STATUS_VISITING = 0;
const STATUS_VISITED = 1;

const SHIELD_COLOR = "#565656";
const SPIKE_COLOR = "#20123A";

class PlayerComposer {

    /**
     * The player composer.
     *
     * See the documentation in <b>docs/client/characters</b> for more info.
     */
    constructor(context, center) {
        this.ctx = context;
        this.screenCenter = center;

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
        const center = deltaPosition ? {
            x: this.screenCenter.x + deltaPosition.x,
            y: this.screenCenter.y + deltaPosition.y
        } : this.screenCenter;

        const begin = {
            x: center.x - 8,
            y: center.y - 14
        };

        this.visited = {};

        this.drawHexagon0(obj, 0, begin, center, true);
        this.ctx.fillStyle = color.body;
    }

    /* Hexagon */

    initHexagon(index, isCore = false) {
        if (this.visited[index] !== STATUS_TO_VISIT) return false;
        this.visited[index] = STATUS_VISITING;

        this.ctx.beginPath();
        this.ctx.fillStyle = isCore ? this.colors.cell.core : this.colors.cell.child;
        return true;
    }

    finalizeHexagon(obj, index, begin, center) {
        this.ctx.closePath();
        this.ctx.fill();

        this.drawHexagonFaces(obj, index, begin, center);
        this.visited[index] = STATUS_VISITED;
    }

    drawHexagon0(obj, index, begin, center, isCore = false) {
        if (!this.initHexagon(index, isCore)) return;

        this.ctx.moveTo(begin.x, begin.y); // M 8 2
        this.ctx.lineTo(begin.x - 8, begin.y + 14); // l -8 14
        this.ctx.lineTo(begin.x, begin.y + 28); // l 8 14
        this.ctx.lineTo(begin.x + 16, begin.y + 28); // l 16 0
        this.ctx.lineTo(begin.x + 24, begin.y + 14); // l 8 -14
        this.ctx.lineTo(begin.x + 16, begin.y); // l -8 -14
        this.ctx.lineTo(begin.x, begin.y); // l -16 0

        if (isCore) {
            this.ctx.closePath();
            this.ctx.fill();

            // "Core circle"
            this.ctx.beginPath();
            this.ctx.fillStyle = this.colors.cell.child; // 30% white
            this.ctx.arc(center.x, center.y, 7, 0, 360)
        }

        this.finalizeHexagon(obj, index, begin, center);
    }

    drawHexagon1(obj, index, begin, center) {
        if (!this.initHexagon(index)) return;

        this.ctx.moveTo(begin.x, begin.y); // M 24 2
        this.ctx.lineTo(begin.x - 16, begin.y); // l -16 0
        this.ctx.lineTo(begin.x - 24, begin.y + 14); // l -8 14
        this.ctx.lineTo(begin.x - 16, begin.y + 28); // l 8 14
        this.ctx.lineTo(begin.x, begin.y + 28); // l 16 0
        this.ctx.lineTo(begin.x + 8, begin.y + 14); // l 8 -14
        this.ctx.lineTo(begin.x, begin.y); // l -8 -14

        this.finalizeHexagon(obj, index, begin, center);
    }

    drawHexagon2(obj, index, begin, center) {
        if (!this.initHexagon(index)) return;

        this.ctx.moveTo(begin.x, begin.y); // M 32 16
        this.ctx.lineTo(begin.x - 8, begin.y - 14); // l -8 -14
        this.ctx.lineTo(begin.x - 24, begin.y - 14); // l -16 0
        this.ctx.lineTo(begin.x - 32, begin.y); // l -8 14
        this.ctx.lineTo(begin.x - 24, begin.y + 14); // l 8 14
        this.ctx.lineTo(begin.x - 8, begin.y + 14); // l 16 0
        this.ctx.lineTo(begin.x, begin.y); // l 8 -14

        this.finalizeHexagon(obj, index, begin, center);
    }

    drawHexagon3(obj, index, begin, center) {
        if (!this.initHexagon(index)) return;

        this.ctx.moveTo(begin.x, begin.y); // M 24 30
        this.ctx.lineTo(begin.x + 8, begin.y - 14); // l 8 -14
        this.ctx.lineTo(begin.x, begin.y - 28); // l -8 -14
        this.ctx.lineTo(begin.x - 16, begin.y - 28); // l -16 0
        this.ctx.lineTo(begin.x - 24, begin.y - 14); // l -8 14
        this.ctx.lineTo(begin.x - 16, begin.y); // l 8 14
        this.ctx.lineTo(begin.x, begin.y); // l 16 0

        this.finalizeHexagon(obj, index, begin, center);
    }

    drawHexagon4(obj, index, begin, center) {
        if (!this.initHexagon(index)) return;

        this.ctx.moveTo(begin.x, begin.y); // M 8 30
        this.ctx.lineTo(begin.x + 16, begin.y); // l 16 0
        this.ctx.lineTo(begin.x + 24, begin.y - 14); // l 8 -14
        this.ctx.lineTo(begin.x + 16, begin.y - 28); // l -8 -14
        this.ctx.lineTo(begin.x, begin.y - 28); // l -16 0
        this.ctx.lineTo(begin.x - 8, begin.y - 14); // l -8 14
        this.ctx.lineTo(begin.x, begin.y); // l 8 14

        this.finalizeHexagon(obj, index, begin, center);
    }

    drawHexagon5(obj, index, begin, center) {
        if (!this.initHexagon(index)) return;

        this.ctx.moveTo(begin.x, begin.y); // M 0 16
        this.ctx.lineTo(begin.x + 8, begin.y + 14); // l 8 14
        this.ctx.lineTo(begin.x + 24, begin.y + 14); // l 16 0
        this.ctx.lineTo(begin.x + 32, begin.y); // l 8 -14
        this.ctx.lineTo(begin.x + 24, begin.y - 14); // l -8 -14
        this.ctx.lineTo(begin.x + 8, begin.y - 14); // l -16 0
        this.ctx.lineTo(begin.x, begin.y); // l -8 14

        this.finalizeHexagon(obj, index, begin, center);
    }

    /* Spike */

    drawSpike0(begin) {
        this.ctx.beginPath();
        this.ctx.fillStyle = this.colors.spike;

        this.ctx.moveTo(begin.x, begin.y); // M 8 2
        this.ctx.lineTo(begin.x - 16, begin.y); // l -16 0
        this.ctx.lineTo(begin.x - 8, begin.y + 14); // l 8 14
        this.ctx.lineTo(begin.x, begin.y); // l 8 -14
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawSpike1(begin) {
        this.ctx.beginPath();
        this.ctx.fillStyle = this.colors.spike;

        this.ctx.moveTo(begin.x, begin.y); // M 8 2
        this.ctx.lineTo(begin.x + 16, begin.y); // l 16 0
        this.ctx.lineTo(begin.x + 8, begin.y - 14); // l -8 -14
        this.ctx.lineTo(begin.x, begin.y); //l -8 14
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawSpike2(begin) {
        this.ctx.beginPath();
        this.ctx.fillStyle = this.colors.spike;

        this.ctx.moveTo(begin.x, begin.y); // M 24 2
        this.ctx.lineTo(begin.x + 16, begin.y); // l 16 0
        this.ctx.lineTo(begin.x + 8, begin.y + 14); // l -8 14
        this.ctx.lineTo(begin.x, begin.y); // l -8 -14
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawSpike3(begin) {
        this.ctx.beginPath();
        this.ctx.fillStyle = this.colors.spike;

        this.ctx.moveTo(begin.x, begin.y); // M 24 30
        this.ctx.lineTo(begin.x + 16, begin.y); // l 16 0
        this.ctx.lineTo(begin.x + 8, begin.y - 14); // l -8 -14
        this.ctx.lineTo(begin.x, begin.y); // l -8 14
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawSpike4(begin) {
        this.ctx.beginPath();
        this.ctx.fillStyle = this.colors.spike;

        this.ctx.moveTo(begin.x, begin.y); // M 8 30
        this.ctx.lineTo(begin.x - 16, begin.y); // l -16 0
        this.ctx.lineTo(begin.x - 8, begin.y + 14); // l 8 14
        this.ctx.lineTo(begin.x, begin.y); // l 8 -14
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawSpike5(begin) {
        this.ctx.beginPath();
        this.ctx.fillStyle = this.colors.spike;

        this.ctx.moveTo(begin.x, begin.y); // M 8 30
        this.ctx.lineTo(begin.x - 16, begin.y); // l -16 0
        this.ctx.lineTo(begin.x - 8, begin.y - 14); // l 8 -14
        this.ctx.lineTo(begin.x, begin.y); // l 8 14
        this.ctx.closePath();
        this.ctx.fill();
    }

    /* Shield */

    drawShield0(begin) {
        this.ctx.beginPath();
        this.ctx.fillStyle = this.colors.shield;

        this.ctx.moveTo(begin.x, begin.y); // M 8 2
        this.ctx.lineTo(begin.x - 8, begin.y + 14); // l -8 14
        this.ctx.lineTo(begin.x - 10.4, begin.y + 12.5); // l -2.6 -1.5
        this.ctx.lineTo(begin.x - 2.6, begin.y - 1.5); // l 8 -14
        this.ctx.lineTo(begin.x, begin.y); // l 1.5 2.6
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawShield1(begin) {
        this.ctx.beginPath();
        this.ctx.fillStyle = this.colors.shield;

        this.ctx.moveTo(begin.x, begin.y); // M 8 2
        this.ctx.lineTo(begin.x + 16, begin.y); // l 16 0
        this.ctx.lineTo(begin.x + 16, begin.y - 3); // l 0 -3
        this.ctx.lineTo(begin.x, begin.y - 3); // l -16 0
        this.ctx.lineTo(begin.x, begin.y); // l 0 3
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawShield2(begin) {
        this.ctx.beginPath();
        this.ctx.fillStyle = this.colors.shield;

        this.ctx.moveTo(begin.x, begin.y); // M 24 2
        this.ctx.lineTo(begin.x + 2.6, begin.y - 1.5); // l 2.6 -1.5
        this.ctx.lineTo(begin.x + 10.5, begin.y + 12.5); // l 8 14
        this.ctx.lineTo(begin.x + 8, begin.y + 14); // l -2.6 1.5
        this.ctx.lineTo(begin.x, begin.y); // l -8 -14
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawShield3(begin) {
        this.ctx.beginPath();
        this.ctx.fillStyle = this.colors.shield;

        this.ctx.moveTo(begin.x, begin.y); // M 24 30
        this.ctx.lineTo(begin.x + 1.5, begin.y + 2.6); // l 1.5 2.6
        this.ctx.lineTo(begin.x + 9.5, begin.y - 11.4); // l 8 -14
        this.ctx.lineTo(begin.x + 8, begin.y - 14); // l -2.6 -1.5
        this.ctx.lineTo(begin.x, begin.y); // l -8 14
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawShield4(begin) {
        this.ctx.beginPath();
        this.ctx.fillStyle = this.colors.shield;

        this.ctx.moveTo(begin.x, begin.y); // M 24 30
        this.ctx.lineTo(begin.x, begin.y + 3); // l 0 3
        this.ctx.lineTo(begin.x - 16, begin.y + 3); // l -16 0
        this.ctx.lineTo(begin.x - 16, begin.y); // l 0 -3
        this.ctx.lineTo(begin.x, begin.y); // l -16 0
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawShield5(begin) {
        this.ctx.beginPath();
        this.ctx.fillStyle = this.colors.shield;

        this.ctx.moveTo(begin.x, begin.y); // M 8 30
        this.ctx.lineTo(begin.x - 2.6, begin.y + 1.5); // l -2.6 1.5
        this.ctx.lineTo(begin.x - 10.6, begin.y - 12.5); // l -8 -14
        this.ctx.lineTo(begin.x - 8, begin.y - 14); // l 2.6 -1.5
        this.ctx.lineTo(begin.x, begin.y); // l 8 14
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    /* Bridges */

    drawHexagonFaces(obj, index, begin, center) {
        if (!obj[index].faces) return;

        for (let i = 0; i < 6; i++) {
            const childIndex = obj[index].faces[i];
            if (childIndex < 0) continue;

            const nextCenter = this.getNextCenter(center, i);
            const nextPerkBegin = this.getNextPerkBegin(center, i);
            const nextCellBegin = this.getNextCellBegin(center, i);

            this.drawHexagonChild(obj, childIndex, i, nextPerkBegin, nextCellBegin, nextCenter);
        }
    }

    drawHexagonChild(obj, index, side, perkBegin, cellBegin, center) {
        if (index < 0) return;
        const type = obj[index].type;

        if (type === CHILD_TYPE_FREE) return;
        if (type === CHILD_TYPE_CELL) {
            switch (side) {
                case 0:
                    return this.drawHexagon0(obj, index, cellBegin, center);
                case 1:
                    return this.drawHexagon1(obj, index, cellBegin, center);
                case 2:
                    return this.drawHexagon2(obj, index, cellBegin, center);
                case 3:
                    return this.drawHexagon3(obj, index, cellBegin, center);
                case 4:
                    return this.drawHexagon4(obj, index, cellBegin, center);
                case 5:
                    return this.drawHexagon5(obj, index, cellBegin, center);
            }
        }
        if (type === CHILD_TYPE_SPIKE) {
            switch (side) {
                case 0:
                    return this.drawSpike0(perkBegin);
                case 1:
                    return this.drawSpike1(perkBegin);
                case 2:
                    return this.drawSpike2(perkBegin);
                case 3:
                    return this.drawSpike3(perkBegin);
                case 4:
                    return this.drawSpike4(perkBegin);
                case 5:
                    return this.drawSpike5(perkBegin);
            }
        }
        if (type === CHILD_TYPE_SHIELD) {
            switch (side) {
                case 0:
                    return this.drawShield0(perkBegin);
                case 1:
                    return this.drawShield1(perkBegin);
                case 2:
                    return this.drawShield2(perkBegin);
                case 3:
                    return this.drawShield3(perkBegin);
                case 4:
                    return this.drawShield4(perkBegin);
                case 5:
                    return this.drawShield5(perkBegin);
            }
        }
    }

    getNextPerkBegin(center, newSide) {
        switch (newSide) {
            case 0:
            case 1:
                // [16, 16] -> [8, 2]
                return {x: center.x - 8, y: center.y - 14};
            case 2:
                // [16, 16] -> [24, 2]
                return {x: center.x + 8, y: center.y - 14};
            case 3:
            case 4:
                // [16, 16] -> [24, 30]
                return {x: center.x + 8, y: center.y + 14};
            case 5:
                // [16, 16] -> [8, 30]
                return {x: center.x - 8, y: center.y + 14};
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
}
