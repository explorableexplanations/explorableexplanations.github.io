(function(exports){

	// Singleton
	var Mouse = {
		x: document.body.clientWidth/2,
		y: document.body.clientHeight/2,
		pressed: false
	};
	exports.Mouse = Mouse;
	
	// Event Handling
	var onMouseMove,onTouchMove;
	
	document.body.addEventListener("mousedown",function(event){
	    Mouse.pressed = true;
	    onMouseMove(event);
	},false);

	document.body.addEventListener("mouseup",function(event){
	    Mouse.pressed = false;
	},false);

	document.body.addEventListener("mousemove",onMouseMove = function(event){
		Mouse.x = event.pageX;
		Mouse.y = event.pageY - window.pageYOffset;
	},false);

	document.body.addEventListener("touchstart",function(event){
	    Mouse.pressed = true;
	    onTouchMove(event);
	},false);

	document.body.addEventListener("touchend",function(event){
	    Mouse.pressed = false;
	},false);

	document.body.addEventListener("touchmove",onTouchMove = function(event){
		Mouse.x = event.changedTouches[0].clientX;
		Mouse.y = event.changedTouches[0].clientY - window.pageYOffset;
		event.preventDefault();
	},false);


})(window);