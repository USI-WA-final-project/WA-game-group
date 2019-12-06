class Editor {
    constructor() {
        this.centers = undefined;
        this.focus = undefined;
        this.counter = 0;
        // if false we're adding otherwise we're removing
        this.mode = false;
    }

    /*
     * Checks if this.focus is within the hexagon coordinates or not
     * (approximates to the circle within)
     * @param center - the center of the hexagon we're checking
     * @returns {boolean} whether the element is within the hexagon
     */
    isInHexagon(center) {
        if (this.calcDistance(this.focus, center) > 8) {
            return false;
        } else {
            return true;
        }
    }

    /*
     * Updates this.counter to the value of the body part closest to this.focus
     * @returns {number face - the face of the element to be removed at the face
     * or undefined if we're removing an hexagon
     */
    removePart() {
        if (!this.centers || !this.focus) {
            console.log('focus', this.focus);
            console.log('center array', this.centers);
            throw "At least one paramater is undefined";
        }

        let bestDistance = Infinity;
        let counter = 0;
        let closest;

        for (var i = 0; i < this.centers.length; i++) {
            if (this.centers[i] != -1) {
                let currentDist = this.calcDistance(this.focus, this.centers[i]);
                console.log("CURRENT", currentDist);
                if (currentDist <= bestDistance) {
                    console.log("better");
                    bestDistance = currentDist;
                    closest = this.centers[i];
                    counter = i;
                }
            }
        }

        if (bestDistance > 100) {
            console.error("Clicked too far from player");
            return;
        }

        this.counter = counter;

        if (this.isInHexagon(closest)) {
            return;
        } else {
            return this.checkFace(this.focus, closest);
        }

    }

    /*
     * Updates this.counter to the value of the cell holding the nearest center
     * to this.focus and finds the face closest to this.focus
     * @returns {number} face - The number of the face closest to this.focus.
     * Must be between 0 and 5
     */
    findFace() {
        if (!this.centers || !this.focus) {
            console.log('focus', this.focus);
            console.log('center array', this.centers);
            throw "At least one paramater is undefined";
        }

        let face;
        let bestDistance = Infinity;
        let counter = 0;
        let closest;

        for (let i = 0; i < this.centers.length; i++) {
            if (this.centers[i] != -1) {
                let currentDist = this.calcDistance(this.focus, this.centers[i]);
                console.log("CURRENT", currentDist);
                if (currentDist <= bestDistance) {
                    console.log("better");
                    bestDistance = currentDist;
                    closest = this.centers[i];
                    counter = i;
                }
            }
        }

        if (bestDistance > 100) {
            console.error("Clicked too far from player");
            return;
        }

        this.counter = counter;
        console.log(counter, this.focus);
        face = this.checkFace(this.focus, closest);
        return face;
    }

    /*
     * Finds the distance between two points
     * @param start first point
     * @param end second point
     * @returns {number} The distance between the two points
     */
    calcDistance(start, end) {
        return Math.sqrt(
            Math.pow(end.x - start.x, 2) +
            Math.pow(end.y - start.y, 2)
        );
    }

    /*
     * Checks the focus coordinates and the center coordinates and finds the
     * face closest to focus
     * @param focus - coordinates at mouseclick
     * @param center - coordinates of the center closest to focus
     * @returns {number} The number of the face between 0 and 5
     */
    checkFace(focus, center) {
        if (focus.y <= center.y) {
            if (focus.x >= center.x + 8) {
                return 2;
            } else if (focus.x < center.x + 8 && focus.x > center.x - 8) {
                return 1;
            } else {
                return 0;
            }
        } else {
            if (focus.x >= center.x + 8) {
                return 3;
            } else if (focus.x < center.x + 8 && focus.x > center.x - 8) {
                return 4;
            } else {
                return 5;
            }
        }
    }
}

// initialize editor
const editor = new Editor();
