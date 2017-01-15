var OptionsLoader=function(handler, errHandler, debug) {
    this.cache={};
    this.fetch=function(name, url) {
	if (this.cache[url]==undefined) {
	    if (debug) {
		console.log("Fetching "+url);
	    }
	    $.ajax({
		url: url,
		type: "GET",
		dataType: "json",
		success: function(struct) {
		    this.cache[url]=struct;
		    handler(name, struct);
		}.bind(this),
		error: errHandler
	    });
	} else {
	    if (debug) {
		console.log("Serving "+url+" from cache");
	    }
	    handler(name, this.cache[url]);
	}
    }
};

