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

var PriceFetcher=function(url, handler, errHandler, debug) {
    this.cache={};
    this.fetch=function(payload) {
	var key=JSON.stringify(payload)
	if (this.cache[key]==undefined) {
	    if (debug) {
		console.log("Fetching price for "+key);
	    }
	    $.ajax({
		url: url,
		type: "POST",
		contentType: "application/json",
		data: JSON.stringify(payload),
		dataType: "json",
		success: function(struct) {
		    this.cache[key]=struct;
		    handler(struct);
		}.bind(this),
		error: errHandler
	    });
	} else {
	    if (debug) {
		console.log("Serving price for "+key+" from cache");
	    }
	    handler(this.cache[key]);
	}
    }
};
