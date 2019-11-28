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

    findFaces() {

    }

    // searches the player object for the next item of type cell starting from
    // the index startIndex
    findNextCell(player) {
        let current;
        for (let i = player.indexOf(currentCell); i < player.length; i++) {
            if (player[i].type == 0) {
                current = player[i];
                this.currentCell = current;
                return current;
            }
        }
        // if there is no next cell, the last element of the array of type cell
        // will be returned instead
        return findPrevCell(player);
    }

    // searches the player object for the previous item of type cell starting
    // from the index startIndex
    findPrevCell(player) {
        let current;
        for (let i = player.indexOf(currentCell); i >= 0; i--) {
            if (player[i].type == 0) {
                current = player[i];
                this.currentCell = current;
                return current;
            }
        }
        // the function should never actually terminate outside of the loop
        // as the first element of the components will always be the
        // core cell of the player
        current = player.components[0];
        return player.components[0];
    }

    /*
     * Adds a new cell of type 'this.type', at face 'face' of 'this.currentCell'
     * to 'this.player'
     * @param {player} the player object
     * @param {face} the face number given by the player. Number from 1 to 6
     * @returns the updated player object
     */
    setCell(player, face) {
        newCell = {
            "type": type,
            "faces": [-1, -1, -1, -1, -1, -1]
        };
        // "face - 1" is simply due to the fact that the user will input a
        // number between 1 and 6 while the indexes go from 0 to 5

        // connect newCell face to cell face
        newCell.faces[oppositeFace(face) - 1] = this.player.indexOf(cell);
        this.player.push(newCell);
        // connect cell face to newCell face
        this.currentCell.faces[face - 1] = player.indexOf(newCell);

        return this.player;
    }

    /*
     * Adds a new leaf element of type 'this.type', at face 'face' of
     * 'this.currentCell' to 'this.player'
     * @param {player} the player object
     * @param {face} the face number given by the player. Number from 1 to 6
     * @returns the updated player object
     */
    setElement(player, face) {
        newElement = {
            "type": this.type
        };
        player.push(newElement);
        cell.faces[face - 1] = player.indexOf(newElement);

        return this.player;
    }

    // given the number of a face, returns the opposite face
    oppositeFace(face) {
        return [null,4,5,6,1,2,3][face];
    }
}

// initialize editor
const editor = new Editor();
