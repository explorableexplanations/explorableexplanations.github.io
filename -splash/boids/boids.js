Math.TAU = Math.PI*2;

var flockRadius = 500;
var separationRadius = 200;
var runRadius = 300;

window.onload = function(){

	// Canvas!
	var canvas = document.createElement("canvas");
	var w = window.innerWidth;
	var h = window.innerHeight;
	canvas.width = w*2;
	canvas.height = h*2;
	canvas.style.width = w+"px";
	canvas.style.height = h+"px";
	document.body.appendChild(canvas);

	// Create boids at a certain density
	var density = 1/Math.pow(50,2);
	var area = window.innerWidth*window.innerHeight;
	var count = Math.floor(density*area);
	for(var i=0; i<count; i++) boids.push(new Boid());

	// Update
	var update = function(){
		for(var i=0;i<boids.length;i++) boids[i].update();
	};
	setInterval(update,1000/60);
	update();

	// RAF
	var ctx = canvas.getContext("2d");
	var draw = function(){

		// Clear
		ctx.clearRect(0,0,canvas.width,canvas.height);
		ctx.lineWidth = 2;

		// Draw Boids
		ctx.strokeStyle = "rgba(255,255,255,0.5)";
		for(var i=0;i<boids.length;i++) boids[i].draw(ctx);

		// DRAW CIRCLE
		_drawCircle(ctx, runRadius*0.7);

		// RAF
		window.requestAnimationFrame(draw);
	};
	window.requestAnimationFrame(draw);

};

var boids = [];
function Boid(){

	var self = this;
	var w = window.innerWidth*2;
	var h = window.innerHeight*2;
	self.x = Math.random()*w;
	self.y = Math.random()*h;
	self.a = Math.random()*Math.TAU;
	self.speed = 3;
	var margin = 50;

	self.update = function(){

		// Velocity
		self.x += Math.cos(self.a)*self.speed;
		self.y += Math.sin(self.a)*self.speed;

		// Get Closest Boids
		var closestBoids = _tooClose(boids, self, flockRadius);

		if(closestBoids.length>0){

			// Alignment: Sum up angles, these ease into it, yo.
			var myVector = _angleToVector(self.a);
			var theirVector = [0,0];
			for(var i=0;i<closestBoids.length;i++){
				var cb = closestBoids[i];
				_addToVector(theirVector, _angleToVector(cb.a));
			}
			_normalize(theirVector, 0.05);
			_normalize(myVector, 0.95);
			_addToVector(myVector, theirVector);

			// Cohesion: Move towards center of crowd
			var center = _getCenterOfPoints(closestBoids);
			_addToVector(center, [-self.x,-self.y]); // relative center
			_normalize(center, 0.05);
			_normalize(myVector, 0.95);
			_addToVector(myVector, center);

			// Separation: But also away from CLOSEST BOID... if it's TOO close
			var theClosestBoid = _getClosestPoint(closestBoids, self, separationRadius);
			if(theClosestBoid){
				var center = [theClosestBoid.x, theClosestBoid.y];
				_addToVector(center, [-self.x,-self.y]); // relative center
				_normalize(center, -0.1);
				_addToVector(myVector, center);
			}

			// GET AWAY FROM THE MOUSE
			var M = {x:Mouse.x*2, y:Mouse.y*2};
			if(_ifPointTooClose(M, self, runRadius)){
				var center = [M.x, M.y];
				_addToVector(center, [-self.x,-self.y]); // relative center
				var power = 1 - (_magnitude(center)/runRadius);
				if(Mouse.pressed){
					_normalize(center, 0.5*power);
				}else{
					_normalize(center, -0.5*power);
				}
				_addToVector(myVector, center);
			}

			// Turn into an angle!
			self.a = _vectorToAngle(myVector);

		}

		// Bounds
		if(self.x<-margin) self.x=w+margin;
		if(self.y<-margin) self.y=h+margin;
		if(self.x>w+margin) self.x=-margin;
		if(self.y>h+margin) self.y=-margin;

	};

	self.draw = function(ctx){
		ctx.save();
		ctx.translate(self.x, self.y);
		ctx.rotate(self.a);
		ctx.beginPath();
		ctx.moveTo(20, 0);
		ctx.lineTo(-10, 10);
		ctx.lineTo(-10, -10);
		ctx.closePath();
		ctx.stroke();
		ctx.restore();
	};

}