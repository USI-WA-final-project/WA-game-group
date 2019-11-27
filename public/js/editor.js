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
}





// initialize editor
const editor = new Editor();
