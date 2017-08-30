#!/usr/bin/env node

var fs = require('fs');

// Read Tags & Pages
var tags = JSON.parse(_clean(fs.readFileSync('-data/tags.json', 'utf8')));
var pages = JSON.parse(_clean(fs.readFileSync('-data/pages.json', 'utf8')));
var template = fs.readFileSync('_template.html', 'utf8');

// Create the pages!
for(var pageID in pages){

	// What page is this? (and is this the index?)
	var isIndex = (pageID=="index");
	var isAll = (pageID=="all");
	var page = pages[pageID];

	////////////////////////////////
	// EDIT THE TEMPLATE ///////////
	////////////////////////////////

	var html = template+""; // clone string?
	
	// 1. Base?
	html = html.replace("[[base?]]", isIndex ? "" : "<base href='/'>");
	
	// 2. Title
	var title = "Explorable Explanations";
	if(!isIndex) title = page.title+" | "+title;
	html = html.replace(/\[\[title\]\]/g, title);

	// 3. Index style? If Text is TOO BIG
	if(page.customCSS){
		html = html.replace("[[index_style?]]", "<style>"+page.customCSS+"</style>");
	}else{
		html = html.replace("[[index_style?]]", isIndex ?
			"<style>"+
			"#splash_title{ margin-top: 65px; }"+
			"@media (max-width: 900px){ #splash_title{ font-size: 75px; margin-top: 105px; } }"+
			"</style>"
		: "");
	}

	// 4. Splash BG color
	if(isIndex || isAll){
		html = html.replace("[[splash_color]]", "");
	}else{
		var tag = tags.filter(function(tag){ return tag.id==pageID; })[0];
		html = html.replace("[[splash_color]]", "style='background:"+tag.color+";'");
	}

	// 5. Iframe Src
	html = html.replace("[[iframe_src]]", "/-splash/"+page.splash);

	// 6. Splash title
	html = html.replace("[[splash_title]]", page.splashTitle);

	// 7. Splash home?
	html = html.replace("[[splash_home?]]", !isIndex ? "<a href='/' id='splash_home'></a>" : "");

	// 8. Intro Words
	html = html.replace("[[intro]]", page.intro);

	////////////////////////////////
	// WRITE THE FILE //////////////
	////////////////////////////////

	// What's the path?
	var path = "";
	if(!isIndex){
		path = pageID+"/";
		if(!fs.existsSync(pageID)) fs.mkdirSync(pageID); // Create directory if doesn't already exist
	}

	// Create file!
	fs.writeFileSync(path+"index.html", html, 'utf8');

}

// Helper: remove newlines
function _clean(str){
	str = str.replace(/[^\:]\/\/.*\n/g,""); // strip comments
	str = str.replace(/\n|\t/g,""); // strip newlines & tabs
	return str;
};