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

var SingleTeamsForm=React.createClass({
    deepCopy: function(struct) {
	return JSON.parse(JSON.stringify(struct));
    },
    ajaxErrHandler: function(xhr, ajaxOptions, thrownError) {
	console.log(xhr.responseText);
    },
    initOptionsLoader: function(debug) {
	var handler=function(name, struct) {
	    var state=this.state;
	    state.options[name]=struct;
	    this.setState(state);	
	}.bind(this);
	return new OptionsLoader(handler, this.ajaxErrHandler, debug);
    },
    initPriceFetcher: function(url, debug) {
	var handler=function(struct) {
	    $("span[id='price']").text(struct["decimal_price"]);
	};
	return new PriceFetcher(url, handler, this.ajaxErrHandler, debug);
    },
    getInitialState: function() {
	return {
	    options: {
		league: [],
		team: [],
		payoff: [],
		expiry: []
	    },
	    params: this.deepCopy(this.props.params),
	    id: Math.round(1e10*Math.random()),
	    optionsLoader: this.initOptionsLoader(false),
	    priceFetcher: this.initPriceFetcher("/api/products/pricing", true)
	};
    },
    teamsUrl: function(params) {
	return "/api/teams?league="+params.league;
    },
    payoffsUrl: function(params) {
	return "/api/products/payoffs?product=single_teams&league="+params.league;
    },
    isComplete: function(params) {
	return ((params.league!=undefined) &&
		(params.team!=undefined) &&
		(params.payoff!=undefined) &&
		(params.expiry!=undefined));
    },
    updatePrice: function(params) {
	if (this.isComplete(params)) {
	    var struct={
		"product": "single_teams",
		"query": params
	    };
	    $("span[id='price']").text("[updating ..]");
	    this.state.priceFetcher.fetch(struct);
	} else {
	    $("span[id='price']").text("[..]");
	}
    },
    componentDidMount: function() {
	this.state.optionsLoader.fetch("league", "/api/leagues");
	if (this.props.params.league!=undefined) {
	    this.state.optionsLoader.fetch("team", this.teamsUrl(this.props.params));
	}
	if (this.props.params.team!=undefined) {
	    this.state.optionsLoader.fetch("payoff", this.payoffsUrl(this.props.params));
	}
	this.state.optionsLoader.fetch("expiry", "/api/expiries");
	this.updatePrice(this.state.params);
    },
    changeHandler: function(name, value) {
	if (this.state.params[name]!=value) {
	    var state=this.state;
	    state.params[name]=value;
	    if (name=="league") {
		// team
		state.options.team=[];
		state.params.team=undefined;
		this.state.optionsLoader.fetch("team", this.teamsUrl(state.params));
		// payoff
		state.options.payoff=[];
		state.params.payoff=undefined;
		this.state.optionsLoader.fetch("payoff", this.payoffsUrl(state.params));
	    };
	    this.setState(state);
	    this.updatePrice(this.state.params);
	}
    },
    reset: function() {
	var state=this.state;
	state.params=this.deepCopy(this.props.params);
	state.id=Math.round(1e10*Math.random());
	this.setState(state);
	if (this.props.params.league!=undefined) {
	    this.state.optionsLoader.fetch("team", this.teamsUrl(this.props.params));
	}
	if (this.props.params.team!=undefined) {
	    this.state.optionsLoader.fetch("payoff", this.payoffsUrl(this.props.params));
	}
	this.updatePrice(this.state.params);
    },
    render: function() {
	return React.DOM.div({
	    children: [
		React.createElement(
		    SimpleSelect, {
			label: "League",
			name: "league",
			options: this.state.options.league,
			value: this.props.params.league,
			changeHandler: this.changeHandler,
			id: this.state.id
		    }),
		React.createElement(
		    SimpleSelect, {
			label: "Team",
			name: "team",
			options: this.state.options.team,
			value: this.props.params.team,
			changeHandler: this.changeHandler,
			id: this.state.id
		    }),
		React.createElement(
		    SimpleSelect, {
			label: "Payoff",
			name: "payoff",
			options: this.state.options.payoff,
			value: this.props.params.payoff,
			changeHandler: this.changeHandler,
			id: this.state.id
		    }),
		React.createElement(
		    SimpleSelect, {
			label: "Expiry",
			name: "expiry",
			options: this.state.options.expiry,
			value: this.props.params.expiry,
			changeHandler: this.changeHandler,
			id: this.state.id
		    }),
		React.DOM.div({
		    className: "text-right",
		    children: React.DOM.button({
			className: "btn btn-danger",
			onClick: this.reset,
			children: "Reset"
		    })
		})
	    ]
	})
    }
});

