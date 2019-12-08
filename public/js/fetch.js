/* Fetch */

/** 
 * @function doFetchRequest
 * @param {String} method The method of the Fetch request. One of: "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"
 * @param {String} url The url of the API to call, optionally with parameters.
 * @param {Object} headers The Associative Array containing the Request Headers. It must be undefined if there are no headers.
 * @param {String} body The body String to be sent to the server. It must be undefined if there is no body.
 * @returns {Promise} which receives the HTTP response.
 */


function doFetchRequest(method, url, headers, body){
	let methods = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'PATCH'];
 
	if (!methods.includes(method)){
		throw new Error();
	}

	if ((method === "GET" || method === "OPTIONS" || method === "HEAD" || method === "DELETE")) {
		if (body != undefined) {
			throw new Error();
		} 
	}
	else {
		if (!(typeof body == 'string' || body instanceof String)) {
			throw new Error();
		} 
    } 
    	
    return fetch(url, {method: method, headers: headers, body: body});
 
}


/** @function doJSONRequest
 * @param {String} method The method of the Fetch request. One of: "GET", "POST", "PUT", "DELETE".
 * @param {String} url The url of the API to call, optionally with parameters.
 * @param {Object} headers The Associative Array containing the Request Headers. It must be undefined if there are no headers.
 * @param {Object} body The object to be sent as JSON body to the server. It must be undefined if there is no body.
 * @returns {Promise} which receives directly the object parsed from the response JSON.
 */
function doJSONRequest(method, url, headers, data){

	if (headers["Content-Type"] && headers["Content-Type"] != "application/json") {
        throw new Error();
    }

    if (headers["Accept"] && headers["Accept"] != "application/json") {
        throw new Error();
    }

    if (method == "GET" || method == "OPTIONS" || method == "HEAD" || method == "DELETE") {
		if (data != undefined) {
			throw new Error();
		}
	} 

	headers["Accept"] = 'application/json';

	if (method == "POST" || method == "PUT" || method == "PATCH") {
		if (!(typeof data == "object")) {
			throw new Error();
		} 
		headers["Content-Type"] = "application/json";
		data = JSON.stringify(data);
	}
		
	return doFetchRequest(method, url, headers, data).then((result) => {return result.json()});

}

function searchPlayers() {
	let name = document.querySelector("input[name=search_player]").value;


	doJSONRequest('GET', '/players/search?name='+name, {})
	.then((data) => {
		dust.render("partials/players_partial", {result: data}, function(err, out) {
			document.getElementById("players").innerHTML = out;  

		});
	});
}

function removeImage(e) {
	console.log("Delete Image: ", e.target.parentNode.id);

	let id = e.target.parentNode.id;

	doJSONRequest('DELETE', '/moments/'+id, {})
	.then((data) => {
		console.log("DATA", data);
		doJSONRequest('GET', '/moments', {})
		.then((data) => {
			console.log("DATA1", data);
			dust.render("moments", {result: data}, function(err, out) {
				console.log("OUT", out);
				document.body.innerHTML = out;
			});
		});
	});

}