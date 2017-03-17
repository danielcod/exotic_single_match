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
    this.fetchProducts=function(handler) {
	this.httpGet("/app/bets", handler);
    };
    this.listBets=function(group, team, type, handler) {
	var url="/app/bets/list?";
	url+="group="+group+"&";
	if (team!=undefined) {
	    url+="team="+team+"&";
	}
	if (type!=undefined) {
	    url+="type="+type+"&";
	}
	this.httpGet(url, handler);
    };
    this.showBet=function(type, id, handler) {
	var url="/app/bets/show?type="+type+"&id="+id;
	this.httpGet(url, handler);
    },
    this.fetchLeagues=function(handler) {
	this.httpGet("/app/leagues", handler);
    };
    this.fetchTeams=function(leaguename, handler) {
	var url;
	if (leaguename==undefined) {
	    url="/app/teams?league=All";
	} else {
	    url="/app/teams?league="+leaguename;
	}
	this.httpGet(url, handler);
    };
    this.fetchBlob=function(key, handler) {
	var url="/app/blobs?key="+key;
	this.httpGet(url, handler);
    },
    this.fetchExpiries=function(handler) {
	this.httpGet("/app/expiries", handler);
    };
    this.fetchPrice=function(struct, handler) {
	this.httpPost("/app/bets/price", struct, handler);
    };
};

