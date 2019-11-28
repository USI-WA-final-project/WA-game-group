class Editor {
    constructor(statusNum, player) {
        this.player = player;
        if (!this.player) {
            this.currentCell = undefined;
        } else {
            this.currentCell = this.player[0];
        }
        this.type = undefined;

        switch (statusNum) {
            case 0:
                break;
            case 1:
                this.type = 0;
                break;
            case 2:
                this.type = 1;
                break;
            case 3:
                this.type = 2;
                break;
            case 4:
                this.type = 3;
                break;
        }
    }

    // searches the player object for the next item of type cell starting from
    // the index startIndex
    findNextCell() {
        let current;
        for (let i = this.player.indexOf(currentCell); i < this.player.length; i++) {
            if (this.player[i].type == 0) {
                current = this.player[i];
                this.currentCell = current;
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
        for (let i = this.player.indexOf(currentCell); i >= 0; i--) {
            if (this.player[i].type == 0) {
                current = this.player[i];
                this.currentCell = current;
                return current;
            }
        }
        // the function should never actually terminate outside of the loop
        // as the first element of the components will always be the
        // core cell of the player
        current = this.player.components[0];
        return this.player.components[0];
    }

    setCell() {
        newCell = {
            "type": this.type,
            "faces": [-1, -1, -1, -1, -1, -1]
        };

        return newCell;
    }

    setElement() {
        newElement = {
            "type": this.type
        };

        return newElement;
    }

}

// initialize editor
const editor = new Editor();
