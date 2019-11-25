// TODO: clientside app
class App {
	constructor(object) {
		this.canvas = document.getElementById(object.canvas);

		if (this.canvas.tagName !== 'CANVAS') {
			throw new Error("It should be a canvas");
		}

		this.ctx = this.canvas.getContext('2d');
		this.width = this.canvas.width;
		this.height = this.canvas.height;
	}

	drawMap() {
		const map = new Image();
		map.src = 'img/bg.jpg';
		map.onload = () => {
			this.ctx.drawImage(map,0 ,0);
			this.drawPlayer();
			
		}
	}

	drawPlayer() {
		const player = new Image();
		player.src = 'img/cell.svg';
		player.onload = () => { 
			this.ctx.drawImage(player, 
							   this.width / 2 - player.width / 2,
        					   this.height / 2 - player.height / 2);
		}
	}
}