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
		// for(let i=0;i<8;i++){
		// 	for(let j=0;j<8;j++) {
		// 		this.ctx.moveTo(0,35*j);
		// 		this.ctx.lineTo(280,35*j);
		// 		this.ctx.stroke();
				 
		// 		this.ctx.moveTo(35*i,0);
		// 		this.ctx.lineTo(35*i,280);
		// 		this.ctx.stroke();
		// 	}
		// }
		console.log(data);
		data.players.forEach((elem) => {

		 	this.drawPlayer(elem.bodyparts, elem.position);
		});
		//this.ctx.drawImage(,0 ,0);
			
	}

	drawPlayer(playerBody, position) {
		// TODO: cambio colore
		const color  = { core: "#35b27d", child: "#6ee6ad" };
		this.composer.build(playerBody, color, position);
	}

	enableInput() {
		console.log("enabled");
		this.canvas.focus();
		this.canvas.addEventListener("keydown", this.fnkeydown.bind(this));
	}

	disableInputs() {
		console.log("disabled");
		this.canvas.blur();
		this.canvas.removeEventListener('keydown', this.fnkeydown);
	}

	fnkeydown(e) {
		console.log(e);

		// W A S D
		if (e.code == "KeyW") {
			//console.log("W");
			socket.emit('move', 0);
		}

		if (e.code == "keyA") {
			socket.emit('move', 6);
			//console.log("A");
		}

		if (e.code == "KeyS") {
			socket.emit('move', 4);
			//console.log("S");
		}

		if (e.code == "KeyD") {
			socket.emit('move',2);
			//console.log("D");
		}
	}
}