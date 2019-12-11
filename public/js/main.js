
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

localStorage.setItem('playback', "false");

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
    if (window.location.pathname == "/players") {
        document.querySelector("input[name=search_player]").addEventListener('keyup', searchPlayers);
    }

    if (window.location.pathname == "/") {
        if (document.getElementById("audio_menu")) {
            document.getElementById("audio_menu").addEventListener('click', () => {
                if (localStorage.getItem('playback') == "true") {
                    document.getElementById("audio_menu").innerHTML = "<img src=\"img/music-off.svg\" alt=\"music_off\">";
                    document.getElementById("jingle_menu").pause();
                    localStorage.setItem('playback', "false");
                } else {
                    document.getElementById("audio_menu").innerHTML = "<img src=\"img/music-on.svg\" alt=\"music_on\">";
                    document.getElementById("jingle_menu").play();
                    localStorage.setItem('playback', "true");
                }
            })
        }
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

    if (window.location.pathname == "/moments") {
        var source;
        document.querySelectorAll('.photography').forEach((el) => {
            el.addEventListener('click', (e) => {
                // console.log("SRC", e.target.src);
                source = e.target.src;
                document.getElementById("new_img").src = source;
                // console.log("Title", e.target.parentNode.childNodes[0].innerHTML);
                document.querySelector("#popup div").innerHTML = "<h3>" + e.target.parentNode.childNodes[0].innerHTML + "</h3>";
                document.getElementById("gallery").classList.toggle("hidden");
                document.getElementById("popup").classList.toggle("hidden");
            });

        });

        document.querySelector("#popup button").addEventListener('click', () => {
            console.log("CHIUSO");
            document.getElementById("gallery").classList.toggle("hidden");
            document.getElementById("popup").classList.toggle("hidden");
        });

        document.querySelectorAll("button[type=delete]").forEach((x) => {
            x.addEventListener('click', removeImage);
        });

    }

}

//pos starting cursor
function moveCursorToEnd(el) {
    if (localStorage.getItem('user_name') != undefined) {
        input_name.value = localStorage.getItem('user_name');
    } else {
        input_name.value = "ajax";
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

        if (name != "" && /\S/.test(name) && name.length < 14) {
            user_name = name;
        }

        if (localStorage.getItem('playback') == "true") {
            document.getElementById("audio_toggle").innerHTML = "<img src=\"img/music-on.svg\" alt=\"music_on\">Sound on";
            document.getElementById("audio_game").play();
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

        document.getElementById("audio_toggle").addEventListener('click', () => {
            if (localStorage.getItem('playback') == "true") {
                document.getElementById("audio_toggle").innerHTML = "<img src=\"img/music-off.svg\" alt=\"music_off\">Sound off";
                document.getElementById("audio_game").pause();
                localStorage.setItem('playback', "false");
            } else {
                document.getElementById("audio_toggle").innerHTML = "<img src=\"img/music-on.svg\" alt=\"music_on\">Sound on";
                document.getElementById("audio_game").play();
                localStorage.setItem('playback', "true");
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
                              world: { w: data.width, h: data.height, cost_cell: data.upgradesCosts.cell,
                                        cost_spike: data.upgradesCosts.spike, cost_shield: data.upgradesCosts.shield },
                              inputs: { cell: 'cell', spike: 'spike', shield: 'shield', bounce: 'bounce',
                                        cancel: 'cancel', remove: 'remove', camera: 'camera' },
                              info: {cell: 'info_cells', spike: 'info_spikes', shield: 'info_shields', time: 'info_time',
                                     life: 'life', kills: 'info_killed', res: 'info_res', score: 'info_score'},
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

        socket.on('gameOver', function(data) {
            app.gameOver();
            console.log("FINAL SCORE", data.score);
            dust.render('gameover', {}, function(err, out) {
                //console.log(err);
                document.body.innerHTML = out;
                if (localStorage.getItem('playback') == "true") {
                    document.getElementById("over").play();
                }
                //Add score to game over page 
                document.getElementById("final_score").innerHTML = "Score: " + Math.floor(data.score);
            });
        });
    });

    socket.on('connect_error', function(msg){
        //render error
        dust.render('error', {result: []}, function(err, out) {
            //console.log(err);
            document.body.innerHTML = out;
        });
    });

    socket.on('disconnect', function(msg){
        //render error
        dust.render('error', {result: []}, function(err, out) {
            //console.log(err);
            document.body.innerHTML = out;
        });
    });

    socket.on('reconnect', function(msg){
       location.reload();
    });


}
