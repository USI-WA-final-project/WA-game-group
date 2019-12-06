// TODO: clientside app
class App {
	constructor(object) {
		//canvas
		this.canvas = document.getElementById(object.canvas);
		this.minCanvas = document.getElementById('minimap');

		if (this.canvas.tagName !== 'CANVAS') {
			throw new Error("It should be a canvas");
		}

		this.graphics = GraphicsFactory.provideImplementation();
		this.graphics.setWorldSize(object.worldSize.w, object.worldSize.h);

		this.minCtx = this.minCanvas.getContext('2d');

		//graphic interface
		this.setupComposer(true);

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
		this.camera = document.getElementById(object.inputs.camera);
		this.cancel = document.getElementById(object.inputs.cancel);
		this.removeParts = document.getElementById(object.inputs.remove);

		//info Player parts
		this.life = document.getElementById(object.info.life);
		this.infoCell = document.getElementById(object.info.cell);
		this.infoSpike = document.getElementById(object.info.spike);
		this.infoShield = document.getElementById(object.info.shield);
		//this.infoBounce = document.getElementById(object.info.bounce);

		this.time = document.getElementById(object.info.time);

		//value initial time
		this.valueTime = object.time;

		window.addEventListener('resize', (e) => {
			this.setupComposer(false);
			this.gridImage = this.drawGrid();
		});
	}

	setupComposer(firstTime = false) {
		const dpi = window.devicePixelRatio / 2;
		const height = +getComputedStyle(this.canvas).getPropertyValue("height").slice(0, -2);
		const width = +getComputedStyle(this.canvas).getPropertyValue("width").slice(0, -2);

		this.canvas.setAttribute("height", height * dpi);
		this.canvas.setAttribute("width", width * dpi);

		if (firstTime) {
			this.graphics.setCanvas(this.canvas);
		} else {
			this.graphics.updateCanvas(width * dpi, height * dpi);
		}
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
			case 'remove':
				this.editor.mode = true;
				break;
			default:
				this.editor.mode = false;
		}

		document.querySelectorAll('.editor-element').forEach((el) => {
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
		document.querySelectorAll('.editor-element').forEach((el) => {
			el.classList.remove('buttonclicked');
		});
	}

	setFace(e) {
		if (this.editor != undefined) {
			this.editor.focus = {x: e.offsetX, y: e.offsetY};
			if (!this.editor.mode) {
				this.cellEdited.face =  this.editor.findFace();
				this.cellEdited.part = this.editor.counter;

				if (this.cellEdited.type != undefined && this.cellEdited.face != undefined) {
					//console.log(this.cellEdited.type, this.editor.counter, this.cellEdited.face);
					socket.emit('attachPart', { type: this.cellEdited.type, 
												part: this.cellEdited.part, 
												face: this.cellEdited.face });
				}
			} else {
				let face;
				face = this.editor.removePart();
				let part;
				//console.log(this.playerBody, this.editor.counter);
				for (let i = 0; i < this.playerBody.length; i++) {
					if (i == this.editor.counter) {
						part = this.editor.counter;
						if (face != undefined) {
							part = this.playerBody[part].faces[face];
						} else {
							break;
						}
					}
				}
				//console.log(part);
				if (part != 0) {
					socket.emit('removePart', {part: part});
				} else {
					console.error("you can not remove main cell");
				}
			}
		}
	}

	drawMap(data) {
		this.graphics.clearCanvas();
		let sx = data.playerPosition.x;
		let sy = data.playerPosition.y;
		this.graphics.drawGrid({x: sx, y: sy});

		//this.drawMiniMap({x: sx, y: sy});
		//console.log(this.miniMap);
		if (this.miniMap !== undefined) {
			//this.minCtx.drawImage(this.miniMap, 0, 0);
		}

		this.move();

		for (let i = 0; i < data.players.length; i++) {
			const it = data.players[i];
			if (it.position.x !== 0 || it.position.y !== 0) continue;

			this.playerBody = it.components;
			this.updateInfo(this.playerBody, it.health);
			if (this.editor !== undefined){
				this.setCenters(this.playerBody);
			}
			break;
		}

		this.graphics.drawPlayers(data.players, this.playerColors);
	}

	drawGrid () {
		//TODO: andrea minimap
/*
		this.minCtx.clearRect(0, 0, 300, 200);

		//console.log(img);

		this.minCanvas.width = 300;
		this.minCanvas.height = 200;

		this.minCtx.save();
		this.minCtx.scale(1, 1);
		this.minCtx.drawImage(c.canvas, this.canvas.width/2, this.canvas.height/2,this.worldW, this.worldH, 0, 0, 300, 200);
		this.minCtx.restore();
*/
	}

	drawMiniMap(pos) {
		if (pos !== undefined) {
			this.minCtx.clearRect(0, 0, 300, 200);
			let img = this.gridImage;
			//console.log(img);
			let width = 300;
			let height = 200;

			this.minCanvas.width = 300;
			this.minCanvas.height = 200;

			this.minCtx.save();
			this.minCtx.scale(this.canvas.width/300, this.canvas.width/300);
			this.minCtx.drawImage(img,0,0);
			this.minCtx.restore();
			//console.log(this.minCanvas.toDataURL());
			// c.beginPath();
			// c.arc(pos.x, pos.y, 1, 0, 2 * Math.PI, true);
			// c.fill();
		}
	}

	setCenters(components) {
		//console.log(components);
		let componentsCenter = Array.from(new Array(components.length));
		componentsCenter[0] = {x: this.canvas.width/2, y: this.canvas.height/2};
		let visited = [];
		components.forEach((el) => {
			if (el != null) {
				if (el.type == 0) {
					visited.push(0);
				} else {
					visited.push(-1);
				}
			} else {
				visited.push(-1);
			}
		});

		/*for (let j = 0; j < components.length; j++) {
			if (components[j] != null && components[j].type == 0) {
				for (let k = 0; k < 6; k++) {

					let node = components[j].faces[k];
					
					if (node != null && node != -1) {
						//console.log(node);
						if (components[node].type == 0 && visited[node] == 0){
							if (componentsCenter[j] != undefined) {
								componentsCenter[node] = this.graphics.getNextCenter(componentsCenter[j], k);
								visited[node] = 1;
							}
						}
						if (visited[node] == null) {
							componentsCenter[j] = -1;
						}
					}
				}
				visited[j] = 1;
			} else {
				componentsCenter[j] = -1;
			}
			visited[j] = 1;
		}*/

		this.childCenter(visited, components, componentsCenter, 0);
		//console.log(components, componentsCenter);
		this.editor.centers = componentsCenter;
	}

	childCenter(visited, components, componentsCenter, elem) {
		visited[elem] = 1;
		if ( components[elem] != null) {
			for(let i = 0; i < 6; i++) {
				if (components[elem].faces[i] != null) {
					if (visited[components[elem].faces[i]] == 0) {
						if (components[elem].faces[i] != -1) {
							if (components[elem].type == 0) {
								componentsCenter[components[elem].faces[i]] = this.graphics.getNextCenter(componentsCenter[elem], i);
								this.childCenter(visited, components, componentsCenter, components[elem].faces[i]);
							}
						} else {
							componentsCenter[components[elem].faces[i]] = -1;
						}
					}
				} else {
					componentsCenter[components[elem].faces[i]] = -1;
				}
			}
		} else {
			componentsCenter[components[elem].faces[i]] = -1;
		}
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
		this.life.style.background = "-webkit-linear-gradient(left, green "+life+"%, white "+(100 - life)+"%)";

		this.infoCell.innerHTML = info.cell + "&nbsp;";
		this.infoSpike.innerHTML = info.spike + "&nbsp;";
		this.infoShield.innerHTML = info.shield + "&nbsp;";
		this.time.innerHTML = (currentTime.getHours() < 10 ? ("0" + currentTime.getHours()) : currentTime.getHours()) +
			":" + (currentTime.getMinutes() < 10 ? ("0" + currentTime.getMinutes()) : currentTime.getMinutes()) +
			":" + (currentTime.getSeconds() < 10 ? ("0" + currentTime.getSeconds()) : currentTime.getSeconds());
	}

	enableInput() {
		this.canvas.focus();
		document.addEventListener('keydown', this.onKeyDown.bind(this));
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

		this.removeParts.addEventListener('click', function() {
			this.setEditor('remove');
		}.bind(this));

		this.cancel.addEventListener('click', this.setEditCancel.bind(this));

		/*this.cell.addEventListener('click', function(){
			this.setEditor('bounce').bind(this);
		});*/

		this.camera.addEventListener('click', this.snapshot.bind(this));

		this.canvas.addEventListener('click', this.setFace.bind(this));

		document.addEventListener('keyup', this.onKeyUp.bind(this));
	}

	disableInput() {
		this.canvas.blur();
		document.removeEventListener('keydown', this.onKeyDown);
		document.removeEventListener('keyup', this.onKeyUp);
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
		//dust render

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