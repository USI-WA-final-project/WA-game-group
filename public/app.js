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

		const canvasInterface = new CanvasInterface(this.canvas);
		this.composer = new Composer(canvasInterface);
	}

	drawMap(data) {
		console.log(data);
		data.players.forEach((elem) => {

		 	this.drawPlayer(elem.bodyparts, elem.position);
		});
	}

	drawPlayer(playerBody, position) {
		// TODO: cambio colore
		const color  = { core: "#35b27d", child: "#6ee6ad" };
		this.composer.build(playerBody, color, position);
	}

	enableInput() {
		console.log("enabled");
		this.canvas.focus();
		this.canvas.addEventListener("keydown", this.onKeyDown.bind(this));
	}

	disableInput() {
		console.log("disabled");
		this.canvas.blur();
		this.canvas.removeEventListener('keydown', this.onKeyDown);
	}

	onKeyDown(e) {
		console.log(e);

		// W A S D
		if (e.code === "KeyW") {
			//console.log("W");
			socket.emit('move', 0);
		}

		if (e.code === "keyA") {
			//console.log("A");
			socket.emit('move', 6);
		}

		if (e.code === "KeyS") {
			socket.emit('move', 4);
			//console.log("S");
		}

		if (e.code === "KeyD") {
			socket.emit('move',2);
			//console.log("D");
		}
	}
}