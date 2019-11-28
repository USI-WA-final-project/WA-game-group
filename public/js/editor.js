class Editor {
    constructor(statusNum, player) {
        this.counter = 0;
        this.player = player;
        if (!this.player) {
            this.currentCell = undefined;
        } else {
            this.currentCell = this.player[0];
        }
        this.type = statusNum;
    }

    // searches the player object for the next item of type cell starting from
    // the index startIndex
    findNextCell() {
        let current;
        for (let i = this.counter; i < this.player.length; i++) {
            if (this.player[i].type == 0) {
                current = this.player[i];
                this.currentCell = current;
                if (this.currentCell != player[0]) {
                    this.counter++;
                }
                return current;
            }
        }
        // if there is no next cell, the last element of the array of type cell
        // will be returned instead
        return this.currentCell;
    }

    // searches the player object for the previous item of type cell starting
    // from the index startIndex
    findPrevCell() {
        let current;
        for (let i = this.counter; i >= 0; i--) {
            if (this.player[i].type == 0) {
                current = this.player[i];
                this.currentCell = current;
                this.counter--;
                return current;
            }
        }
        // the function should never actually terminate outside of the loop
        // as the first element of the components will always be the
        // core cell of the player
        current = this.player.components[0];
        this.currentCell = current;
        this.counter = 0;
        return this.player.components[0];
    }

    // creates a new cell element to be passed
    setCell() {
        newCell = {
            "type": this.type,
            "faces": [-1, -1, -1, -1, -1, -1]
        };

        return newCell;
    }

    // creates a new leaf element to be passed
    setElement() {
        newElement = {
            "type": this.type
        };

        return newElement;
    }

}

// initialize editor
const editor = new Editor();
