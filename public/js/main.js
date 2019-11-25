const menu_enter = document.getElementById("menu_enter");
const play_button = document.querySelector("div[id=menu_enter] button");

let angle = 0;

menu_enter.querySelector("div input").onkeyup = () => {
	angle += 45;
	document.getElementById("logo_input").style.transform = "rotate("+angle+"deg)";
}

function init() {
	// Create canvas app
    const app = new App({ canvas: 'canvas' });

    app.drawMap();
}

window.onload = () => {
	menu_enter.querySelector("div audio").play();
}

function assets() {
	return new Promise(resolve => {
		const map = new Image();
		map.onload = () => {
			resolve();
		};
		map.src = 'img/bg.jpg';
	});
}

function connect() {
	return new Promise(resolve => {
		resolve();
	});
}

Promise.all([assets(), connect()]).then(() => {

	play_button.onclick = () => {
		console.log("START");
		menu_enter.parentNode.removeChild(menu_enter);
		init();
	};
});
