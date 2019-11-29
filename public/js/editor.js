class Editor {
    constructor(player) {
        this.counter = 0;
        this.player = player;
        this.face = undefined;
        if (!this.player) {
            this.currentCell = undefined;
        } else {
            this.currentCell = this.player[0];
        }
    }

    /*
     * Searches the player for the next item of type cell starting from
     * this.counter
     */
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

    /*
     * Searches the player for the previous item of type cell starting from
     * this.counter
     */
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
}

// initialize editor
const editor = new Editor();
