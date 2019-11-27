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

    // searches the cell object for the next item of type cell starting from the
    // index startIndex
    findNextCell(cell, startIndex) {
        for (let i = startIndex; i < cell.components.length; i++) {
            if (cell.components[i].type == 0) {
                return cell.components[i];
            }
        }
        console.log("Next cell not found.");
        return null;
    }

    // searches the cell object for the previous item of type cell starting from
    // the index startIndex
    findPrevCell(cell, startIndex) {
        for (let i = startIndex; i >= 0; i--) {
            if (cell.components[i].type == 0) {
                return cell.components[i];
            }
        }
        console.log("Previous cell not found.");
        return null;
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
        newCell.faces[oppositeFace(face) - 1] = player.components.indexOf(cell);
        player.components.push({
            "type": type,
            "faces": [-1, -1, -1, -1, -1, -1]
        });
        cell.faces[face] = player.components.indexOf(newCell);


        return player;
    }

    setSpike(face, type, cell) {

    }

    setShield(face, type, cell) {

    }

    setBounce(face, type, cell) {

    }

    // given the number of a face, returns the opposite one
    oppositeFace(face) {
        return [null,4,5,6,1,2,3][face];
    }
}





// initialize editor
const editor = new Editor();
