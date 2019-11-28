// TODO: clientside app
class App {
	constructor(object) {
		//canvas
		this.canvas = document.getElementById(object.canvas);

		if (this.canvas.tagName !== 'CANVAS') {
			throw new Error("It should be a canvas");
		}

		this.ctx = this.canvas.getContext('2d');
		this.width = this.canvas.width;
		this.height = this.canvas.height;
		//graphic interface
		this.composer = new Composer(new CanvasInterface(this.canvas));

		//array keys movement
		this.movementKeys = ["KeyW", "KeyD", "KeyS", "KeyA"];

		//array keys chose edit
		this.editKeys = ["Digit1", "Digit2", "Digit3", "Digit4"];

		//array keys search cell
		this.searchCellKeys = ["ArrowRight", "ArrowLeft"];

		//array keys to take face of cell
		this.searchFaceKeys = ["Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6"];

		//current movement key
		this.keys = {};

		//player structure
		this.playerBody = undefined;

		//editor
		this.editor = undefined;

		//current type and face to edit
		this.cellEdited = {type: undefined, face: undefined};

		//inputs
		this.cell = document.getElementById(object.inputs.cell);
		this.shield = document.getElementById(object.inputs.shield);
		this.spike = document.getElementById(object.inputs.spike);
		this.bounce = document.getElementById(object.inputs.bounce);

		window.addEventListener('resize', (e) => {
			this.composer = new Composer(new CanvasInterface(this.canvas));
		});

	}

	setEdit(code){
		let edit = undefined;
		if (code == "Digit1") {
			edit = 0;
		} 

		if (code == "Digit2") {
			edit = 1;
		} 

		if (code == "Digit3") {
			edit = 2;
		} 

		if (code == "Digit4") {
			edit = 3;
		} 

		if (edit != undefined) {
			this.editor =  new Editor(this.playerBody);
			this.cellEdited.type = edit;
		}
	}

	searchCell(e){
		if (e.code == "ArrowRight") {
			this.editor.findNextCell();

		 	//socket.emit('move',2);
		 	//console.log("D");
		}

		if (this.keys["ArrowLeft"]) {
			this.editor.findPrevCell();
			//console.log("A");
			//socket.emit('move', 6);
		}
	}

	searchFace(code) {
		if (this.editor != undefined) {
			if (code == "Digit1") {
				this.cellEdited.face = 0;
			}

			if (code == "Digit2") {
				this.cellEdited.face = 1;
			}

			if (code == "Digit3") {
				this.cellEdited.face = 2;
			}

			if (code == "Digit4") {
				this.cellEdited.face = 3;
			}

			if (code == "Digit5") {
				this.cellEdited.face = 4;
			}

			if (code == "Digit6") {
				this.cellEdited.face = 5;
			}

			if (this.cellEdited.type != undefined && this.cellEdited.face != undefined) {
				console.log(this.cellEdited.type, this.editor.counter, this.cellEdited.face);
				socket.emit('attachPart', { type: this.cellEdited.type, 
											part: this.editor.counter, 
											face: this.cellEdited.face });
				//stop edit
				this.editor = undefined;
			}
		}
	}

	drawMap(data) {
		this.clearCanvas();
		//console.log(data);
		this.move();
		//console.log(data);
		//this.updateInfo(data.player[0].health);
		data.players.forEach((elem) => {
			this.playerBody = elem.components;
			this.drawPlayer(elem.components, elem.color, elem.position);
		});
	}

	updateInfo(life) {
		let health = (life / 85) * 100;
		document.getElementById("life").style.background = "linear-gradient(left, green "+health+"%, white "+(100 - health)+"%)";
	}

	drawPlayer(playerBody, colorIndex, position) {
		if (!this.playerColors) return;

		const color  = this.playerColors[colorIndex];
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
		//wasd
		if (this.movementKeys.includes(e.code)) {
			this.keys[e.code] = true;
		}
		//RIGHT LEFT
		if (this.searchCellKeys.includes(e.code) && this.editor.player != undefined) {
			//console.log(this.editor);
			this.searchCell(e);
		} 
		//number 1-4 type, 1-6 face
		if (this.editKeys.includes(e.code) || this.searchFaceKeys.includes(e.code)) {
			if (this.editor == undefined) {
				this.setEdit(e.code);
			} else {
				this.searchFace(e.code);
			}
		}
	}

	move() {
		//WD DS SA AW || UPRIGHT RIGHTDOWN DOWNLEFT LEFTUP
		if (this.keys["KeyW"] &&
			this.keys["KeyD"]) {
			//console.log("W");
			socket.emit('move', 1);
		}

		if (this.keys["KeyD"] &&
			this.keys["KeyS"]) {
			//console.log("A");
			socket.emit('move', 3);
		}

		if (this.keys["KeyS"] &&
			this.keys["KeyA"]) {
			//console.log("S");
			socket.emit('move', 5);
		}

		if (this.keys["KeyA"] &&
			this.keys["KeyW"]) {
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
	}

	onKeyUp(e) {
		this.keys[e.code] = undefined;
	}

	setName(name) {
		let user_name = "Ajax";
		if (name != "" && /\S/.test(name)) {
			user_name = name;
		} 
		console.log(user_name);
		socket.emit('registerUser',  user_name);
	}


}