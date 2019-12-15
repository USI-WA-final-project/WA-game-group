// TODO: clientside app
class App {
	constructor(object) {
		//canvas
		this.canvas = document.getElementById(object.canvas);
		this.minCanvas = document.getElementById('minimap');

		if (this.canvas.tagName !== 'CANVAS') {
			throw new Error("It should be a canvas");
		}

		this.worldW = object.world.w;
		this.worldH = object.world.h;

		this.graphics = GraphicsFactory.provideImplementation();
		this.graphics.setWorldSize(this.worldW, this.worldH);

		//graphic interface
		this.setupComposer(true);
		this.costs = {cell: object.world.cost_cell, spike: object.world.cost_spike, shield: object.world.cost_shield, bounce: 1,}

		//array keys movement
		this.movementKeys = ["KeyW", "KeyD", "KeyS", "KeyA"];

		//array keys chose edit
		this.editKeys = ["Digit1", "Digit2", "Digit3", "Digit4"];

		//current movement key
		this.keys = {};

		//player structure
		this.playerBody = undefined;

		//player resources
		this.res = 0;

		//allow editor
		this.allow = { cell: false, spike: false, shield: false, };

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
		this.infoKills = document.getElementById(object.info.kills);
		this.infoRes = document.getElementById(object.info.res);
		this.infoScore = document.getElementById(object.info.score);
		//this.infoBounce = document.getElementById(object.info.bounce);

		this.time = document.getElementById(object.info.time);

		//value initial time
		this.valueTime = object.time;

		window.addEventListener('resize', (e) => {
			this.setupComposer(false);
		});

		window.addEventListener('mouseleave', (e) => {
			this.keys = {};
			socket.emit('stopMove');
		});
	}

	setupComposer(firstTime = false) {
		const dpi = window.devicePixelRatio;
		const height = +getComputedStyle(this.canvas).getPropertyValue("height").slice(0, -2);
		const width = +getComputedStyle(this.canvas).getPropertyValue("width").slice(0, -2);

		this.canvas.setAttribute("height", height * dpi);
		this.canvas.setAttribute("width", width * dpi);

		if (firstTime) {
			this.graphics.setCanvas(this.canvas, this.minCanvas);
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
					//console.log(this.cellEdited.type, this.cellEdited.part, this.cellEdited.face);
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
		//console.log(data);
		this.graphics.clearCanvas();
		let sx = data.playerPosition.x;
		let sy = data.playerPosition.y;
		this.graphics.drawBackground({x: sx, y: sy});

		//console.log(this.miniMap);
		if (this.miniMap !== undefined) {
			//this.minCtx.drawImage(this.miniMap, 0, 0);
		}

		//this.move();

		for (let i = 0; i < data.players.length; i++) {
			const it = data.players[i];
			if (it.position.x !== 0 || it.position.y !== 0) continue;
			this.res = it.resources;
			const info_plr = {life: it.health, kills: it.kills, res: it.resources,
							  score: it.score, cell: data.playerParts.cells, spike: data.playerParts.spikes,
							  shield: data.playerParts.shields, bounce: data.playerParts.bounces };
			this.allowEditor(it.resources);

			this.playerBody = it.components;
			this.updateInfo(this.playerBody, info_plr);
			if (this.editor !== undefined){
				this.setCenters(this.playerBody);
			}
			break;
		}
		this.graphics.drawContents(data.players, this.playerColors, data.resources);
	}

	allowEditor(res) {
		if (res >= this.costs.cell) {
			this.allow.cell = true;
			this.cell.style.opacity = "1";
		} else {
			//color
			this.cell.style.opacity = "0.4";
		}

		if (res >= this.costs.spike) {
			this.allow.spike = true;
			this.spike.style.opacity = "1";
		} else {
			//color
			this.spike.style.opacity = "0.4";
		}

		if (res >= this.costs.shield) {
			this.allow.shield = true;
			this.shield.style.opacity = "1";
		} else {
			//color
			this.shield.style.opacity = "0.4";
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

		this.childCenter(visited, components, componentsCenter, 0);
		this.editor.centers = componentsCenter;
	}

	childCenter(visited, components, componentsCenter, elem) {
		visited[elem] = 1;
		if ( components[elem] != null) {
			for(let i = 0; i < 6; i++) {
				if (components[elem].faces[i] != null && visited[components[elem].faces[i]] == 0) {
					if (components[elem].faces[i] != -1) {
						if (components[elem].type == 0) {
							componentsCenter[components[elem].faces[i]] = this.graphics.getNextCenter(componentsCenter[elem], i);
							this.childCenter(visited, components, componentsCenter, components[elem].faces[i]);
						}
					}
				}
			}
		}
	}

	updateInfo(elems, plr) {
		let factor = 60000;
		let currentTime = new Date(Date.now() - this.valueTime.getTime() + factor * this.valueTime.getTimezoneOffset());

		this.life.style.background = "-webkit-linear-gradient(left, green "+plr.life+"%, white "+(100 - plr.life)+"%)";

		this.infoCell.innerHTML = plr.cell + "&nbsp;";
		this.infoSpike.innerHTML = plr.spike + "&nbsp;";
		this.infoShield.innerHTML = plr.shield + "&nbsp;";
		this.infoKills.innerHTML = plr.kills + "&nbsp;";
		this.infoRes.innerHTML = plr.res + "&nbsp;";
		this.infoScore.innerHTML = plr.score + "&nbsp;";
		this.time.innerHTML = (currentTime.getHours() < 10 ? ("0" + currentTime.getHours()) : currentTime.getHours()) +
			":" + (currentTime.getMinutes() < 10 ? ("0" + currentTime.getMinutes()) : currentTime.getMinutes()) +
			":" + (currentTime.getSeconds() < 10 ? ("0" + currentTime.getSeconds()) : currentTime.getSeconds());
	}

	enableInput() {
		this.canvas.focus();
		document.addEventListener('keydown', this.onKeyDown.bind(this));
		document.addEventListener('keyup', this.onKeyUp.bind(this));
		//inputs
		this.cell.addEventListener('click', function(){
			if (this.allow.cell) {
				this.setEditor('cell');
			}
		}.bind(this));

		this.spike.addEventListener('click', function(){
			if (this.allow.spike) {
				this.setEditor('spike');
			}
		}.bind(this));

		this.shield.addEventListener('click', function(){
			if (this.allow.shield) {
				this.setEditor('shield');
			}
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
		this.camera.removeEventListener('click', this.snapshot);
		this.cancel.removeEventListener('click', this.setEditCancel);
	}

	onKeyDown(e) {
		e.preventDefault();
		//wasd
		if (this.movementKeys.includes(e.code)) {
			this.keys[e.code] = true;
			this.chooseMv();
		}

		if (this.editKeys.includes(e.code)) {
			let type;
			switch (e.code) {
				case 'Digit1':
					type = 'cell';
					break;
				case 'Digit2':
					type = 'spike';
					break;
				case 'Digit3':
					type = 'shield';
					break;
				case 'Digit4':
					type = 'remove';
					break;
			}

			this.setEditor(type);
		}
	}

	chooseMv() {
		//WD DS SA AW
		let dir = undefined;
		if (this.keys["KeyW"] &&
			this.keys["KeyD"]) {
			dir = 1;
		} else if (this.keys["KeyD"] &&
			this.keys["KeyS"]) {
			dir = 3;
		} else if (this.keys["KeyS"] &&
			this.keys["KeyA"]) {
			dir = 5;
		} else if (this.keys["KeyA"] &&
			this.keys["KeyW"]) {
			dir = 7;
		} else if (this.keys["KeyW"]) {
			dir = 0;
		} else if (this.keys["KeyD"]) {
			dir = 2;
		} else if (this.keys["KeyS"]) {
			dir = 4;
		} else if (this.keys["KeyA"]) {
			dir = 6;
		} else {
			dir = -1;
		}

		if (dir != -1) {
			socket.emit("startMove", dir);
		} else {
			socket.emit('stopMove');
		}
		//console.log(this.keys,dir, this.keys["KeyW"], this.keys["KeyD"]);
	}

	onKeyUp(e) {
		this.keys[e.code] = undefined;
		this.chooseMv();
	}


	setName(name) {
		localStorage.setItem('user_name', name);
		socket.emit('registerUser',  name);
	}

	notify(data) {
		this.graphics.notify(data.message);
	}

	gameOver() {
		this.disableInput();
		//dust render

	}

	snapshot() {
		this.graphics.requestSnapshot((data) => {
			const name = localStorage.getItem("user_name");

			const snapCanvas = document.createElement("canvas");
			snapCanvas.width = this.canvas.width;
			snapCanvas.height = this.canvas.height;
			const snapCtx = snapCanvas.getContext("2d");
			snapCtx.putImageData(data, 0, 0);
			snapCtx.font = "90px Inter";
			snapCtx.fillText("legendofajax.fun", 100, snapCanvas.height - 100);

			const src = snapCanvas.toDataURL("image/jpeg");
			this.doJSONRequest("POST", "/moments/upload", {
				src: src,
				name: `${name} (${this.getDate()})`
			}).then((result) => {
				if (result.success) {
					this.notify({message: "The moment has been saved."});
				} else {
					this.notify({message: "Failed to save the moment"});
				}
			}).catch((e) => {
				this.notify({message: e.message});
			})
		});
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

	getDate() {
		const padTen = (num) => {
			return num < 10 ? "0" + num : num;
		};

		const date = new Date();
		const year = date.getFullYear();
		let month = padTen(date.getMonth() + 1);
		let day = padTen(date.getDate());
		let hours = padTen(date.getHours());
		let minutes = padTen(date.getMinutes());
		return `${year}-${month}-${day} ${hours}:${minutes}`;
	}
}