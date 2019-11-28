class Editor {
    constructor(statusNum) {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');

        // will draw the current icon at the mouse position
        // To be discussed as drawing on the client might be too heavy
        switch (statusNum) {
            case 0:
            this.start();
                break;
            case 1:
                this.start();
                this.canvas.addEventListener('mousemove', (e) => {
                    this.drawCell(e);
                });
                break;
            case 2:
                this.start();
                this.canvas.addEventListener('mousemove', (e) => {
                    this.drawSpike(e);
                });
                break;
            case 3:
                this.start();
                this.canvas.addEventListener('mousemove', (e) => {
                    this.drawShield(e);
                });
                break;
            case 4:
                this.start();
                this.canvas.addEventListener('mousemove', (e) => {
                    this.drawBounce(e);
                });
                break;
        }
    }

    // clear function to remove previous event listeners
    start() {
        try {
            console.log('CLEARING LISTENERS');
            this.canvas.removeEventListener('mousemove', (e) => {
                 this.drawCell(e);
             });
            this.canvas.removeEventListener('mousemove', (e) => {
                this.drawSpike(e);
            });
            this.canvas.removeEventListener('mousemove', (e) => {
                this.drawShield(e);
            });
            this.canvas.removeEventListener('mousemove', (e) => {
                this.drawBounce(e);
            });
        } catch(e) {
            console.error(e);
            throw new Error(e);
        }
    }

    // draws image at cursor position
    drawCell(e) {
        console.log('DRAWING CELL');
        const image = document.getElementById('cell-edit');
        this.ctx.drawImage(image, e.offsetX - 10, e.offsetY - 10);
    }

    drawSpike(e) {
        console.log('DRAWING SPIKE');
        const image = document.getElementById('spike-edit');
        this.ctx.drawImage(image, e.offsetX - 10, e.offsetY - 10);
    }

    drawShield(e) {
        console.log('DRAWING SHIELD');
        const image = document.getElementById('shield-edit');
        this.ctx.drawImage(image, e.offsetX - 10, e.offsetY - 10);
    }

    drawBounce(e) {
        console.log('DRAWING BOUNCE');
        const image = document.getElementById('bounce-edit');
        this.ctx.drawImage(image, e.offsetX - 10, e.offsetY - 10);
    }

    // searches the player object for the next item of type cell starting from
    // the index startIndex
    findNextCell(player, startIndex) {
        for (let i = startIndex; i < player.components.length; i++) {
            if (player.components[i].type == 0) {
                return player.components[i];
            }
        }
        // if there is no next cell, the last element of the array of type cell
        // will be returned instead
        return findPrevCell(player, player.components.length - 1)
    }

    // searches the player object for the previous item of type cell starting
    // from the index startIndex
    findPrevCell(player, startIndex) {
        for (let i = startIndex; i >= 0; i--) {
            if (player.components[i].type == 0) {
                return player.components[i];
            }
        }
        // the function should never actually terminate outside of the loop
        // as the first element of the components will always be the
        // core cell of the player
        return player.components[0];
    }

    /*
     * Adds a new cell of type 'type', at face 'face' of cell 'cell' to the
     * player object
     * @param {player} the player object
     * @param {face} the face number given by the player. Number from 1 to 6
     * @param {type} the type passed into the editor object
     * @param {cell} the cell selected by the user navigating the object through
     * the findNextCell and findPrevCell functions
     * @returns the updated player object
     */
    setCell(player, face, type, cell) {
        newCell = {
            "type": type,
            "faces": [-1, -1, -1, -1, -1, -1]
        };
        // "face - 1" is simply due to the fact that the user will input a
        // number between 1 and 6 while the indexes go from 0 to 5

        // connect newCell face to cell face
        newCell.faces[oppositeFace(face) - 1] = player.components.indexOf(cell);
        player.components.push(newCell);
        // connect cell face to newCell face
        cell.faces[face - 1] = player.components.indexOf(newCell);

        return player;
    }

    /*
     * Adds a new leaf element of type 'type', at face 'face' of cell 'cell' to
     * the player object
     * @param {player} the player object
     * @param {face} the face number given by the player. Number from 1 to 6
     * @param {type} the type passed into the editor object
     * @param {cell} the cell selected by the user navigating the object through
     * the findNextCell and findPrevCell functions
     * @returns the updated player object
     */
    setElement(player, face, type, cell) {
        newElement = {
            "type": type;
        };
        player.components.push(newElement);
        cell.faces[face - 1] = player.components.indexOf(newElement);

        return player;
    }

    // given the number of a face, returns the opposite face
    oppositeFace(face) {
        return [null,4,5,6,1,2,3][face];
    }
}

// initialize editor
const editor = new Editor();
