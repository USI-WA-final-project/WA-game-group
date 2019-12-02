class Editor {
    constructor(player) {
        this.player = player;
        this.centers = undefined;
        this.focus = undefined;
        this.counter = 0;
        if (!this.player) {
            this.currentCell = undefined;
        } else {
            this.currentCell = this.player[0];
        }
    }

    findNextCell() {
        let current;
        for (let i = this.counter; i < this.player.length; i++) {
            if (this.player[i].type == 0) {
                current = this.player[i];
                this.currentCell = current;
                if (this.currentCell != this.player[0]) {
                    this.counter++;
                }
            }
        }
    }

    findPrevCell() {
        let current;
        for (let i = this.counter; i >= 0; i--) {
            if (this.player[i].type == 0) {
                current = this.player[i];
                this.currentCell = current;
                this.counter--;
            }
        }
        // the function should never actually terminate outside of the loop
        // as the first element of the components will always be the
        // core cell of the player
        current = this.player.components[0];
        this.currentCell = current;
        this.counter = 0;
    }

    /*
     * Updates this.counter to the value of the cell holding the nearest center
     * to this.focus and finds the face closest to this.focus
     * returns {number} face - The number of the face closest to this.focus.
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
                console.log(currentDist);
                if (currentDist <= bestDistance) {
                    console.log("better");
                    bestDistance = currentDist;
                    closest = this.centers[i];
                    counter = i;
                }
            }
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
