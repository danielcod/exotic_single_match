var SingleTeamsForm=React.createClass({
    productType: "single_teams",
    initOptionsHandler: function(name) {
	return function(struct) {
	    var state=this.state;
	    state.options[name]=struct;
	    this.setState(state);	
	}.bind(this);
    },
    priceHandler: function(struct) {
	$("span[id='price']").text(struct["price"]);
    },
    getInitialState: function() {
	return {
	    options: {
		league: [],
		team: [],
		payoff: [],
		expiry: []
	    },
	    params: deepCopy(this.props.params),
	    id: Math.round(1e10*Math.random()),
	    exoticsApi: new ExoticsAPI(ajaxErrHandler, false),
	    resetLevel: "default"
	};
    },
    fetchLeagues: function() {
	var handler=this.initOptionsHandler("league");
	this.state.exoticsApi.fetchLeagues(handler);
    },
    fetchTeams: function(params) {
	if (params.league!=undefined) {
	    var handler=this.initOptionsHandler("team");
	    this.state.exoticsApi.fetchTeams(params.league, handler);
	}
    },
    fetchPayoffs: function(params) {
	if (params.league!=undefined) {
	    var url="/app/products/payoffs?type="+this.productType+"&league="+params.league;
	    var handler=this.initOptionsHandler("payoff");
	    this.state.exoticsApi.httpGet(url, handler);
	}
    },
    fetchExpiries: function() {
	var handler=this.initOptionsHandler("expiry");
	this.state.exoticsApi.fetchExpiries(handler);
    },
    isComplete: function(params) {
	return ((params.league!=undefined) &&
		(params.team!=undefined) &&
		(params.payoff!=undefined) &&
		(params.expiry!=undefined));
    },
    updatePrice: function(params) {
	if (this.isComplete(params)) {
	    $("span[id='price']").text("[updating ..]");
	    var struct={
		"type": this.productType,
		"params": params
	    };
	    this.state.exoticsApi.fetchPrice(struct, this.priceHandler);
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
	state.params=deepCopy(this.props.params);
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

