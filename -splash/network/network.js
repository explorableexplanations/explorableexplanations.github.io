Math.TAU = Math.PI*2;

var particles = [];
var mouseRadius = 300;

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

	// PARTICLES & CONNECTIONS
	var particles = [];
	var connections = [];

	// Create particles at a certain density
	var density = 1/Math.pow(80,2);
	var area = document.body.clientWidth*(document.body.clientHeight+100*2);
	var count = Math.floor(density*area);

	// Placement: just pick random spots that aren't within a certain radius of others.
	// say, 70 pixels
	var withinRadius = 150;
	var margin = 300;
	for(var i=0; i<count; i++){

		// Get closest possible position...
		var possiblePosition;
		var closestPoint;
		do{
			possiblePosition = {
				x: (Math.random()*((w*2)+margin*2))-margin,
				y: (Math.random()*((h*2)+margin*2))-margin
			};
			closestPoint = _getClosestPoint(particles, possiblePosition, withinRadius);

		}while(closestPoint!=null);

		// And... MAKE IT!
		particles.push(new Particle(possiblePosition.x, possiblePosition.y));

	}

	// FIND THE CONNECTIONS
	var connectionDistance = 275;
	for(var i=0; i<particles.length; i++){
		for(var j=i+1; j<particles.length; j++){
			var from = particles[i];
			var to = particles[j];
			if(_ifPointTooClose(from, to, connectionDistance)){
				connections.push([from, to]);
			}
		}
	}

	// Update
	var _tickTimer = 0;
	var update = function(){
		for(var i=0;i<particles.length;i++) particles[i].update();
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

		// Draw connections
		ctx.strokeStyle = "rgba(255,255,255,0.3)";
		ctx.lineWidth = 2;
		ctx.beginPath();
		for(var i=0;i<connections.length;i++){
			var c = connections[i];
			ctx.moveTo(c[0].x, c[0].y);
			ctx.lineTo(c[1].x, c[1].y);
		}
		ctx.stroke();

		// Draw Particles
		for(var i=0;i<particles.length;i++) particles[i].draw(ctx);

		// DRAW CIRCLE
		_drawCircle(ctx, mouseRadius*0.7);

	};
	window.requestAnimationFrame(draw);

};

var image = new Image();
image.src = imageSource;
var imageWidth = 100;
var imageHeight = 100;

var _x = 0;
var _notRandomX = function(){
	_x += imageWidth*4;
	if(_x>document.body.clientWidth*2) _x-=document.body.clientWidth*2;
	return _x;
};

function Particle(x,y){
	
	var self = this;
	var w = document.body.clientWidth*2;
	var h = document.body.clientHeight*2;

	self.flip = Math.random()<0.5;
	
	self.initX = x;
	self.initY = y;
	self.initRotation = window.IS_NEURON ? Math.random()*Math.TAU : (Math.random()-0.5)*0.3;

	self.x = self.initX;
	self.y = self.initY;
	self.rotation = self.initRotation;

	self.spin = Math.random()*Math.TAU;
	self.spinSpeed = 0.003 + Math.random()*0.01;
	self.spinXRadius = 10 + Math.random()*40;
	self.spinYRadius = 10 + Math.random()*40;

	self.sway = Math.random()*Math.TAU;
	self.swaySpeed = 0.003 + Math.random()*0.01;
	self.swayRadius = 0.1 + Math.random()*0.5;

	self.bulgeX = 0;
	self.bulgeY = 0;

	self.update = function(){
		
		// SPIN & SWAY
		self.spin += self.spinSpeed;
		self.sway += self.swaySpeed;

		// BULGE
		var bulgeX = 0;
		var bulgeY = 0;
		var mx = Mouse.x*2 - self.initX;
		var my = Mouse.y*2 - self.initY;
		var vector = [mx,my];
		var dist = _magnitude(vector);
		if(dist<mouseRadius){
			_normalize(vector);
			var t = dist/mouseRadius;
			var force = (Math.cos(t*Math.TAU/2)+1)/2;
			force *= Mouse.pressed ? 200 : -200;
			if(force>dist) force=dist;
			bulgeX = vector[0]*force;
			bulgeY = vector[1]*force;
		}
		self.bulgeX = self.bulgeX*0.8 + bulgeX*0.2;
		self.bulgeY = self.bulgeY*0.8 + bulgeY*0.2;

		// NEW SHTUFF
		self.x = self.initX + self.bulgeX + Math.sin(self.spin)*self.spinXRadius;
		self.y = self.initY + self.bulgeY + Math.cos(self.spin)*self.spinYRadius;
		self.rotation = self.initRotation + Math.sin(self.spin)*self.swayRadius;

	};

	self.draw = function(ctx){

		ctx.save();

		ctx.translate(self.x, self.y);
		ctx.rotate(self.rotation);
		if(self.flip) ctx.scale(-1,1);

		ctx.drawImage(image, -imageWidth/2, -imageHeight/2, imageWidth, imageHeight);
		ctx.restore();

	};

}
