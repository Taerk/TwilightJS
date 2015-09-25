c = document.getElementById('canvas');
ctx = c.getContext("2d");
c.width = window.innerWidth;
c.height = window.innerHeight;
allData = {};

camera = {
	'moving': false,
	'startMouseX': 0,
	'startMouseY': 0,
	'startPageX': 0,
	'startPageY': 0,
	'x': 0,
	'y': 0
};

$(window).resize(function() {
	c.width = window.innerWidth;
	c.height = window.innerHeight;
	drawBoard();
});
$('canvas').mousedown(function(e) {
	switch (tool) {
		case 'camera':
			camera.moving = true;
			camera.startMouseX = e.pageX;
			camera.startMouseY = e.pageY;
			camera.startPageX = camera.x;
			camera.startPageY = camera.y;
			drawBoard();
			break;
	}
});
$('canvas').mousemove(function(e) {
	switch (tool) {
		case 'camera':
			if (camera.moving) {
				camera.x = (camera.startPageX - (e.pageX - camera.startMouseX));
				camera.y = (camera.startPageY - (e.pageY - camera.startMouseY));
				// $('body').css('background-position', (camera.x * -1) + "px " + (camera.y * -1) + "px");
				$('body').css('background-position', (camera.x * 1) + "px " + (camera.y * 1) + "px");
				// camera.startX = camera.x;
				// camera.startY = camera.y;
				drawBoard();
			}
			break;
	}
});
$('canvas').mouseup(function(e) {
	camera.moving = false;
});

hexagon = new Image();
hexagon.src = 'images/hexagon.png';

scale = 1.0

function hashCode(str) { // java String#hashCode
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
       hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
} 

function intToRGB(i){
    var c = (i & 0x00FFFFFF)
        .toString(16)
        .toUpperCase();

    return "00000".substring(0, 6 - c.length) + c;
}

function hasProperty(planet, property) {
	if (($.inArray(planet.special, property) > -1) || (planet.special == property)) {
		return true;
	} else {
		return false;
	}
}

function drawPlanets(x, y, planets, drawType) {
	var ui = drawType;
	var i = 0;
	$.each(planets, function(key, planet) {
		ctx.fillStyle = '#' + intToRGB(hashCode(key));
		if (Object.keys(planets).length == 1) {
			var size;
			if (hasProperty(planet, 'mec')) {
				size = 50;
				ctx.fillStyle = 'rgba(0,0,0,0)';
				if (typeof mec == 'undefined') {
					mec = new Image();
					mec.src = 'images/mecatol.png';
				}
				ctx.drawImage(mec, x - size, y - size, size * 2, size * 2);
			} else {
				size = 35;
			}
			var offset = 0;
		} else {
			var size = 25;
			switch (i) {
				case 0:
					offset = -25;
					break;
				case 1:
					offset = 25;
					break;
				default:
					offset = 0;
					break;
			}
		}
		
		if (!ui) {
			ctx.beginPath();
			ctx.arc((x * scale) + (offset * scale), (y * scale) + (offset * scale), size * scale, 0, 2 * Math.PI, false);
			ctx.closePath();
			ctx.fill();
		} else {
			ctx.font = (0.75 * scale) + 'em sans-serif';
			ctx.fillStyle = '#000';
			ctx.beginPath();
			ctx.rect((x * scale) - (50 * scale) + (offset * scale), (y * scale) + (30 * scale) - (5 * scale) + (offset * scale) - ((30 - size) * scale), 100 * scale, 20 * scale);
			ctx.closePath();
			ctx.fill();
			
			ctx.fillStyle = '#d00';
			ctx.beginPath();
			ctx.rect((x * scale) - (50 * scale) + (offset * scale), (y * scale) + (30 * scale) - (5 * scale) + (offset * scale) - ((30 - size) * scale), 20 * scale, 20 * scale);
			ctx.closePath();
			ctx.fill();
			
			ctx.fillStyle = '#00f';
			ctx.beginPath();
			ctx.rect(((x + 60) * scale) - (30 * scale) + (offset * scale), (y * scale) + (30 * scale) - (5 * scale) + (offset * scale) - ((30 - size) * scale), 20 * scale, 20 * scale);
			ctx.closePath();
			ctx.fill();
			
			ctx.textAlign = 'center';
			ctx.fillStyle = 'white';
			ctx.fillText(key, (x * scale) + (offset * scale), (y * scale) + (39 * scale) + (offset * scale) - ((30 - size) * scale), 55 * scale);
			ctx.fillText(planet.resources, (x * scale) - (40 * scale) + (offset * scale), (y * scale) + (39 * scale) + (offset * scale) - ((30 - size) * scale), 20 * scale);
			ctx.fillText(planet.influence, (x * scale) + (40 * scale) + (offset * scale), (y * scale) + (39 * scale) + (offset * scale) - ((30 - size) * scale), 20 * scale);
		}
		i++;
	});
}

function drawHex(hex, ui) {
	var coordinates = getGrid(hex.x, hex.y);
	var x = coordinates.x;
	var y = coordinates.y;
	
	ctx.strokeStyle = 'white';
	if (hex.hazard) {
		ctx.fillStyle = '#955';
	} else if (hex.home) {
		ctx.fillStyle = '#303';
	} else {
		ctx.fillStyle = '#007';
	}

	if (!ui) {
		ctx.beginPath();
		ctx.moveTo((x - 40) * scale, (y - 70) * scale); // Top-left
		ctx.lineTo((x + 40) * scale, (y - 70) * scale); // Top-right
		ctx.lineTo((x + 80) * scale, y * scale); // Right
		ctx.lineTo((x + 40) * scale, (y + 70) * scale); // Bottom-right
		ctx.lineTo((x - 40) * scale, (y + 70) * scale); // Bottom-left
		ctx.lineTo((x - 80) * scale, y * scale); // Left
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	}
	
	if ((ui) && (hex.hazard > 0)) {	
		ctx.font = (0.75 * scale) + 'em sans-serif';
		ctx.fillStyle = '#fff';
		ctx.beginPath();
		ctx.moveTo(x - 52, y + 50);
		ctx.lineTo(x + 52, y + 50);
		ctx.lineTo(x + 40, y + 70);
		ctx.lineTo(x - 40, y + 70);
		ctx.closePath();
		ctx.fill();
		
		ctx.fillStyle = 'black';
		ctx.textAlign = 'center';
		switch (hex.hazard) {
			case 1:
				ctx.fillText('Asteroids', x, y + 65);
				break;
			case 2:
				ctx.fillText('Wormhole', x, y + 65);
				break;
			default:
				ctx.fillText('???', x, y + 65);
				break;
		}
	} else {
		drawPlanets(x, y, hex.planets, ui);
	}
}

function getGrid(pos_x, pos_y) {
	cx = (window.innerWidth / 2) - camera.x;
	cy = (window.innerHeight / 2) - camera.y;
	
	if (pos_y % 2) {
		var displacementX = (120) * scale * pos_x;
	} else {
		var displacementX = (120) * scale * pos_x * 2;
	}
	
	if (!(pos_y % 2) & pos_x % 2) {
		var displacementY = (70) * scale * pos_y;
	} else {
		var displacementY = (70) * scale * pos_y;
	}
	
	return {'x': cx + displacementX, 'y': cy + displacementY};
}

function getBoard() {
	$.getJSON('testboard.json', {}, function(data, status) {
		allData = data;
		drawBoard();
	});
}

function drawBoard() {
	if (allData != {}) {
		ctx.clearRect(0, 0, c.width, c.height);
		$.each(allData.board, function(key, hex) {
			drawHex(hex, 0);
		});
		$.each(allData.board, function(key, hex) {
			drawHex(hex, 1);
		});
	}
	// drawHex(getGrid(0, 0), {'Mecatol Rex': [1, 0, ['mec']]});
	// drawHex(getGrid(-1, -1), {'Sob Norr': [1, 4]});
	// drawHex(getGrid(1, -1), {'This is a planet': [0, 0, ['sat']], 'Planet x045': [0, 0, ['blue']]});
	// drawHex(getGrid(1, 1), 'Wormhole');
	// drawHex(getGrid(0, -2), 'Asteroids');
	// drawHex(getGrid(0, -4), 1);
}

getBoard();