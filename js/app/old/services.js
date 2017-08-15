var ExoticsAPI=function(errHandler, debug) {
    this.debug=debug || false;
    this.cache={};
    this.httpGet=function(url, handler) {
	var key=url;
	if (this.cache[key]==undefined) {
	    if (this.debug) {
		console.log("Fetching "+key);
	    }
	    $.ajax({
		url: url,
		type: "GET",
		dataType: "json",
		success: function(struct) {
		    this.cache[key]=struct;
		    handler(struct);
		}.bind(this),
		error: errHandler
	    });
	} else {
	    if (this.debug) {
		console.log("Serving "+key+" from cache");
	    }
	    handler(this.cache[key]);
	}
    },
    this.httpPost=function(url, payload, handler) {
	var key=url+" "+JSON.stringify(payload)
	if (this.cache[key]==undefined) {
	    if (this.debug) {
		console.log("Fetching "+key);
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
	    if (this.debug) {
		console.log("Serving "+key+" from cache");
	    }
	    handler(this.cache[key]);
	}
    };
    this.fetchMatches=function(handler) {
	var url="/app/matches";
	this.httpGet(url, handler);
    };
    this.fetchPrice=function(body, handler) {
	var url="/app/bets/price";
	this.httpPost(url, body, handler);
    }
};
