// TODO: clientside app
class App {
	constructor(object) {
		this.canvas = document.getElementById(object.canvas);

		if (this.canvas.tagName !== 'CANVAS') {
			throw new Error("It should be a canvas");
		}

		this.ctx = this.canvas.getContext('2d');
	}

	drawMap() {
		const map = new Image();
		map.src = 'img/bg.jpg';
		this.ctx.drawImage(map,0 ,0);
	}
}