// TODO: clientside app
class App {
	constructor(object) {
		//canvas
		this.canvas = document.getElementById(object.canvas);
		this.minCanvas = document.getElementById('minimap');

		if (this.canvas.tagName !== 'CANVAS') {
			throw new Error("It should be a canvas");
		}

		this.ctx = this.canvas.getContext('2d');
		this.minCtx = this.minCanvas.getContext('2d');

		this.worldW = object.worldSize.w;
		this.worldH = object.worldSize.h;

		//graphic interface
		this.composer = new Composer(new CanvasInterface(this.canvas));
		this.gridImage = this.drawGrid();

		//array keys movement
		this.movementKeys = ["KeyW", "KeyD", "KeyS", "KeyA"];

		//array keys chose edit
		this.editKeys = ["Digit1", "Digit2", "Digit3", "Digit4"];

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
		this.removeParts = document.getElementById(object.inputs.remove);

		//info Player parts
		this.life = document.getElementById(object.info.life);
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

	setEditor(type) {
		this.editor = new Editor();
		this.cancel.classList.remove('hidden');
		switch (type) {
			case 'cell':
				this.cellEdited.type = 0;
				break;
			case 'spike':
				this.cellEdited.type = 1;
				break;
			case 'shield':
				this.cellEdited.type = 2;
				break;
			case 'bounce':
				this.cellEdited.type = 3;
				break;
		}

		document.querySelectorAll('.notclicked').forEach((el) => {
			if (el.id == type) {
				el.classList.add('buttonclicked');
			} else {
				el.classList.remove('buttonclicked');
			}
		});
	}

	setEditCancel() {
		this.editor = undefined;
		this.cancel.classList.add('hidden');
		//this.bounce.classList.add('hidden');
	}

	setFace(e) {
		if (this.editor != undefined) {
			this.editor.focus = {x: e.offsetX, y: e.offsetY};
			this.cellEdited.face = this.editor.findFace();
			this.cellEdited.part = this.editor.counter;

			if (this.cellEdited.type != undefined && this.cellEdited.face != undefined) {
				//console.log(this.cellEdited.type, this.editor.counter, this.cellEdited.face);
				socket.emit('attachPart', { type: this.cellEdited.type, 
											part: this.cellEdited.part, 
											face: this.cellEdited.face });
			}
		}
	}

	drawMap(data) {
		this.clearCanvas();
		let sx = data.playerPosition.x;
		let sy = data.playerPosition.y;
		this.ctx.drawImage(this.gridImage, sx, sy, this.canvas.width, this.canvas.height, 0, 0, this.canvas.width, this.canvas.height);
		//this.drawMiniMap({x: sx, y: sy});
		//console.log(this.miniMap);
		if (this.miniMap != undefined) {
			//this.minCtx.drawImage(this.miniMap, 0, 0);
		}

		this.move();

		data.players.forEach((elem) => {
			if (elem.position.x == 0 && elem.position.y == 0) {
				this.playerBody = elem.components;
				this.updateInfo(this.playerBody, data.players[0].health);
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

	    const width = this.worldW + this.canvas.width;
	    const height = this.worldH + this.canvas.height;

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
	    
	    this.minCtx.clearRect(0, 0, 300, 200);
		//console.log(img);

		this.minCanvas.width = 300;
		this.minCanvas.height = 200;

		this.minCtx.save();
		this.minCtx.scale(1, 1);
		this.minCtx.drawImage(c.canvas, this.canvas.width/2, this.canvas.height/2,this.worldW, this.worldH, 0, 0, 300, 200);
		this.minCtx.restore();

		return gridImage;
	}

	drawMiniMap(pos) {
		if (pos === undefined) return;
		this.minCtx.clearRect(0, 0, 300, 200);
		let img = this.gridImage;
		//console.log(img);
		this.minCanvas.width = 300;
		this.minCanvas.height = 200;

		this.minCtx.save();
		this.minCtx.scale(this.canvas.width / 300, this.canvas.width / 300);
		this.minCtx.drawImage(img, 0, 0);
		this.minCtx.restore();
	}

	setCenters(components) {
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

		for (let j = 0; j < components.length; j++) {
				if (components[j] != null && components[j].type == 0) {
					for (let k = 0; k < 6; k++) {

						let node = components[j].faces[k];
						//console.log(node);
						if (node != -1) {
							//console.log(node);
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
	}

	updateInfo(elems, life) {
		let info = {cell: 0, spike: 0, shield: 0 };
		let factor = 60000;
		let currentTime = new Date(Date.now() - this.valueTime.getTime() + factor * this.valueTime.getTimezoneOffset());

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
		this.cell.addEventListener('click', function(){
			this.setEditor('cell');
		}.bind(this));

		this.spike.addEventListener('click', function(){
			this.setEditor('spike');
		}.bind(this));

		this.shield.addEventListener('click', function(){
			this.setEditor('shield');
		}.bind(this));

		this.cancel.addEventListener('click', this.setEditCancel.bind(this));
		this.removeParts.addEventListener('click', this.setRemoveParts.bind(this));

		/*this.cell.addEventListener('click', function(){
			this.setEditor('bounce').bind(this);
		});*/

		this.canvas.addEventListener('click', this.setFace.bind(this));

		this.canvas.addEventListener('keyup', this.onKeyUp.bind(this));
	}

	disableInput() {
		this.canvas.blur();
		this.canvas.removeEventListener('keydown', this.onKeyDown);
		this.canvas.removeEventListener('keyup', this.onKeyUp);
		this.canvas.removeEventListener('click', this.setFace);
		this.cell.removeEventListener('click', this.setEditor);
		this.spike.removeEventListener('click', this.setEditor);
		this.shield.removeEventListener('click', this.setEditor);
		//this.bounce.removeEventListener('click', this.setFace);
	}

	onKeyDown(e) {
		e.preventDefault();
		//wasd
		if (this.movementKeys.includes(e.code)) {
			this.keys[e.code] = true;
		}
		if (e.code === "KeyP") {
			this.snapshot();
		}
	}

	move() {
		//WD DS SA AW
		if (this.keys["KeyW"] &&
			this.keys["KeyD"]) {
			socket.emit('move', 1);
		}

		if (this.keys["KeyD"] &&
			this.keys["KeyS"]) {
			socket.emit('move', 3);
		}

		if (this.keys["KeyS"] &&
			this.keys["KeyA"]) {
			socket.emit('move', 5);
		}

		if (this.keys["KeyA"] &&
			this.keys["KeyW"]) {
			socket.emit('move',7);
		}

		// W A S D
		if (this.keys["KeyW"]) {
			socket.emit('move', 0);
		}

		if (this.keys["KeyD"]) {
			socket.emit('move',2);
		}

		if (this.keys["KeyS"]) {
			socket.emit('move', 4);
		}

		if (this.keys["KeyA"]) {
			socket.emit('move', 6);
		}
	}

	onKeyUp(e) {
		this.keys[e.code] = undefined;
	}

	setName(name) { 
		localStorage.setItem('user_name', name);
		socket.emit('registerUser',  name);
	}

	displayAttachError(data) {

	}

	gameOver() {
		this.disableInput();
	}

	snapshot() {
		const src = this.canvas.toDataURL('image/jpeg');

		this.doJSONRequest("POST", "/moments/upload", {src: src})
			.then((result) => {
				const item = result.data;
				// TODO: move to the "/moments" page when we have more APIs
				return this.doJSONRequest("POST", "/moments/imgur/" + item._id);
			})
			.then((result) => {
				console.log("Uploaded on imgur:", result);
			})
			.catch(console.error);
	}

	doJSONRequest(method, url, body) {
		let host = window.location.protocol + "//" + window.location.hostname;
		if (window.location.port.length > 0) {
			host += ":" + window.location.port;
		}

		const payload = {
			body: body ? JSON.stringify(body) : undefined,
			headers: {
				"Accepts": "application/json",
				"Content-Type": body ? "application/json" : undefined
			},
			method: method
		};

		return fetch(host + url, payload)
			.then((result) =>
				(result.status === 200 ? result.json() : {success: false, code: result.status}));
	}
}