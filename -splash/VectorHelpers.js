var _getCenterOfPoints = function(points){
	var center = [0,0];
	for(var i=0;i<points.length;i++){
		var p = points[i];
		_addToVector(center, [p.x,p.y]);
	}
	center[0] /= points.length;
	center[1] /= points.length;
	return center;
};
var _getClosestPoint = function(points, comparison, withinRadius){
	var minDistance = Infinity;
	var minPoint = null;
	for(var i=0; i<points.length; i++){
		var p = points[i];
		var dx = p.x-comparison.x;
		var dy = p.y-comparison.y;
		var d2 = dx*dx+dy*dy;
		if(d2<minDistance){
			minDistance = d2;
			minPoint = p;
		}
	}
	if(minDistance>=withinRadius*withinRadius) return null; // none close enough
	return minPoint;
};
var _tooClose = function(points, comparison, radius){
	var r2 = radius*radius;
	return points.filter(function(p){
		if(p==comparison) return false;
		var dx = p.x-comparison.x;
		var dy = p.y-comparison.y;
		var d2 = dx*dx+dy*dy;
		return (d2<r2);
	});
};
var _ifPointTooClose = function(point, comparison, radius){
	var points = [point];
	return(_tooClose(points, comparison, radius).length>0);
};
var _angleToVector = function(angle){
	return [Math.cos(angle), Math.sin(angle)];
};
var _vectorToAngle = function(vector){
	return Math.atan2(vector[1], vector[0]);
};
var _addToVector = function(a,b){
	a[0] += b[0];
	a[1] += b[1];
	return a;
};
var _normalize = function(vector, newMag){
	newMag = newMag || 1;
	var mag = _magnitude(vector);
	vector[0] = (vector[0]/mag)*newMag;
	vector[1] = (vector[1]/mag)*newMag;
	return vector;
};
var _magnitude = function(vector){
	return Math.sqrt(vector[0]*vector[0] + vector[1]*vector[1]);
}