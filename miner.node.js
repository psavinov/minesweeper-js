/*
Minesweeper by Pavel Savinov, 01.07.2012
NodeJS part
www.pavelsavinov.info
 */
var http = require("http");
var url = require("url");
var fs = require("fs");
var mongo = require("mongodb");
var sessions = new Array();

/*** ESPECIFIQUE AQUÍ SU SERVIDOR Y PUERTO DE MongoDB Y EL PUERTO PARA SERVIDOR DEL JUEGO ***/
var GAME_SERVER_PORT = 8080;
var host = 'localhost';
var port = mongo.Connection.DEFAULT_PORT;



/*
	Obtener el valor de cookie
*/
function getCookie(request, name) {
	var cookie = " " + request.headers.cookie;
	var search = " " + name + "=";
	var setStr = "";
	var offset = 0;
	var end = 0;
	if (cookie.length > 0) {
		offset = cookie.indexOf(search);
		if (offset != -1) {
			offset += search.length;
			end = cookie.indexOf(";", offset)
				if (end == -1) {
					end = cookie.length;
				}
				setStr = unescape(cookie.substring(offset, end));
		}
	}
	return setStr;
}

/*
	Nuevo identificador de sesión
*/
function newSessionId() {
	var d = new Date();
	var id = "session-" + Math.random() + "-" + d.getTime();
	return id;
}

/*
	Forma para especificar los parámetros
*/
var welcomeForm = "<html><br/><br/><center>Miner by Pavel Savinov<br/><br/>" +
	"<form method='get' action='/'><table><tr><td>" +
	"Name:&nbsp;</td><td><input type='text' value='Miner' name='user'/></td></tr>" +
	"<tr><td>Width:&nbsp;</td><td><input type='text' name='width' value='10'/>" +
	"</td></tr><tr><td>Height:&nbsp;</td><td><input type='text' name='height'" +
	"value='10'/></td></tr><tr><td>Mines count:&nbsp;</td><td><input type='text' value='20'" +
	"name='count'/></td></tr><tr><td colspan='2'><center><br/><input type='submit'" +
	"value='Start game'/><input type='hidden' name='option' value='start'/>" +
	"&nbsp;<input type='button' value='Score board' onclick='javascript:document.location=\"/?option=scoreboard\";'/>" +
	"</center></td></tr></table></form></center></html>";

/*
	Creación de servidor HTTP con Node.JS
*/
http.createServer(function (request, response) {
	
	var params = url.parse(request.url, true).query;
	if (url.parse(request.url, true).pathname == "/miner.js") {
		var data = fs.readFileSync("miner.js");
		response.writeHead(200, {
			"Content-Type" : "text/plain"
		});
		response.write(data.toString());
		response.end();
	}
	switch (params["option"]) {
	case "start":
		doStart(request, response, params);
		break;
	case "reset":
		doReset(request, response);
		break;
	case "exit":
		doExit(request, response);
		break;
	case "scoreboard":
		doShowScoreboard(request, response);
		break;
	case "save":
		doSaveScore(request, response, params);
		break;
	default:
		doDefaultCase(request, response);
		break;
	}	
}).listen(GAME_SERVER_PORT);

/*
	Transformación de data
*/
function formatDate(d){
	var day = d.getDate()<10 ? "0"+d.getDate() : d.getDate+"";
	var month = d.getMonth()+1<10 ? "0"+(d.getMonth()+1) : (d.getMonth()+1)+"";
	var year = d.getFullYear();
	var hour = d.getHours()<10 ? "0"+d.getHours() : d.getHours()+"";
	var minute = d.getMinutes()<10 ? "0"+d.getMinutes() : d.getMinutes()+"";
	
	return (day+"."+month+"."+year+"  "+hour+":"+minute);
	
}

/*
	Demostración de la tabla de ganadores
*/
function doShowScoreboard(request, response) {
	var db = new mongo.Db('psminer-results', new mongo.Server(host, port, {}), {});
	
	var outString = "<html><head><title>Miner Score Board</title><style>td {border:1px solid black; padding:3px;}</style></head>"+
		"<center><h2>Miner Score Board</h2><br/><table style='border:1px solid black;border-collapse:collapse;width:600px;'>";
	outString += "<tr><td width='60%'><b>Name:</b></td><td width='25%'><b>Date:</b></td><td><b>Score:</b></td></tr>";
	db.open(function (err, db) {
		db.collection('results', function (err, collection) {
			collection.find().toArray(function (err, items) {
				for (var k = 0; k < items.length; k++) {
					var item = items[k];
					if (item != null) {
						outString += "<tr><td>" + item["user"] + "</td><td>" + formatDate(item["date"]) + "</td><td>" + item["score"] + "</td></tr>";
					}
				}
				outString += "</table><br/><br/><input type='button' value='Back to main' onclick='javascript:document.location=\"/\";'/></center></html>";
				response.writeHead(200, {
					"Content-Type" : "text/html",
				});
				response.write(outString);
				response.end();
			});
		});
	});
}

/*
	Empezar el juego nuevo
*/
function doStart(request, response, params) {
	var sessionId = newSessionId();
	sessions[sessionId] = params["user"];
	var data = fs.readFileSync("miner.html");
	response.writeHead(200, {
		"Content-Type" : "text/html",
		"Set-Cookie" : ["PSMinerSessionID=" + sessionId, "mineFieldWidth=" + params["width"], "mineFieldHeight=" + params["height"], "mineCount=" + params["count"]]
	});
	response.write(data.toString().replace(/\%\{userName\}/ig, params["user"]));
	response.end();
}

/*
	Volver a cargar el juego
*/
function doReset(request, response) {
	var sid = getCookie(request, "PSMinerSessionID");
	var user = "user";
	if (sessions[sid]) {
		user = sessions[sid];
		delete sessions[sid];
	}
	var sessionId = newSessionId();
	sessions[sessionId] = user;
	var data = fs.readFileSync("miner.html");
	response.writeHead(200, {
		"Content-Type" : "text/html",
		"Set-Cookie" : ["PSMinerSessionID=" + sessionId]
	});
	response.write(data.toString().replace(/\%\{userName\}/ig, user));
	response.end();
}

/*
	Salir del juego
*/
function doExit(request, response) {
	var sid = getCookie(request, "PSMinerSessionID");
	var user = "user";
	if (sessions[sid]) {
		delete sessions[sid];
	}
	response.writeHead(200, {
		"Content-Type" : "text/html"
	});
	response.write(welcomeForm);
	response.end();
}

/*
	Guardar los resultados
*/
function doSaveScore(request, response, params) {
	var host = 'localhost';
	var port = mongo.Connection.DEFAULT_PORT;
	var sid = getCookie(request, "PSMinerSessionID");
	var user = "UnknownUser";
	if (sessions[sid]) {
		user = sessions[sid];
		delete sessions[sid];
	}
	var db = new mongo.Db('psminer-results', new mongo.Server(host, port, {}), {});
	db.open(function (err, db) {
		db.collection('results', function (err, collection) {
			var results = {
				"user" : user,
				"score" : params["score"],
				"date" : new Date()
			};
			collection.insert(results);
		});
	});
	
	response.writeHead(200, {
		"Content-Type" : "text/html"
	});
	response.write("<script>document.location='/?option=scoreboard';</script>");
	response.end();
}

/*
	Elegir el juego o la forma de inicialización
*/
function doDefaultCase(request, response) {
	if (getCookie(request, "PSMinerSessionID") == "") {
		response.writeHead(200, {
			"Content-Type" : "text/html"
		});
		response.write(welcomeForm);
	} else {
		var sid = getCookie(request, "PSMinerSessionID");
		if (sessions[sid]) {
			var data = fs.readFileSync("miner.html");
			response.writeHead(200, {
				"Content-Type" : "text/html",
				"Set-Cookie" : ["PSMinerSessionID=" + sid]
			});
			response.write(data.toString().replace(/\%\{userName\}/ig, sessions[sid]));
		} else {
			response.writeHead(200, {
				"Content-Type" : "text/html"
			});
			response.write(welcomeForm);
		}
	}
	response.end();
}
