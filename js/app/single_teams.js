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
    fetchLeagues: function() {
	this.state.optionsLoader.fetch("league", "/api/leagues");
    },
    fetchTeams: function(params) {
	var url="/api/teams?league="+params.league;
	this.state.optionsLoader.fetch("team", url);
    },
    fetchPayoffs: function(params) {
	var url="/api/products/payoffs?product=single_teams&league="+params.league;
	this.state.optionsLoader.fetch("payoff", url);
    },
    fetchExpiries: function() {
	this.state.optionsLoader.fetch("expiry", "/api/expiries");
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
	this.fetchLeagues();
	if (this.props.params.league!=undefined) {
	    this.fetchTeams(this.props.params);
	    this.fetchPayoffs(this.props.params);
	}
	this.fetchExpiries();
	this.updatePrice(this.state.params); // state ?
    },
    changeHandler: function(name, value) {
	if (this.state.params[name]!=value) {
	    var state=this.state;
	    state.params[name]=value;
	    if (name=="league") {
		// team
		state.options.team=[];
		state.params.team=undefined;
		this.fetchTeams(state.params);
		// payoff
		state.options.payoff=[];
		state.params.payoff=undefined;
		this.fetchPayoffs(state.params);
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
	    this.fetchTeams(this.props.params);
	}
	if (this.props.params.team!=undefined) {
	    this.fetchPayoffs(this.props.params);
	}
	this.updatePrice(this.state.params); // state ?
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

