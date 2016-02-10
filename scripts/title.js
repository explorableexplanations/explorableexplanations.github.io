(function(){

var title = Snap("#title");
title.attr({
	fill: "#fff",
	"font-size":65
});

// KERNING IS THE WORST

var line1 = title.group().attr({"font-weight":700});
var y = 110;
line1.text(93, y, "EXP");
line1.text(211, y, "L");
line1.text(247, y, "O");
line1.text(297, y, "R");
line1.text(345, y, "ABLE");

var line2 = title.group().attr({"font-size":59.8});
y += 47;
line2.text(93, y, "EXP");
line2.text(190, y, "L");
line2.text(225, y, "ANATIONS");

// AN ARROW DOWNWARDS

var SIZE = 20;
var bottom = title.polygon([
		   0, 239-SIZE,
	300-SIZE, 239-SIZE,
	     300, 239,
	300+SIZE, 239-SIZE,
	     600, 239-SIZE,
	     600, 240,
	       0, 240
]);

})();