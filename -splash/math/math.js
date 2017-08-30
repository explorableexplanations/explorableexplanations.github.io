Math.TAU = Math.PI*2;

window.noOuterCircle = true;

var w = document.body.clientWidth;
var h = document.body.clientHeight;

var _makeCanvas = function(DO_NOT_APPEND){
	var canvas = document.createElement("canvas");
	canvas.width = w*2;
	canvas.height = h*2;
	canvas.style.width = w+"px";
	canvas.style.height = h+"px";
	canvas.style.position = "absolute";
	canvas.style.top = 0;
	canvas.style.left = 0;
	if(!DO_NOT_APPEND) document.body.appendChild(canvas);
	return canvas;
};

window.onload = function(){

	// Canvas #1!
	var canvas1 = _makeCanvas();
	var canvas2 = _makeCanvas();
	var tempCanvas = _makeCanvas(true);

	// THE GEAR
	var gear = new Gear(w, h, 200);

	// Update
	var lastMousePressed = false;
	var update = function(){
		
		// Stop or start?
		if(Mouse.pressed && !lastMousePressed){
			gear.stop();
		}
		if(!Mouse.pressed && lastMousePressed){
			gear.start();
		}
		lastMousePressed = Mouse.pressed;

		// SIMULATED ANNEALING
		if(Mouse.pressed){

			// Each frame, do 100 iterations...
			var temperature = 1;
			var old_cost = _costFunction(gear);
			while(temperature > 0.001 && old_cost>1){

				for(var i=0; i<1; i++){
					gear.newSolution();
		            var new_cost = _costFunction(gear);
		            var ap = _acceptance_probability(old_cost, new_cost, temperature);
		            if(Math.random() < ap){
		                old_cost = new_cost; // stick with it!
		            }else{
		            	gear.oldSolution(); // nope, go back!
		            }
				}
				
				temperature *= 0.9;

			}

		}

		// Update...
		gear.update();

	};
	setInterval(update,1000/60);
	update();

	var lastX;
	var lastY;

	// RAF
	var ctx1 = canvas1.getContext("2d");
	var ctx2 = canvas2.getContext("2d");
	var tmp = tempCanvas.getContext("2d");
	var draw = function(){

		// Clear
		ctx1.clearRect(0,0,canvas1.width,canvas1.height);

		// Draw Gear
		ctx1.strokeStyle = "rgba(255,255,255,0.2)";
		ctx1.lineWidth = 2;
		ctx1.beginPath();
		gear.draw(ctx1);
		ctx1.closePath();
		ctx1.stroke();

		// DRAW CURSOR CIRCLE
		_drawCircle(ctx1, 200);

		//////////////////////////////
		// CANVAS 2: THE SHINY PATH //
		//////////////////////////////

		var finalPoint = _findFinalPoint(gear);
		var x = finalPoint.x;
		var y = finalPoint.y;

		/*if(Mouse.pressed){
			
			ctx2.clearRect(0,0,canvas2.width,canvas2.height);
			
			ctx2.fillStyle = "#fff";
			ctx2.beginPath();
			ctx2.arc(x, y, 10, 0, Math.TAU, false);
			ctx2.closePath();
			ctx2.fill();

		}else{*/

			tmp.clearRect(0,0,tempCanvas.width,tempCanvas.height);
			tmp.drawImage(canvas2, 0, 0);
			ctx2.clearRect(0,0,canvas2.width,canvas2.height);
			//ctx2.globalAlpha = 0.99;
			ctx2.globalAlpha = Mouse.pressed ? 0.5 : 0.99;
			ctx2.drawImage(tempCanvas, 0, 0);
			ctx2.globalAlpha = 1.00;

			if(!lastX && !lastY){
				lastX = x;
				lastY = y;
			}

			ctx2.strokeStyle = "#fff";
			ctx2.lineCap = "round";
			ctx2.lineJoin = "round";
			ctx2.lineWidth = 20;
			ctx2.beginPath();
			ctx2.moveTo(lastX, lastY);
			ctx2.lineTo(x,y);
			ctx2.closePath();
			ctx2.stroke();

		//}

		lastX = x;
		lastY = y;

		///////////////////////////

		// RAF
		window.requestAnimationFrame(draw);
	};
	window.requestAnimationFrame(draw);

};

var _acceptance_probability = function(old_cost, new_cost, temperature){
	return Math.exp( (old_cost-new_cost)/temperature );
};

var _costFunction = function(startGear){

	var finalPoint = _findFinalPoint(startGear);
	var x = finalPoint.x;
	var y = finalPoint.y;

	var dx = x - Mouse.x*2;
	var dy = y - Mouse.y*2;

	return Math.sqrt(dx*dx + dy*dy);

}

var _findFinalPoint = function(startGear){

	var x = startGear.x;
	var y = startGear.y;
	var a = 0;
	var g = startGear;
	while(g){
		
		// The position...
		a += g.rotation;
		x += Math.cos(a)*g.radius;
		y += Math.sin(a)*g.radius;

		// Next gear...
		g = g.gear;

	}

	return { x:x, y:y };

};

function Gear(x,y,radius){

	var self = this;

	self.x = x;
	self.y = y;
	self.radius = radius;
	self.rotation = 0;
	var _randomSpeed = function(){
		self.speed = (Math.random()*2-1)*0.05;
	};
	_randomSpeed();
	
	if(self.radius>100){
		self.gear = new Gear(self.radius, 0, self.radius*0.8);
	}

	// WHEN MOUSE UP/DOWN

	self.stop = function(){
		self.speed = 0;
		if(self.gear) self.gear.stop();
	};
	self.start = function(){
		_randomSpeed();
		if(self.gear) self.gear.start();
	};

	// SIM ANNEAL

	self.oldRotation = self.rotation;
	self.newSolution = function(){
		self.oldRotation = self.rotation;
		self.rotation += (Math.random()*2-1)*0.01;
		if(self.gear) self.gear.newSolution();
	};
	self.oldSolution = function(){
		self.rotation = self.oldRotation;
		if(self.gear) self.gear.oldSolution();
	};

	self.update = function(){
		
		// Me
		self.rotation += self.speed;

		// Subgear
		if(self.gear) self.gear.update();

	};

	self.draw = function(ctx){
		ctx.save();
		ctx.translate(self.x, self.y);
		ctx.rotate(self.rotation);
		ctx.moveTo(0,0);
		ctx.arc(0, 0, self.radius, 0, Math.TAU, false);
		if(self.gear) self.gear.draw(ctx);
		ctx.restore();
	};

}
