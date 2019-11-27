const menu_enter = document.getElementById("menu_enter");
const play_button = document.querySelector("div[id=menu_enter] button");

// popup
const info = document.getElementById("menu_info");
const rules = document.getElementById("menu_rules");

//buttons
const btn_info = document.getElementById("info");
const btn_rules = document.getElementById("rules");
// const btn_back = document.querySelector("#menu back");



btn_info.onclick = () => {
	//console.log(info);
	let parent = menu_enter.parentNode;
	parent.removeChild(menu_enter);
    console.log("INFO", info);
    console.log("PARENT", parent);
	parent.innerHTML = info.innerHTML;
    console.log("PARENT", parent);
};

// btn_back.onclick = () => {
//     //console.log(info);
//     console.log("CLICKED");
//     let parent = btn_back.parentNode;
//     parent.innerHTML = menu_enter.innerHTML;
//     console.log("PARENT", parent);
//     // info.classList.toggle("hidden");
// };

btn_rules.onclick = () => {
    //console.log(info);
    let parent = menu_enter.parentNode;
    parent.removeChild(menu_enter);
    console.log("INFO", rules);
    console.log("PARENT", parent);
    parent.innerHTML = rules.innerHTML;
    console.log("PARENT", parent);
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
    console.log("BUTTON BACK", btn_back);
}

play_button.onclick = () => {
	console.log("START");
	menu_enter.parentNode.removeChild(menu_enter);
	init();
};
