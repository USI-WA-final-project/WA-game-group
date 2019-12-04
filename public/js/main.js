
const play_button = document.querySelector("div[id=menu_enter] button");

// popup
const info = document.getElementById("menu_info");
const rules = document.getElementById("menu_rules");
const menu_enter = document.getElementById("menu_enter");

//buttons
const btn_info = document.getElementById("info");
const btn_rules = document.getElementById("rules");
const btn_back = document.querySelectorAll(".back");
const input_name = document.getElementById("username");

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

window.onload = () => {
    //main page
    document.getElementById("jingle_menu").play();
    let playback = true;

    document.getElementById("audio_menu").addEventListener('click', () => {
        if (playback) {
            document.getElementById("audio_menu").innerHTML = "<img src=\"img/music-off.svg\" alt=\"music_off\">";
            document.getElementById("jingle_menu").pause();
            playback = false;
        } else {
            document.getElementById("audio_menu").innerHTML = "<img src=\"img/music-on.svg\" alt=\"music_on\">";
            document.getElementById("jingle_menu").play();
            playback = true;
        }
    });
    moveCursorToEnd(input_name);
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
    play_button.addEventListener('click', startGame);
    input_name.addEventListener('keypress', startGame);
}

//pos starting cursor
function moveCursorToEnd(el) {
    if (localStorage.getItem('user_name') != undefined) {
        input_name.value = localStorage.getItem('user_name');
    } else {
        input_name.value = "Ajax";
    }

    if (typeof el.selectionStart == "number") {
        el.selectionStart = el.selectionEnd = el.value.length;
    } else if (typeof el.createTextRange != "undefined") {
        el.focus();
        var range = el.createTextRange();
        range.collapse(false);
        range.select();
    }
}

function startGame(e) {
    if (e.code == "Enter" || e.code ==  undefined) {
        let name = input_name.value;
        let bg = document.querySelector(".hero");
        let user_name = "ajax";

        if (name != "" && /\S/.test(name)) {
            user_name = name;
        }

        document.getElementById("editor").classList.toggle("hidden");

        document.getElementById("usname").innerHTML = "@" + user_name;
        menu_enter.parentNode.removeChild(menu_enter);
        document.getElementById("stats").classList.toggle("hidden");
        document.getElementById("more").addEventListener('click', () => {
            document.getElementById("more").classList.toggle("hidden");
            document.getElementById("less").classList.toggle("hidden");
        });

        document.getElementById("less").addEventListener('click', () => {
            document.getElementById("less").classList.toggle("hidden");
            document.getElementById("more").classList.toggle("hidden");
        });

       

        bg.parentNode.removeChild(bg);

        document.getElementById("audio_game").play();
        let playback = true;

        document.getElementById("audio_toggle").addEventListener('click', () => {
            if (playback) {
                document.getElementById("audio_toggle").innerHTML = "<img src=\"img/music-off.svg\" alt=\"music_off\">Sound off";
                document.getElementById("audio_game").pause();
                playback = false;
            } else {
                document.getElementById("audio_toggle").innerHTML = "<img src=\"img/music-on.svg\" alt=\"music_on\">Sound on";
                document.getElementById("audio_game").play();
                playback = true;
            }
        });

        init(user_name);
    }
}

function init(name) {
    //console.log(worldSize);
    // Create canvas app
    //initialize socket
    socket = io();

    socket.on('worldData', function(data) {
        const app = new App({ canvas: 'canvas',
                              worldSize: { w: data.width, h: data.height },
                              inputs: { cell: 'cell', spike: 'spike', shield: 'shield', bounce: 'bounce',
                                        cancel: 'cancel', remove: 'remove' },
                              info: {cell: 'info_cells', spike: 'info_spikes', shield: 'info_shields', time: 'info_time', life: 'life' },
                              time: new Date() });



        if (!inGame) {
            app.enableInput();
            inGame = true;
        } else {
            app.disableInput();
            inGame = false;
        }

        app.playerColors = data.colors;

        // set name
        app.setName(name);

        socket.on('attachError', function(msg){
            //console.log(msg);
            app.displayAttachError(msg);
        });

        socket.on('drawWorld', function(data) {
            //console.log(data);
            app.drawMap(data);
        });

        socket.on('gameOver', function() {
            app.gameOver();
            dust.render('gameover', {result: []}, function(err, out) {
                //console.log(err);
                document.body.innerHTML = out;
            });
        });
    });

    socket.on('connect_error', function(msg){
        //render error
    });

    socket.on('disconnect', function(msg){
        //render error
    });

    socket.on('reconnect', function(msg){
       location.reload();
    });


}
