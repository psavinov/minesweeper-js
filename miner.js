/*
	Minesweeper by Pavel Savinov, 01.07.2012
	www.pavelsavinov.info
*/
var miner;

function getCookie(name) {
	var cookie = " " + document.cookie;
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

Miner = function () {}
Miner = function (w, h, c, e, v) {
	var mineArray = new Array();
	var markArray = new Array();
	var innerHtml = "<table class=\"mineField\">";
	var count = 0;
	for (var k = 0; k < h; k++) {
		innerHtml += "<tr>";
		for (var q = 0; q < w; q++) {
			var value = "";
			if (Math.random() > 0.8 && count < c) {
				count++;
				value = "X";
			}
			mineArray["cell_" + k + "_" + q] = value;
			markArray["cell_" + k + "_" + q] = 0;
			innerHtml += "<td id=\"cell_" + k + "_" + q + "\" onclick=\"" + v + ".click(" + k + "," + q + ");\" oncontextmenu=\"" + v + ".rightClick(" + k + "," + q + ");return false;\">&nbsp;</td>";
		}
		innerHtml += "</tr>";
	}
	innerHtml += "</table>";
	e.innerHTML = innerHtml;
	for (var k = 0; k < h; k++) {
		for (var q = 0; q < w; q++) {
			var cN = "cell_" + k + "_" + q;
			if (mineArray[cN] != "X") {
				var nearCount = 0;
				for (var t = -1; t <= 1; t++) {
					var tpN = "cell_" + (k + t) + "_" + (q - 1);
					var tnN = "cell_" + (k + t) + "_" + (q + 1);
					if (mineArray[tpN] == "X") {
						nearCount++;
					}
					if (mineArray[tnN] == "X") {
						nearCount++;
					}
				}
				if (mineArray["cell_" + (k + 1) + "_" + q] == "X") {
					nearCount++;
				}
				if (mineArray["cell_" + (k - 1) + "_" + q] == "X") {
					nearCount++;
				}
				mineArray[cN] = "" + nearCount;
				document.getElementById(cN).innerHTML = "&nbsp;";
				nearCount;
			}
		}
	}
	this.setField(mineArray);
	this.setMarks(markArray);
	this.setMineCount(count);
	this.setStartTime(new Date());
	this.setFieldWidth(w);
	this.setFieldHeight(h);
}

Miner.prototype.setFieldHeight = function (h) {
	this.fieldHeight = h;
}

Miner.prototype.setFieldWidth = function (w) {
	this.fieldWidth = w;
}

Miner.prototype.getFieldWidth = function () {
	return this.fieldWidth;
}

Miner.prototype.getFieldHeight = function () {
	return this.fieldHeight;
}

Miner.prototype.setMineCount = function (c) {
	this.mineCount = c;
}

Miner.prototype.getMineCount = function () {
	return this.mineCount;
}

Miner.prototype.setStartTime = function (t) {
	this.startTime = t;
}

Miner.prototype.getStartTime = function () {
	return this.startTime;
}

Miner.prototype.setField = function (a) {
	this.field = a;
}

Miner.prototype.getField = function () {
	return this.field;
}

Miner.prototype.setMarks = function (a) {
	this.marks = a;
}

Miner.prototype.getMarks = function () {
	return this.marks;
}

Miner.prototype.setDead = function (b) {
	this.gameOver = b;
}

Miner.prototype.isDead = function () {
	return this.gameOver;
}

Miner.prototype.setEnd = function (b) {
	this.end = b;
}

Miner.prototype.isEnd = function () {
	return this.end;
}

Miner.prototype.rightClick = function (y, x) {
	var cN = "cell_" + y + "_" + x;
	if (!this.isEnd()) {
		switch (this.getMarks()[cN]) {
		case 1:
			this.getMarks()[cN] = 2;
			document.getElementById(cN).innerHTML = "<div width=\"100%;\" height=\"100%\" style=\"background:#e0e0e0;color:blue;\">?</div>";
			break;
		case 2:
			this.getMarks()[cN] = 0;
			document.getElementById(cN).innerHTML = "<div width=\"100%;\" height=\"100%\" style=\"background:#e0e0e0;\">&nbsp;</div>";
			break;
		case 9: //nop
			break;
		default:
			this.getMarks()[cN] = 1;
			document.getElementById(cN).innerHTML = "<div width=\"100%;\" height=\"100%\" style=\"background:#e0e0e0;color:red;\">!</div>";
			break;
		}
	}
}

Miner.prototype.click = function (y, x) {
	var cN = "cell_" + y + "_" + x;
	var v = this.getField()[cN];
	if (!this.isEnd()) {
		switch (this.getField()[cN]) {
		case "1":
			this.getMarks()[cN] = 9;
			document.getElementById(cN).innerHTML = "<div width=\"100%;\" height=\"100%\" style=\"background:#f0f0f0;color:blue;\">" + v + "</div>";
			break;
		case "2":
			this.getMarks()[cN] = 9;
			document.getElementById(cN).innerHTML = "<div width=\"100%;\" height=\"100%\" style=\"background:#f0f0f0;color:green;\">" + v + "</div>";
			break;
		default:
			this.getMarks()[cN] = 9;
			document.getElementById(cN).innerHTML = "<div width=\"100%;\" height=\"100%\" style=\"background:#f0f0f0;color:red;\">" + v + "</div>";
			break;
		case "X":
			document.getElementById(cN).innerHTML = "<div width=\"100%;\" height=\"100%\" style=\"background:#f0f0f0;font-size:16;color:black;\">X</div>";
			this.setDead(true);
			break;
		case "0":
			this.getField()[cN] = "&nbsp;";
			this.getMarks()[cN] = 9;
			document.getElementById(cN).innerHTML = "<div width=\"100%;\" height=\"100%\" style=\"background:#f0f0f0;\">&nbsp;</div>";
			this.processNear(y, x);
			break;
		}
	}
	if (this.isDead()) {
		alert("You are dead!");
		this.showAll();
		this.setEnd(true);
		if (confirm("Start new game?")){
			initMiner();
		}
	} else if (!this.isEnd()) {
		this.checkWin();
	}
	
}

Miner.prototype.showAll = function () {
	var h = this.getFieldHeight();
	var w = this.getFieldWidth();
	for (var k = 0; k < h; k++) {
		for (var q = 0; q < w; q++) {
			var cN = "cell_" + k + "_" + q;
			var v = this.getField()[cN];
			switch (this.getField()[cN]) {
			case "0":
				this.getMarks()[cN] = 9;
				document.getElementById(cN).innerHTML = "<div width=\"100%;\" height=\"100%\" style=\"background:#f0f0f0;color:blue;\">&nbsp;</div>";
				break;
			case "1":
				this.getMarks()[cN] = 9;
				document.getElementById(cN).innerHTML = "<div width=\"100%;\" height=\"100%\" style=\"background:#f0f0f0;color:blue;\">" + v + "</div>";
				break;
			case "2":
				this.getMarks()[cN] = 9;
				document.getElementById(cN).innerHTML = "<div width=\"100%;\" height=\"100%\" style=\"background:#f0f0f0;color:green;\">" + v + "</div>";
				break;
			default:
				this.getMarks()[cN] = 9;
				document.getElementById(cN).innerHTML = "<div width=\"100%;\" height=\"100%\" style=\"background:#f0f0f0;color:red;\">" + v + "</div>";
				break;
			case "X":
				this.getMarks()[cN] = 9;
				document.getElementById(cN).innerHTML = "<div width=\"100%;\" height=\"100%\" style=\"background:#f0f0f0;color:black;\">" + v + "</div>";
				break;
			}
		}
	}
}

Miner.prototype.checkWin = function () {
	var h = this.getFieldHeight();
	var w = this.getFieldWidth();
	var victory = true;
	for (var k = 0; k < h; k++) {
		for (var q = 0; q < w; q++) {
			var cN = "cell_" + k + "_" + q;
			if (this.getField()[cN] != "X" && this.getMarks()[cN] != 9) {
				victory = false;
			}
		}
	}
	if (victory) {
		this.showAll();
		var sec = ((new Date()).getTime() - this.getStartTime().getTime()) / 1000;
		alert("Congratulations!\r\nField completed in " +
			(sec < 60 ? sec + " seconds!" : (sec / 60) + " minutes!"));
		document.location="/?option=save&score="+((new Date()).getTime() - this.getStartTime().getTime());
	}
	
	this.setEnd(victory);
}

Miner.prototype.processNear = function (y, x) {
	var c1N = "cell_" + y + "_" + (x - 1);
	var c2N = "cell_" + y + "_" + (x + 1);
	var c3N = "cell_" + (y - 1) + "_" + x;
	var c4N = "cell_" + (y + 1) + "_" + x;
	var arr = [c1N, c2N, c3N, c4N];
	for (var k = 0; k < arr.length; k++) {
		if (document.getElementById(arr[k])) {
			var v = this.getField()[arr[k]];
			switch (this.getField()[arr[k]]) {
			case "1":
				this.getMarks()[arr[k]] = 9;
				document.getElementById(arr[k]).innerHTML = "<div width=\"100%;\" height=\"100%\" style=\"background:#f0f0f0;color:blue;\">" + v + "</div>";
				break;
			case "2":
				this.getMarks()[arr[k]] = 9;
				document.getElementById(arr[k]).innerHTML = "<div width=\"100%;\" height=\"100%\" style=\"background:#f0f0f0;color:green;\">" + v + "</div>";
				break;
			default:
				this.getMarks()[arr[k]] = 9;
				document.getElementById(arr[k]).innerHTML = "<div width=\"100%;\" height=\"100%\" style=\"background:#f0f0f0;color:red;\">" + v + "</div>";
				break;
			case "X":
				this.setGameOver(true);
				break;
			case "0":
				this.getMarks()[arr[k]] = 9;
				this.getField()[arr[k]] = "&nbsp;";
				document.getElementById(arr[k]).innerHTML = "<div width=\"100%;\" height=\"100%\" style=\"background:#f0f0f0;\">&nbsp;</div>";
				var dx = 0,
				dy = 0;
				if (k == 0) {
					dy = 0;
					dx = -1;
				} else if (k == 1) {
					dy = 0;
					dx = 1;
				} else if (k == 2) {
					dy = -1;
					dx = 0;
				} else {
					dy = 1;
					dx = 0;
				}
				this.processNear(y + dy, x + dx);
				break;
			}
		}
	}
}

function initMiner() {
	miner = new Miner(
			getCookie("mineFieldWidth") != "" ? parseInt(getCookie("mineFieldWidth")) : 10,
			getCookie("mineFieldHeight") != "" ? parseInt(getCookie("mineFieldHeight")) : 10,
			getCookie("mineCount") != "" ? parseInt(getCookie("mineCount")) : 20,
			document.getElementById("mineField"), "miner");
}
