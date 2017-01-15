var SingleTeamsForm=React.createClass({
    deepCopy: function(struct) {
	return JSON.parse(JSON.stringify(struct));
    },
    initOptionsLoader: function(debug) {
	var handler=function(name, struct) {
	    var state=this.state;
	    state.options[name]=struct;
	    this.setState(state);	
	}.bind(this);
	var errHandler=function(xhr, ajaxOptions, thrownError) {
	    console.log(xhr.responseText);
	};
	return new OptionsLoader(handler, errHandler, debug);
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
	    loader: this.initOptionsLoader(true)
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
    fetchPriceSuccess: function(struct) {
	$("span[id='price']").text(struct["decimal_price"]);
    },
    fetchPriceError: function(xhr, ajaxOptions, thrownError) {
	console.log(xhr.responseText);
    },
    fetchPrice: function(struct) {
	$.ajax({
	    type: "POST",
	    url: "/api/products/pricing",
	    data: JSON.stringify(struct),
	    contentType: "application/json",
	    dataType: "json",
	    success: this.fetchPriceSuccess,
	    error: this.fetchPriceError
	});
    },
    updatePrice: function(params) {
	if (this.isComplete(params)) {
	    var struct={
		"product": "single_teams",
		"query": params
	    };
	    $("span[id='price']").text("[updating ..]");
	    this.fetchPrice(struct);
	} else {
	    $("span[id='price']").text("[..]");
	}
    },
    componentDidMount: function() {
	this.state.loader.fetch("league", "/api/leagues");
	if (this.props.params.league!=undefined) {
	    this.state.loader.fetch("team", this.teamsUrl(this.props.params));
	}
	if (this.props.params.team!=undefined) {
	    this.state.loader.fetch("payoff", this.payoffsUrl(this.props.params));
	}
	this.state.loader.fetch("expiry", "/api/expiries");
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
		this.state.loader.fetch("team", this.teamsUrl(state.params));
		// payoff
		state.options.payoff=[];
		state.params.payoff=undefined;
		this.state.loader.fetch("payoff", this.payoffsUrl(state.params));
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
	    this.state.loader.fetch("team", this.teamsUrl(this.props.params));
	}
	if (this.props.params.team!=undefined) {
	    this.state.loader.fetch("payoff", this.payoffsUrl(this.props.params));
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

