window.CONFETTI_HACK = true;

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

	// Create particles at a certain density
	var density = 1/Math.pow(80,2);
	var area = document.body.clientWidth*(document.body.clientHeight+100*2);
	var count = Math.floor(density*area);
	for(var i=0; i<count; i++){
		var x = _notRandomX();
		var y = i*((document.body.clientHeight*2+200)/count);
		particles.push(new Particle(x,y));
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

		// Draw Particles
		ctx.globalAlpha = 0.5;
		for(var i=0;i<particles.length;i++) particles[i].draw(ctx);
		ctx.globalAlpha = 1.0;

		// DRAW CIRCLE
		_drawCircle(ctx, mouseRadius*0.7);

	};
	window.requestAnimationFrame(draw);

};

var flipGravity = flipGravity || false;
var yesSway = yesSway || false;
var image = new Image();
image.src = imageSource;
var _x = 0;
var _notRandomX = function(){
	_x += 100*4*(document.body.clientWidth/1280); //whatever
	if(_x>document.body.clientWidth*2) _x-=document.body.clientWidth*2;
	return _x;
};
function Particle(x,y){
	
	var self = this;
	var w = document.body.clientWidth*2;
	var h = document.body.clientHeight*2;
	self.x = x; //Math.random()*w;
	self.y = y; //Math.random()*h;
	var margin = 100;

	self.vel = {x:0, y:0};

	self.sway = Math.random()*Math.TAU;

	self.update = function(){

		self.x += self.vel.x;
		self.y += self.vel.y;
		self.vel.y += (flipGravity?-1:1) * 0.2;
		self.vel.x *= 0.95;
		self.vel.y *= 0.95;

		if(yesSway){
			self.sway += 0.07;
			var vx = Math.sin(self.sway);
			self.vel.x += vx*0.05;
		}

		// GET AWAY FROM THE MOUSE
		var multiplier = Mouse.pressed?2:1;
		var magnet = 0.25;
		var M = {x:Mouse.x*2, y:Mouse.y*2};
		if(_ifPointTooClose(M, self, mouseRadius*multiplier)){
			var center = [M.x, M.y];
			//debugger;
			_addToVector(center, [-self.x,-self.y]); // relative center
			var power = 1 - (_magnitude(center)/(mouseRadius*multiplier));
			_normalize(center, -magnet*power*multiplier);
			var myVel = [self.vel.x, self.vel.y];
			_addToVector(myVel, center);
			self.vel.x = myVel[0];
			self.vel.y = myVel[1];
		}

		// Bounds
		if(self.x<-margin) self.x=w+margin;
		if(self.y<-margin){
			self.y=h+margin;
			self.x = _notRandomX();
		}
		if(self.x>w+margin) self.x=-margin;
		if(self.y>h+margin){
			self.y=-margin;
			self.x = _notRandomX();
		}

	};

	self.draw = function(ctx){
		ctx.save();
		ctx.translate(self.x, self.y);

		// angle
		var vector = [self.vel.x, 4];
		var a = _vectorToAngle(vector)+imageAngle;
		ctx.rotate(a * (flipGravity?-1:1));

		ctx.drawImage(image, -imageWidth/2, -imageHeight/2, imageWidth, imageHeight);
		ctx.restore();
	};

}
