const menu_enter = document.getElementById("menu_enter");
const play_button = document.querySelector("div[id=menu_enter] button");

//play_button.addEventListener("click", init);

function assets() {
	return new Promise(resolve => {
		const map = new Image();
		map.onload = () => {
			resolve();
		};
		map.src = 'img/bg.jpg';
	});
}

function init() {
	return new Promise(resolve => {
		resolve();
	});
}
Promise.all([assets(), init()]).then(() => {
	play_button.onclick = () => {
		console.log("START");
		menu_enter.parentNode.removeChild(menu_enter);
	};
});
