const menu_enter = document.getElementById("menu_enter");
const play_button = document.querySelector("div[id=menu_enter] button");

// popup
const info = document.getElementById("menu_info");
const rules = document.getElementById("menu_rules");

//buttons
const btn_info = document.getElementById("info");

btn_info.onclick = () => {
	//console.log(info);
	let parent = menu_enter.parentNode;
	parent.removeChild(menu_enter);
	parent.innerHTML = info;
	info.classList.toggle("hidden");
};

let socket = undefined;

let angle = 0;
let inGame = false;

menu_enter.querySelector("div input").onkeyup = () => {
	angle += 45;
	document.getElementById("logo_input").style.transform = "rotate("+angle+"deg)";
};

function init() {
	// Create canvas app
    const app = new App({ canvas: 'canvas' });

    //initialize socket
	socket = io();

    if (!inGame) {
    	app.enableInput();
    	inGame = true;
    } else {
    	app.disableInput();
    	inGame = false;
    }

    socket.on('message', function(msg){
    	//console.log(msg);
    });

    socket.on('drawWorld', function(data) {
    	//console.log(data);
    	app.drawMap(data);

    });
}

window.onload = () => {
	menu_enter.querySelector("div audio").play();
}

play_button.onclick = () => {
	console.log("START");
	menu_enter.parentNode.removeChild(menu_enter);
	init();
};
