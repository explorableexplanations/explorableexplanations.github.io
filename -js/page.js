// LOAD THE JSONS
var pages;
var explorables;
var tags;
window.addEventListener("load", function(){
	Q.all([
		pegasus("-data/pages.json"),
		pegasus("-data/tags.json"),
		pegasus("-data/explorables.csv")
	]).then(function(data){

		// Store Data
		pages = JSON.parse(_clean(data[0]));
		tags = JSON.parse(_clean(data[1]));
		explorables = _csvToJSON(data[2]);

		// Show page!
		_showPage(window.location.pathname);

	});
},false);

// SHOW PAGE
var pageIsIndex = false;
var _showPage = function(pageID){

	// Get page config
	pageID = pageID.replace(/\//g, ''); // strip slashes
	pageID = pageID || "index";
	var page = pages[pageID];

	// IS INDEX?
	pageIsIndex = (pageID=="index");

	// Show gallery
	var tag = pageIsIndex ? "featured" : pageID; // tag is "featured" or pageID!
	if(pageID=="all"){
		var totalDOMs = document.querySelectorAll("#how_many_total");
		totalDOMs.forEach(function(dom){
			dom.innerHTML = explorables.length;
		});
		tag=null;
	}
	_showGallery(page.gallery, tag);

	// Show tags
	_makeTagStyle(tags);
	setTimeout(function(){
		
		// Explorables Tags
		var explorableTags = tags.filter(function(tag){ return tag.explorable; });
		explorableTags.sort(function(a,b){
			return a.id.localeCompare(b.id); // sort alphabetically
		});
		for(var i=0; i<explorableTags.length; i++){
			$("#tags_explorables").appendChild( _makeTagButton(explorableTags[i].id) );
		}

		// Meta Tags
		var miscTags = tags.filter(function(tag){ return !tag.explorable; });
		for(var i=0; i<miscTags.length; i++){
			$("#tags_not_explorables").appendChild( _makeTagButton(miscTags[i].id) );
		}

	},1);

	// Resize everything
	setTimeout(_resize, 1);

};

// SHOW GALLERY
var _showGallery = function(query, tag){

	var gallery = $("#gallery");
	gallery.innerHTML = "";

	// Load all by tag
	var results = tag ? explorables.filter(function(e){
		//return true;
		return e.tags.indexOf(tag)>=0; // yes, has the tag!
	}) : explorables.slice(0);

	// Sort the results
	switch(query.sort){
		case "random":
			_shuffle(results);
			break;
		case "featured-first": // separate, shuffle each, concat.
			var featured = [];
			var not_featured = [];
			for(var i=0;i<results.length;i++){
				var entry = results[i];
				if(entry.tags.indexOf("featured")>=0){
					featured.push(entry);
				}else{
					not_featured.push(entry);
				}
			}
			_shuffle(featured);
			_shuffle(not_featured);
			results = featured.concat(not_featured);
			break;
	}

	// Is this the index page? Then...
	if(query.index){
		
		// Get rid of all NON EXPLORABLE results
		results = results.filter(function(e){
			if(e.tags.indexOf("tools")>=0) return false;
			if(e.tags.indexOf("tutorials")>=0) return false;
			if(e.tags.indexOf("reading")>=0) return false;
			if(e.tags.indexOf("faq")>=0) return false;
			return true;
		}); 

		gallery.setAttribute("size", "big"); // Make it big
		//results = results.splice(0,3); // Only show first THREE results

	}else{

		gallery.setAttribute("size", "small"); // Make it small

	}

	var showStart = 0;
	var showEnd = query.count || results.length;

	// Insert each result into the gallery
	var _show = function(fadeIn){
		for(var i=showStart; i<showEnd && i<results.length; i++){

			var entry = _makeGalleryEntry(results[i]);

			// Fade in?
			if(fadeIn){
				(function(entry){
					var dom = entry.querySelector("#entry");
					dom.style.opacity = 0;
					dom.style.top = "30px";
					setTimeout(function(){
						dom.style.opacity = 1;
						dom.style.top = "0px";
					}, (i-showStart)*150);
				})(entry);
			}

			gallery.appendChild(entry);

			// Divider...
			if(!query.index && i%2==1){
				var span = document.createElement("span");
				span.className = "divider";
				gallery.appendChild(span);
			}

		}
		showStart = showEnd;
	};
	_show();

	// INDEX PAGE ONLY: "LOAD MORE"
	var loadMoreButton;
	var countToWords;
	if(query.count==3) countToWords="three";
	if(query.count==10) countToWords="ten";
	var say = ["load "+countToWords+" more!", "even more!", "more please!"];
	var sayIndex = 0;
	if(query.count){
		loadMoreButton = document.createElement("div");
		loadMoreButton.id = "load_more";
		loadMoreButton.innerHTML = say[sayIndex];
		gallery.appendChild(loadMoreButton);

		loadMoreButton.onclick = function(){
			
			gallery.removeChild(loadMoreButton);
			
			if(sayIndex<say.length-1) sayIndex++;
			loadMoreButton.innerHTML = say[sayIndex];

			showEnd += query.count;
			_show(true);
			if(showEnd<results.length){
				gallery.appendChild(loadMoreButton);
			}

		};

	}

};

// CREATE GALLERY ENTRY
var _makeGalleryEntry = function(entry){
	
	// Whole dom is a link!
	var link = document.createElement("a");
	link.href = entry.link;
	var dom = _createDom("entry", link, "div");
	
	// Thumbnail
	var thumb = _createDom("thumb", dom, "img");
	thumb.src = "-thumbs/"+entry.thumb;
	//thumb.src = "-thumbs/placeholder.jpg";
	
	// Name
	var name = _createDom("name", dom, "div");
	var isFeatured = entry.tags.indexOf("featured")>=0;
	name.innerHTML = (isFeatured?"★ ":"") + entry.name + "&nbsp;";

	// Colored tags
	for(var i=0; i<entry.tags.length; i++){
		var tag = _makeTagButton(entry.tags[i], {small:true});
		if(tag) name.appendChild(tag);
	}

	// Description
	var description = _createDom("description", dom, "div");
	description.innerHTML = entry.description;

	// Return the DOM
	return link;

};

// CREATE TAG STYLE
var _makeTagStyle = function(tags){
	var style = document.createElement("style");
	for(var i=0; i<tags.length; i++){
		var tag = tags[i];
		style.innerHTML += ".tag_"+tag.id+"{ background:"+tag.color+" }";
	}
	document.head.appendChild(style);
};

// CREATE TAG
var _makeTagButton = function(tagID, options){
	options = options || {};
	var conf = tags.filter(function(tag){
		return tag.id==tagID;
	})[0];
	if(!conf) return null; // NO SUCH TAG, WHATEVER
	var button = document.createElement("a");
	button.href = "/"+tagID;
	button.classList.add("tag");
	button.classList.add("tag_"+tagID);
	if(options.small) button.setAttribute("small", "yes");
	button.innerHTML = conf.name;
	return button;
};

// Helper: remove newlines
var _clean = function(str){
	str = str.replace(/[^\:]\/\/.*\n/g,""); // strip comments
	str = str.replace(/\n|\t/g,""); // strip newlines & tabs
	return str;
};

// CSV to JSON
var _csvToJSON = function(csv){

	var results = [];

	// Get lines
	var lines = csv.split("\n");
	for(var i=1; i<lines.length; i++){ // skip first line, it's the header
		var line = lines[i];

		// Get props
		var props = line.split('\",\"');
		props[0] = props[0].slice(1); // remove quotes
		props[6] = props[6].slice(0, props[6].length-1); // remove quotes

		// Convert tags into array
		var tags = props[4].split(/,\s*/).sort();

		// Convert props
		if(props[5]=="yes") tags.push("featured");

		// Oh. Forget it.
		if(props[0]=="") continue;

		// Add result
		results.push({
			name: props[0],
			description: props[1],
			link: props[2],
			thumb: props[3],
			tags: tags
		});

	}

	return results;

};

// RESIZE
var _resize = function(){

	// Splash title position...
	// TODO: IN CSS
	/*setTimeout(function(){
		var bounds = splash_title.getBoundingClientRect();
		var w = bounds.width;
		var h = bounds.height;
		splash_title.style.marginTop = ((330-h)/2)+"px";
	},1);*/

	if(!pageIsIndex){
		var gallery = $("#gallery");
		gallery.setAttribute("size", (window.innerWidth<890) ? "big" : "small");
	}

};
window.addEventListener("resize", _resize, false);

// SCROLL
window.onscroll = function(){
	var scrollY = window.pageYOffset;
	splash_iframe.style.top = (scrollY/2)+"px";
};