var SingleTeamOutrightForm=React.createClass({
    productType: "single_team_outright",
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
	    params: deepCopy(this.props.params)
	};
    },
    fetchLeagues: function() {
	var handler=this.initOptionsHandler("league");
	this.props.exoticsApi.fetchLeagues(handler);
    },
    fetchTeams: function(params) {
	if (params.league!=undefined) {
	    var handler=this.initOptionsHandler("team");
	    this.props.exoticsApi.fetchTeams(params.league, handler);
	}
    },
    fetchPayoffs: function(params) {
	if (params.league!=undefined) {
	    var url="/app/products/payoffs?type="+this.productType+"&league="+params.league;
	    var handler=this.initOptionsHandler("payoff");
	    this.props.exoticsApi.httpGet(url, handler);
	}
    },
    fetchExpiries: function() {
	var handler=this.initOptionsHandler("expiry");
	this.props.exoticsApi.fetchExpiries(handler);
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
	    this.props.exoticsApi.fetchPrice(struct, this.priceHandler);
	    this.props.changeHandler(struct);
	} else {
	    $("span[id='price']").text("[..]");
	    this.props.changeHandler(undefined);
	}
    },
    initialise: function() {
	this.fetchLeagues();
	this.fetchTeams(this.props.params);
	this.fetchPayoffs(this.props.params);
	this.fetchExpiries();
	this.updatePrice(this.props.params); 
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
	    this.setState(state);
	    this.updatePrice(this.state.params);
	}
    },
    render: function() {
	return React.DOM.div({
	    className: "row",
	    children: [
		React.DOM.div({
		    className: "col-xs-6",
		    children: [
			React.createElement(
			    MySelect, {
				label: "League",
				name: "league",
				options: this.state.options.league,
				value: this.props.params.league,
				changeHandler: this.changeHandler,
				blankStyle: this.props.blankStyle
			    }),
			React.createElement(
			    MySelect, {
				label: "Position",
				name: "payoff",
				options: this.state.options.payoff,
				value: this.props.params.payoff,
				changeHandler: this.changeHandler,
				blankStyle: this.props.blankStyle
			    })
		    ]
		}),
		React.DOM.div({
		    className: "col-xs-6",
		    children: [
			React.createElement(
			    MySelect, {
				label: "Team",
				name: "team",
				options: this.state.options.team,
				value: this.props.params.team,
				changeHandler: this.changeHandler,
				blankStyle: this.props.blankStyle
			    }),
			React.createElement(
			    MySelect, {
				label: "At",
				name: "expiry",
				options: this.state.options.expiry,
				value: this.props.params.expiry,
				changeHandler: this.changeHandler,
				blankStyle: this.props.blankStyle
			    })
		    ]
		})
	    ]
	})
    }
});
