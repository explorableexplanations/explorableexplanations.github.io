// The poor man's jQuery
var $ = function(query){
	return document.querySelector(query);
};

// DOMs made quick & cheap
var _createDom = function(id, appendTo, tag){
	appendTo = appendTo || document.body;
	tag = tag || "div";
	var div = document.createElement(tag);
	div.id = id;
	appendTo.appendChild(div);
	return div;
};

// Everyday I'm shuffling
// From StackOverflow: https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
function _shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}