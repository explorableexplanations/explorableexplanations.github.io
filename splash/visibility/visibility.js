// Find intersection of RAY & SEGMENT
function getIntersection(ray,segment){

	// RAY in parametric: Point + Delta*T1
	var r_px = ray.a.x;
	var r_py = ray.a.y;
	var r_dx = ray.b.x-ray.a.x;
	var r_dy = ray.b.y-ray.a.y;

	// SEGMENT in parametric: Point + Delta*T2
	var s_px = segment.a.x;
	var s_py = segment.a.y;
	var s_dx = segment.b.x-segment.a.x;
	var s_dy = segment.b.y-segment.a.y;

	// Are they parallel? If so, no intersect
	var r_mag = Math.sqrt(r_dx*r_dx+r_dy*r_dy);
	var s_mag = Math.sqrt(s_dx*s_dx+s_dy*s_dy);
	if(r_dx/r_mag==s_dx/s_mag && r_dy/r_mag==s_dy/s_mag){
		// Unit vectors are the same.
		return null;
	}

	// SOLVE FOR T1 & T2
	// r_px+r_dx*T1 = s_px+s_dx*T2 && r_py+r_dy*T1 = s_py+s_dy*T2
	// ==> T1 = (s_px+s_dx*T2-r_px)/r_dx = (s_py+s_dy*T2-r_py)/r_dy
	// ==> s_px*r_dy + s_dx*T2*r_dy - r_px*r_dy = s_py*r_dx + s_dy*T2*r_dx - r_py*r_dx
	// ==> T2 = (r_dx*(s_py-r_py) + r_dy*(r_px-s_px))/(s_dx*r_dy - s_dy*r_dx)
	var T2 = (r_dx*(s_py-r_py) + r_dy*(r_px-s_px))/(s_dx*r_dy - s_dy*r_dx);
	var T1 = (s_px+s_dx*T2-r_px)/r_dx;

	// Must be within parametic whatevers for RAY/SEGMENT
	if(T1<0) return null;
	if(T2<0 || T2>1) return null;

	// Return the POINT OF INTERSECTION
	return {
		x: r_px+r_dx*T1,
		y: r_py+r_dy*T1,
		param: T1
	};

}

function getSightPolygon(sightX,sightY){

	// Get all unique points
	var points = (function(segments){
		var a = [];
		segments.forEach(function(seg){
			a.push(seg.a,seg.b);
		});
		return a;
	})(segments);
	var uniquePoints = (function(points){
		var set = {};
		return points.filter(function(p){
			var key = p.x+","+p.y;
			if(key in set){
				return false;
			}else{
				set[key]=true;
				return true;
			}
		});
	})(points);

	// Get all angles
	var uniqueAngles = [];
	for(var j=0;j<uniquePoints.length;j++){
		var uniquePoint = uniquePoints[j];
		var angle = Math.atan2(uniquePoint.y-sightY,uniquePoint.x-sightX);
		uniquePoint.angle = angle;
		uniqueAngles.push(angle-0.00001,angle,angle+0.00001);
	}

	// RAYS IN ALL DIRECTIONS
	var intersects = [];
	for(var j=0;j<uniqueAngles.length;j++){
		var angle = uniqueAngles[j];

		// Calculate dx & dy from angle
		var dx = Math.cos(angle);
		var dy = Math.sin(angle);

		// Ray from center of screen to mouse
		var ray = {
			a:{x:sightX,y:sightY},
			b:{x:sightX+dx,y:sightY+dy}
		};

		// Find CLOSEST intersection
		var closestIntersect = null;
		for(var i=0;i<segments.length;i++){
			var intersect = getIntersection(ray,segments[i]);
			if(!intersect) continue;
			if(!closestIntersect || intersect.param<closestIntersect.param){
				closestIntersect=intersect;
			}
		}

		// Intersect angle
		if(!closestIntersect) continue;
		closestIntersect.angle = angle;

		// Add to list of intersects
		intersects.push(closestIntersect);

	}

	// Sort intersects by angle
	intersects = intersects.sort(function(a,b){
		return a.angle-b.angle;
	});

	// Polygon is intersects, in order of angle
	return intersects;

}

///////////////////////////////////////////////////////

// DRAWING

var model = Snap("#model");
var wallSVG = model.group().attr({
	stroke: "#555566",
	strokeWidth: 0.5,
	strokeLinecap:"round"
});
var vizSVG = model.group().attr({
	fill: "rgba(255,255,255,0.05)"
});
var dotSVG = model.group().attr({
	fill: "#bbbbcc"
});
var FUZZY_RADIUS = 10;
var FUZZY_ANGLE = 0;
for(var i=0;i<6;i++){
	
	var angle = FUZZY_ANGLE+(i*1.05); // A bit over (Math.PI*2)/6
	var dx = Math.cos(angle)*FUZZY_RADIUS;
	var dy = Math.sin(angle)*FUZZY_RADIUS;

	dotSVG.circle(dx,dy,1);

}

// visibility polygons
var vizPolygons = [];
for(var i=0;i<6;i++){
	var vizPolygon = vizSVG.polygon([]);
	vizPolygons.push(vizPolygon);
}

// walls
function drawWallsOnce(){
	for(var i=4;i<segments.length;i++){ // i=1, coz forget border.
		var segment = segments[i];
		wallSVG.line(segment.a.x,segment.a.y,segment.b.x,segment.b.y);
	}
}

function polygonToPoints(polygon){
	var points = [];
	for(var i=0;i<polygon.length;i++){
		var pt = polygon[i];
		if(isNaN(pt.x)) continue;
		var x = Math.round(pt.x*10)/10;
		var y = Math.round(pt.y*10)/10;
		points.push(x);
		points.push(y);
	}
	return points;
}

function draw(){

	FUZZY_ANGLE += 0.015;

	// Sight Polygons
	var polygons = [];
	for(var i=0;i<6;i++){
		var angle = FUZZY_ANGLE+(i*1.05); // A bit over (Math.PI*2)/6
		var dx = Math.cos(angle)*FUZZY_RADIUS;
		var dy = Math.sin(angle)*FUZZY_RADIUS;
		polygons.push(getSightPolygon(Mouse.x+dx,Mouse.y+dy));
	}

	// THROW ERROR IF THIS IS FALSE
	if(polygons.length!=vizPolygons.length) throw "OH NOES";

	// Draw all polygons
	for(var i=0;i<polygons.length;i++){
		
		var polygon = polygons[i];
		var points = polygonToPoints(polygon);

		var vizPolygon = vizPolygons[i];
		vizPolygon.attr({ "points":points });

	}

	// Draw dots
	var matrix = new Snap.Matrix();
	matrix.translate(Mouse.x,Mouse.y);
	var RADIANS_TO_DEGREES = 360/(2*Math.PI);
	matrix.rotate(FUZZY_ANGLE*RADIANS_TO_DEGREES);
	dotSVG.transform(matrix);

}


// LINE SEGMENTS
var segments = [

	// Border
	{a:{x:-20,y:-20}, b:{x:620,y:-20}},
	{a:{x:620,y:-20}, b:{x:620,y:260}},
	{a:{x:620,y:260}, b:{x:-20,y:260}},
	{a:{x:-20,y:260}, b:{x:-20,y:-20}},

];
function addPolygonSegments(points){
	for(var i=0;i<points.length;i+=2){
		var from = {
			x: points[i],
			y: points[i+1]-12
		};
		var to = {
			x: points[(i+2)%points.length],
			y: points[(i+3)%points.length]-12
		};
		segments.push({
			a: from,
			b: to
		});
	}
}
addPolygonSegments([
	56, 43,
	87, 57,
	34, 89
]);
addPolygonSegments([
	216, 36,
	165, 185,
	57, 110
]);
addPolygonSegments([
	45, 153,
	156, 213,
	70, 217
]);
addPolygonSegments([
	241, 57,
	311, 24,
	377, 56
]);
addPolygonSegments([
	236, 83,
	392, 95,
	335, 180,
	218, 216
]);
addPolygonSegments([
	403, 68,
	505, 51,
	520, 91,
	515, 125
]);
addPolygonSegments([
	346, 201,
	395, 149,
	383, 216
]);
addPolygonSegments([
	433, 124,
	509, 170,
	416, 201
]);
addPolygonSegments([
	543, 40,
	574, 64,
	535, 136
]);
addPolygonSegments([
	563, 154,
	556, 189,
	522, 202
]);
drawWallsOnce();

// DRAW LOOP
window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame;
function drawLoop(){
    requestAnimationFrame(drawLoop);
    draw();
}
window.onload = function(){
	drawLoop();
};

// MOUSE - Whenever mouse moves, just draw.
var Mouse = {
	x: 30,
	y: 30
};
document.body.onmousemove = function(event){
	var scaleX = document.body.clientWidth/600;
	var scaleY = document.body.clientHeight/240;
	Mouse.x = event.clientX/scaleX;
	Mouse.y = event.clientY/scaleY;
};
document.body.ontouchmove = function(event){
	var scaleX = document.body.clientWidth/600;
	var scaleY = document.body.clientHeight/240;
	Mouse.x = event.changedTouches[0].clientX/scaleX;
	Mouse.y = event.changedTouches[0].clientY/scaleY;
};