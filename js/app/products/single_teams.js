var SingleTeamsForm=React.createClass({
    productName: "single_teams",
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
	    $("span[id='price']").text(struct["price"]);
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
	    optionsLoader: this.initOptionsLoader(),
	    priceFetcher: this.initPriceFetcher("/app/products/price"),
	    resetLevel: "default"
	};
    },
    fetchLeagues: function() {
	this.state.optionsLoader.fetch("league", "/app/leagues");
    },
    fetchTeams: function(params) {
	if (params.league!=undefined) {
	    var url="/app/teams?league="+params.league;
	    this.state.optionsLoader.fetch("team", url);
	}
    },
    fetchPayoffs: function(params) {
	if (params.league!=undefined) {
	    var url="/app/products/payoffs?product="+this.productName+"&league="+params.league;
	    this.state.optionsLoader.fetch("payoff", url);
	}
    },
    fetchExpiries: function() {
	this.state.optionsLoader.fetch("expiry", "/app/expiries");
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
		"product": this.productName,
		"query": params
	    };
	    $("span[id='price']").text("[updating ..]");
	    this.state.priceFetcher.fetch(struct);
	} else {
	    $("span[id='price']").text("[..]");
	}
    },
    initialise: function() {
	this.fetchLeagues();
	this.fetchTeams(this.props.params);
	this.fetchPayoffs(this.props.params);
	this.fetchExpiries();
	this.updatePrice(this.props.params); 
    },
    reset: function() {
	var state=this.state;
	state.params=this.deepCopy(this.props.params);
	state.id=Math.round(1e10*Math.random());
	state.resetLevel="default";
	this.setState(state);
	this.initialise();
    },
    componentDidMount: function() {
	this.initialise();
    },
    changeHandler: function(name, value) {
	if (this.state.params[name]!=value) {
	    var state=this.state;
	    state.params[name]=value;
	    if (name=="league") {
		state.options.team=[];
		state.params.team=undefined;
		this.fetchTeams(state.params);
		state.options.payoff=[];
		state.params.payoff=undefined;
		this.fetchPayoffs(state.params);
	    };
	    state.resetLevel="warning";
	    this.setState(state);
	    this.updatePrice(this.state.params);
	}
    },
    render: function() {
	return React.DOM.div({
	    children: [
		React.DOM.div({
		    className: "text-right",
		    children: React.DOM.button({
			className: "btn btn-"+this.state.resetLevel,
			onClick: this.reset,
			children: "Reset"
		    })
		}),
		React.createElement(
		    MySelect, {
			label: "League",
			name: "league",
			options: this.state.options.league,
			value: this.props.params.league,
			changeHandler: this.changeHandler,
			id: this.state.id,
			blankStyle: this.props.blankStyle
		    }),
		React.createElement(
		    MySelect, {
			label: "Team",
			name: "team",
			options: this.state.options.team,
			value: this.props.params.team,
			changeHandler: this.changeHandler,
			id: this.state.id,
			blankStyle: this.props.blankStyle
		    }),
		React.createElement(
		    MySelect, {
			label: "Position",
			name: "payoff",
			options: this.state.options.payoff,
			value: this.props.params.payoff,
			changeHandler: this.changeHandler,
			id: this.state.id,
			blankStyle: this.props.blankStyle
		    }),
		React.createElement(
		    MySelect, {
			label: "At",
			name: "expiry",
			options: this.state.options.expiry,
			value: this.props.params.expiry,
			changeHandler: this.changeHandler,
			id: this.state.id,
			blankStyle: this.props.blankStyle
		    })
	    ]
	})
    }
});

