function socialShare(event,type){

	var link = "http://explorableexplanations.com/";
	var title = "Explorable Explanations";
	var url = "";
	var width = 640;
	var height = 480;

	switch(type){
		case "facebook":
			url += "https://www.facebook.com/sharer.php?u="+encodeURIComponent(link);
			url += "&t="+encodeURIComponent("I hear and I forget. I see and I remember. I do and I understand.");
			width = 626;
			height = 436;
			break;
		case "twitter":
			url += "https://twitter.com/share?url="+encodeURIComponent(link);
			url += "&text="+encodeURIComponent("I hear and I forget. I see and I remember. I do and I understand. http://pic.twitter.com/OHgjnNAkQ6");
			width = 640;
			height = 400;
			break;
		case "plus":
			url += "https://plus.google.com/share?url="+encodeURIComponent(link);
			width = 600;
			height = 460;
			break;
		case "tumblr":
			url += "https://www.tumblr.com/share/link?url="+encodeURIComponent(link);
			url += "&name="+encodeURIComponent("Explorable Explanations");
			url += "&description="+encodeURIComponent("I hear and I forget. I see and I remember. I do and I understand.");
			width = 446;
			height = 430;
			break;
		case "reddit":
			window.open('http://www.reddit.com/submit?v=5&amp;noui&amp;jump=close&amp;url='+encodeURIComponent(link)+'&amp;title='+encodeURIComponent("Explorable Explanations"), "reddit",'toolbar=no,width=700,height=550');
			return false;
			break;
		case "stumbleupon":
			url += "http://www.stumbleupon.com/submit?url="+encodeURIComponent(link);
			break;
	}

	return sharePopup.call(this,event,{
		href: url,
		width: width,
		height: height
	});

}

// Some services provide a share form that can conveniently be displayed in a popup.
// This event handler opens such a popup when attached to the click event of a share link:
function sharePopup (event, config) {
	"use strict";
 
	// only open popup when clicked with left mouse button
	// (middle click should still open the link in a new tab and
	// right click should still open the context menu)
	/*if ('buttons' in event) {
		if (!(event.buttons & 1)) {
			return true;
		}
	}
	else if (event.button !== 0) {
		return true;
	}*/
 
	// gather popup parameters
	var href = config.href;
	var params = {
		menubar:   "no",
		location:  "no",
		toolbar:   "no",
		status:    "no",
		resizable: "yes",
		width:     "640",
		height:    "480"
	};
 
	for (var name in params) {
		var value = config.name;
		if (value) {
			params[name] = value;
		}
	}
 
	// center popup window
	var width  = parseInt(params.width,10);
	var height = parseInt(params.height,10);
 
	params.top  = Math.max(0, Math.round((screen.height - height) * 0.5));
	params.left = Math.max(0, Math.round((screen.width  - width) * 0.5));
 
	var spec = [];
	for (var name in params) {
		spec.push(name+"="+params[name]);
	}
 
	// open window
	window.open(href,'_blank',spec.join(","));
 
	// prevent navigation to the share form
	if ('preventDefault' in event) {
		event.preventDefault();
	}
	else {
		event.returnValue = false;
	}
	
	return false;
}