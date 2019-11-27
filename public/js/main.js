const menu_enter = document.getElementById("menu_enter");
const play_button = document.querySelector("div[id=menu_enter] button");

// popup
const info = document.getElementById("menu_info");
const rules = document.getElementById("menu_rules");
const menu = document.getElementById("menu_enter");

//buttons
const btn_info = document.getElementById("info");
const btn_rules = document.getElementById("rules");
const btn_back = document.querySelectorAll(".back");

btn_back.forEach((el) => {
    el.addEventListener('click', () => {
        document.querySelectorAll(".menu_enter").forEach((el) => {
            if (el.id != "menu_enter" ) {
                el.classList.add("hidden");
            } else {
                el.classList.remove("hidden");
            }
        });
    });
});

let socket = undefined;

let angle = 0;
let inGame = false;

function init(name) {
    console.log(name);
	// Create canvas app
    const app = new App({ canvas: 'canvas', inputs: { shield: 'shield', bounce: 'bounce', spike: 'spike', cell: 'cell' } });

    //initialize socket
	socket = io();

    if (!inGame) {
    	app.enableInput();
    	inGame = true;
    } else {
    	app.disableInput();
    	inGame = false;
    }

    // set name
    app.setName(name);

    socket.on('message', function(msg){
    	//console.log(msg);
    });

    socket.on('drawWorld', function(data) {
    	//console.log(data);
    	app.drawMap(data);

    });

}

window.onload = () => {
    //main page
	menu_enter.querySelector("div audio").play();
    menu_enter.querySelector("div input").onkeyup = () => {
        angle += 45;
        document.getElementById("logo_input").style.transform = "rotate("+angle+"deg)";
    };

    btn_info.onclick = () => {
        document.querySelectorAll(".menu_enter").forEach((el) => {
            if (el.id != "menu_info" ) {
                el.classList.add("hidden");
            } else {
                el.classList.remove("hidden");
            }
        });
    };

    btn_rules.onclick = () => {
        document.querySelectorAll(".menu_enter").forEach((el) => {
            if (el.id != "menu_rules" ) {
                el.classList.add("hidden");
            } else {
                el.classList.remove("hidden");
            }
        });
    };

    //init game
    play_button.onclick = () => {
        let name = document.getElementById("username").value;
        menu.parentNode.remove();
        init(name);
    };
}
