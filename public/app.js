// TODO: clientside app
class App {
	constructor(object) {
		//canvas
		this.canvas = document.getElementById(object.canvas);

		if (this.canvas.tagName !== 'CANVAS') {
			throw new Error("It should be a canvas");
		}

		this.ctx = this.canvas.getContext('2d');

		// this.worldW = object.world.width;
		// this.worldH = object.world.height;

		// console.log(this.worldW, this.worldH);

		//graphic interface
		this.composer = new Composer(new CanvasInterface(this.canvas));
		this.gridImage =  this.drawGrid();

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
		this.cellEdited = {type: undefined, part: undefined, face: undefined};

		//inputs
		this.cell = document.getElementById(object.inputs.cell);
		this.shield = document.getElementById(object.inputs.shield);
		this.spike = document.getElementById(object.inputs.spike);
		this.bounce = document.getElementById(object.inputs.bounce);
		this.cancel = document.getElementById(object.inputs.cancel);

		//info Player parts
		this.infoCell = document.getElementById(object.info.cell);
		this.infoSpike = document.getElementById(object.info.spike);
		this.infoShield = document.getElementById(object.info.shield);
		//this.infoBounce = document.getElementById(object.info.bounce);

		this.time = document.getElementById(object.info.time);

		//value inital time
		this.valueTime = object.time;

		window.addEventListener('resize', (e) => {
			this.composer = new Composer(new CanvasInterface(this.canvas));
			this.gridImage = this.drawGrid();
		});

		this.canvas.addEventListener('blur', (e) => {
			this.keys = {};
		});

		document.getElementById('stats').addEventListener('mouseout', (e) => {
			this.canvas.focus();
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

	setEditCell() {
		this.editor = new Editor();
		this.cellEdited.type = 0;
		this.cell.classList.toggle('buttonclicked');
	}

	setEditSpike() {
		this.editor = new Editor();
		this.cellEdited.type = 1;
		this.spike.classList.toggle('buttonclicked');
	}

	setEditShield() {
		this.editor = new Editor();
		this.cellEdited.type = 2;
		this.shield.classList.toggle('buttonclicked');
	}

	setEditBounce() {
		this.editor = new Editor();
		this.cellEdited.type = 3;
		this.bounce.classList.toggle('buttonclicked');
	}

	setEditCancel() {
		this.editor = undefined;
		this.cell.classList.remove('buttonclicked');
		this.spike.classList.remove('buttonclicked');
		this.shield.classList.remove('buttonclicked');
		//this.bounce.classList.add('hidden');
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
				//this.editor = undefined;
			}
		}
	}

	setFace(e) {
		if (this.editor != undefined) {
			this.editor.focus = {x: e.offsetX, y: e.offsetY};
			this.cellEdited.face =  this.editor.findFace();
			this.cellEdited.part = this.editor.counter;

			if (this.cellEdited.type != undefined && this.cellEdited.face != undefined) {
				console.log(this.cellEdited.type, this.editor.counter, this.cellEdited.face);
				socket.emit('attachPart', { type: this.cellEdited.type, 
											part: this.cellEdited.part, 
											face: this.cellEdited.face });
				//stop edit
				//this.editor = undefined;
			}
		}
	}

	drawMap(data) {
		this.clearCanvas();
		console.log(data);
		let sx = data.playerPosition.x;
		let sy = data.playerPosition.y;
		this.ctx.drawImage(this.gridImage, sx, sy, this.canvas.width, this.canvas.height, 0, 0, this.canvas.width, this.canvas.height);
		this.move();

		data.players.forEach((elem) => {
			if (elem.position.x == 0 && elem.position.y == 0) {
				this.playerBody = elem.components;
				this.updateInfo(this.playerBody);
				if (this.editor != undefined){
					this.setCenters(this.playerBody);
				}
			}

			this.drawPlayer(elem.components, elem.color, elem.position);
		});
	}

	drawGrid () {
	    // temp canvas to build the world img
	    const c = document.createElement('canvas').getContext('2d');

	    const width = 2000 + this.canvas.width;
	    const height = 2000 + this.canvas.height;

	    const lineW = width - this.canvas.width/2;
	    const lineH = height - this.canvas.height/2;

	    c.canvas.width = width;
	    c.canvas.height = height;

	    c.fillStyle = '#f1f2f3';
	    c.fillRect(0, 0, width, height);

	    c.fillStyle = '#fafbfc';
	    c.fillRect(this.canvas.width/2, this.canvas.height/2, width - this.canvas.width, height - this.canvas.height);

	    c.strokeStyle = 'rgba(0, 0, 0, 0.125)';
	    c.lineWidth = 1;
	    c.beginPath();

	    // vertical grid lines
	    for (let x = this.canvas.width/2; x <= lineW; x += 50) {
	      c.moveTo(x, this.canvas.height/2);
	      c.lineTo(x, lineH);
	    }

	    // horizontal grid lines
	    for (let y = this.canvas.height/2; y <= lineH; y += 50) {
	      c.moveTo(this.canvas.width/2, y);
	      c.lineTo(lineW, y);
	    }

	    c.stroke();
	    c.closePath();

	    let gridImage = new Image();

	    gridImage.src = c.canvas.toDataURL();

	    //console.log(gridImage.size);

	    return gridImage;
	}

	setCenters(components) {
		//console.log(components.length);
		let componentsCenter = Array.from(new Array(components.length));
		componentsCenter[0] = {x: this.canvas.width/2, y: this.canvas.height/2};
		let visited = [];
		components.forEach((el) => {
			if (el != null && el.type == 0) {
				visited.push(0);
			} else {
				visited.push(-1);
			}
		});

		/*

			if (visited[node] == 0) {
				if (components[node].type == 0){
					componentsCenter[node] = this.composer.getNextCenter(componentsCenter[j], k);
				} else {
					componentsCenter[node] = -1;
				}
			}
		});*/

		for (let j = 0; j < components.length; j++) {
				if (components[j].type == 0) {
					for (let k = 0; k < 6; k++) {

						let node = components[j].faces[k];
						console.log(node);
						if (node != -1) {
							if (components[node].type == 0 && visited[node] == 0){
								componentsCenter[node] = this.composer.getNextCenter(componentsCenter[j], k);
							}

							visited[node] = 1;
						}
					}
				} else {
					componentsCenter[j] = -1;
				}
				visited[j] = 1;
			
		}

		this.editor.centers = componentsCenter;
		console.log(componentsCenter, visited, this.playerBody);
	}

	updateInfo(elems) {
		let info = {cell: 0, spike: 0, shield: 0 };
		let factor = 60000;
		let currentTime = new Date(Date.now() - this.valueTime.getTime() + factor * this.valueTime.getTimezoneOffset());
		//console.log(currentTime);
		elems.forEach((part) => {
			if (part != undefined) {
				if (part.type == 0) {
					info.cell++;
				}

				if (part.type == 1) {
					info.spike++;
				}

				if (part.type == 2) {
					info.shield++;
				}
			}
		});

		this.infoCell.innerHTML = info.cell + "&nbsp;";
		this.infoSpike.innerHTML = info.spike + "&nbsp;";
		this.infoShield.innerHTML = info.shield + "&nbsp;";
		this.time.innerHTML = (currentTime.getHours() < 10 ? ("0" + currentTime.getHours()) : currentTime.getHours()) +
			":" + (currentTime.getMinutes() < 10 ? ("0" + currentTime.getMinutes()) : currentTime.getMinutes()) +
			":" + (currentTime.getSeconds() < 10 ? ("0" + currentTime.getSeconds()) : currentTime.getSeconds());
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
		this.canvas.focus();
		this.canvas.addEventListener('keydown', this.onKeyDown.bind(this));
		//inputs
		this.cell.addEventListener('click', this.setEditCell.bind(this));
		this.shield.addEventListener('click', this.setEditShield.bind(this));
		this.spike.addEventListener('click', this.setEditSpike.bind(this));
		this.cancel.addEventListener('click', this.setEditCancel.bind(this));
		//this.bounce.addEventListener('click', this.setEditBounce.bind(this));

		this.canvas.addEventListener('click', this.setFace.bind(this));

		this.canvas.addEventListener('keyup', this.onKeyUp.bind(this));
	}

	disableInput() {
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
		if (this.searchCellKeys.includes(e.code) && this.editor != undefined) {
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
		//WD DS SA AW
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
		localStorage.setItem('user_name', name);
		//console.log(user_name);
		socket.emit('registerUser',  name);
	}

	gameOver() {
		this.disableInput();

	}


}