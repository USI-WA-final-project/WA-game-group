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

		this.composer = new Composer(new CanvasInterface(this.canvas));

		this.keys = {};

		//editor
		this.editor = new Editor(0);

		//inputs
		this.cell = document.getElementById(object.inputs.cell);
		this.shield = document.getElementById(object.inputs.shield);
		this.spike = document.getElementById(object.inputs.spike);
		this.bounce = document.getElementById(object.inputs.bounce);

		window.addEventListener('resize', (e) => {
			this.composer = new Composer(new CanvasInterface(this.canvas));
		});


		
		this.cell.addEventListener('click', this.setEdit.bind(this));
		this.shield.addEventListener('click', this.setEdit.bind(this));
		this.spike.addEventListener('click', this.setEdit.bind(this));
		this.bounce.addEventListener('click', this.setEdit.bind(this));
	}

	setEdit(e){
		let edit = 0
		if (e.target == "cell") {
			edit = 1;
		} 

		if (e.target == "spike") {
			edit = 2;
		} 

		if (e.target == "shield") {
			edit = 3;
		} 

		if (e.target == "bounce") {
			edit = 4;
		} 
		this.editor =  new Editor(edit);
	}

	drawMap(data) {
		this.clearCanvas();
		//console.log(data);
		this.move();
		data.players.forEach((elem) => {
			console.log(elem);
			this.drawPlayer(elem.components, elem.color, elem.position);
		});
	}

	drawPlayer(playerBody, colorIndex, position) {
		const color  = PLAYER_COLORS[colorIndex];
		this.composer.build(playerBody, color, position);
	}

	clearCanvas() {
		const ctx = this.canvas.getContext('2d');
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	enableInput() {
		console.log("enabled");
		this.canvas.focus();
		this.canvas.addEventListener('keydown', this.onKeyDown.bind(this));
		this.canvas.addEventListener('keyup', this.onKeyUp.bind(this));
	}

	disableInput() {
		console.log("disabled");
		this.canvas.blur();
		this.canvas.removeEventListener('keydown', this.onKeyDown);
		this.canvas.removeEventListener('keyup', this.onKeyUp);
	}

	onKeyDown(e) {
		e.preventDefault();
		this.keys[e.code] = true;
	}

	move() {
		//WD DS SA AW || UPRIGHT RIGHTDOWN DOWNLEFT LEFTUP
		if (this.keys["KeyW"] &&
			this.keys["KeyD"] ||
			this.keys["ArrowUp"] &&
			this.keys["ArrowRight"]) {
			//console.log("W");
			socket.emit('move', 1);
		}

		if (this.keys["KeyD"] &&
			this.keys["KeyS"] ||
			this.keys["ArrowRight"] &&
			this.keys["ArrowDown"]) {
			//console.log("A");
			socket.emit('move', 3);
		}

		if (this.keys["KeyS"] &&
			this.keys["KeyA"] ||
			this.keys["ArrowDown"] &&
			this.keys["ArrowLeft"]) {
			//console.log("S");
			socket.emit('move', 5);
		}

		if (this.keys["KeyA"] &&
			this.keys["KeyW"] ||
			this.keys["ArrowLeft"] &&
			this.keys["ArrowUp"]) {
			socket.emit('move',7);
			//console.log("D");
		}

		// W A S D
		if (this.keys["KeyW"]) {
			//console.log("W");
			socket.emit('move', 0);
		}

		if (this.keys["KeyD"]) {
			socket.emit('move',2);
			//console.log("D");
		}

		if (this.keys["KeyS"]) {
			socket.emit('move', 4);
			//console.log("S");
		}

		if (this.keys["KeyA"]) {
			//console.log("A");
			socket.emit('move', 6);
		}

		// UP RIGHT DOWN LEFT
		if (this.keys["ArrowUp"]) {
			//console.log("W");
			socket.emit('move', 0);
		}

		if (this.keys["ArrowRight"]) {
			socket.emit('move',2);
			//console.log("D");
		}

		if (this.keys["ArrowDown"]) {
			socket.emit('move', 4);
			//console.log("S");
		}

		if (this.keys["ArrowLeft"]) {
			//console.log("A");
			socket.emit('move', 6);
		}
	}

	onKeyUp(e) {
		this.keys[e.code] = undefined;
	}

	setName(name) {
		console.log(name);
		socket.emit('registerUser',  name);
	}


}