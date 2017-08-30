Math.TAU = Math.PI*2;

var _getNeighbors = function(grid, ox, oy){

	var gWidth = grid[0].length;
	var gHeight = grid.length;

	// Get positions...
	var positions = [];
	for(var y=-1; y<=1; y++){
		for(var x=-1; x<=1; x++){
			
			if(x==0 && y==0) continue;
			
			var px = (ox + x);
			if(px<0) px+=gWidth;
			if(px>=gWidth) px-=gWidth;

			var py = (oy + y);
			if(py<0) py+=gHeight;
			if(py>=gHeight) py-=gHeight;

			positions.push([px,py]);

		}
	}

	// Get neighbors
	var neighbors = [];
	for(var i=0; i<positions.length; i++){
		var x = positions[i][0];
		var y = positions[i][1];
		neighbors.push(grid[y][x]);
	}

	return neighbors;

};

window.onload = function(){

	// Canvas!
	var canvas = document.createElement("canvas");
	var w = document.body.clientWidth;
	var h = document.body.clientHeight;
	canvas.width = w*2;
	canvas.height = h*2;
	canvas.style.width = w+"px";
	canvas.style.height = h+"px";
	document.body.appendChild(canvas);

	// A grid
	var tileSize = 20;
	var gridWidth = Math.ceil(document.body.clientWidth*2/tileSize);
	var gridHeight = Math.ceil(document.body.clientHeight*2/tileSize);
	var grid = _createGrid(gridWidth, gridHeight, NUMS);

	// Update
	var _tickTimer = 0;
	var update = function(){

		// MOUSE MESSUP
		if(Mouse.pressed){

			// Anything within radius, make RANDOM
			for(var y=0; y<grid.length; y++){
				for(var x=0; x<grid[y].length; x++){
					var dx = (x*tileSize)-Mouse.x*2;
					var dy = (y*tileSize)-Mouse.y*2;
					var d2 = dx*dx+dy*dy;
					if(d2<mouseRadius2){
						var randomNum = randomChooser ? randomChooser() : NUMS[Math.floor(Math.random()*NUMS.length)];
						grid[y][x].state = randomNum;
						grid[y][x].nextState = randomNum;
					}
				}
			}
		}

		// UPDATE
		if(_tickTimer==0){

			// Next State...
			for(var y=0; y<grid.length; y++){
				for(var x=0; x<grid[y].length; x++){
					updateFn(grid, x, y);
				}
			}

			// Sync State!
			for(var y=0; y<grid.length; y++){
				for(var x=0; x<grid[y].length; x++){
					grid[y][x].state = grid[y][x].nextState;
				}
			}

		}
		_tickTimer++;
		if(_tickTimer>5) _tickTimer=0;

	};
	setInterval(update,1000/60);
	update();

	// RAF
	var ctx = canvas.getContext("2d");
	var draw = function(){

		// RAF
		window.requestAnimationFrame(draw);

		// Clear
		ctx.clearRect(0,0,canvas.width,canvas.height);
		ctx.fillStyle = "#fff";

		// Draw Grid
		for(var y=0; y<grid.length; y++){
			var row = grid[y];
			for(var x=0; x<row.length; x++){
				var cell = row[x];
				ctx.globalAlpha = OPACITIES[cell.state];
				ctx.fillRect(x*tileSize, y*tileSize, tileSize, tileSize);
			}
		}

		// DRAW CIRCLE
		ctx.globalAlpha = 1;
		_drawCircle(ctx, mouseRadius);

	};
	window.requestAnimationFrame(draw);

};

var randomChooser = randomChooser || null;
var _createGrid = function(width, height, nums){
	var grid = [];
	for(var y=0; y<height; y++){
		var row = [];
		for(var x=0; x<width; x++){
			var randomNum = randomChooser ? randomChooser() : nums[Math.floor(Math.random()*nums.length)];
			row.push({
				state: randomNum,
				nextState: randomNum
			});
		}
		grid.push(row);
	}
	return grid;
};
