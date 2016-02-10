(function(){

// SPLASH IFRAME
var splash_iframe = document.getElementById("splash_iframe");
window.onscroll = function(){

	// Playables - PAUSE & UNPAUSE
	var scrollY = window.pageYOffset;
	/*
	var innerHeight = window.innerHeight;
	for(var i=0;i<playables.length;i++){
		var p = playables[i];
		p.contentWindow.IS_IN_SIGHT = (p.offsetTop<scrollY+innerHeight && p.offsetTop+parseInt(p.height)>scrollY);
		//p.contentWindow.IS_IN_SIGHT = false;
	}
	*/

	// HEADER
	splash_iframe.style.top = (scrollY*0.5);
	//outro_background.contentWindow.SCROLL = document.body.clientHeight-(scrollY+innerHeight);
	//intro_background.contentWindow.SCROLL = 700;
	//outro_background.contentWindow.SCROLL = 700;

};

})();