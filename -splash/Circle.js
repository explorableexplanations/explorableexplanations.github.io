Math.TAU = Math.PI*2;

var innerCircleSize = 25;
var outerCircleRatio = 1;
var _drawCircle = function(ctx, outerRadius){

	var Mouse = window.Mouse2 ? window.Mouse2 : window.Mouse;

	ctx.save();

	ctx.strokeStyle = "rgba(255,255,255,0.5)";
	ctx.fillStyle = "rgba(255,255,255,0.5)";

	// Inner circle
	var innerCircleSizeGOTO = (Mouse.pressed ? 50 : 20);
	innerCircleSize = innerCircleSize*0.9 + innerCircleSizeGOTO*0.1;
	ctx.beginPath();
	ctx.arc(Mouse.x*2, Mouse.y*2, innerCircleSize, 0, Math.TAU, false);
	ctx.fill();

	// Outer circle
	if(!window.Mouse2 && !window.noOuterCircle){

		var outerCircleRatioGOTO;
		if(window.CONFETTI_HACK){
			outerCircleRatioGOTO = (Mouse.pressed ? 2 : 1);
		}else{
			outerCircleRatioGOTO = (Mouse.pressed ? 0.9 : 1);
		}
			
		outerCircleRatio = outerCircleRatio*0.9 + outerCircleRatioGOTO*0.1;
		ctx.beginPath();
		ctx.arc(Mouse.x*2, Mouse.y*2, outerRadius*outerCircleRatio, 0, Math.TAU, false);
		ctx.lineWidth = 2;
		ctx.stroke();
	}

	ctx.restore();

}