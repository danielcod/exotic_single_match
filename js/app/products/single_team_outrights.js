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
    formatLeagueOptions: function(leagues) {
	return leagues.map(function(league) {
	    return {
		value: league.value
	    }
	});
    },
    fetchTeams: function(params) {
	if (params.league!=undefined) {
	    var handler=this.initOptionsHandler("team");
	    this.props.exoticsApi.fetchTeams(params.league, handler);
	}
    },
    formatTeamOptions: function(teams) {
	return teams.map(function(team) {
	    return {
		value: team.value
	    }
	});
    },
    fetchPayoffs: function(params) {
	if (params.league!=undefined) {
	    var handler=this.initOptionsHandler("payoff");
	    var key="outright_payoffs/"+params.league;
	    this.props.exoticsApi.fetchBlob(key, handler);
	}
    },
    filterPayoffs: function(payoffs, teamname) {
	return payoffs.filter(function(payoff) {
	    return payoff.team==teamname;
	})
    },
    formatPayoffOptions: function(payoffs) {
	return payoffs.map(function(payoff) {
	    return {
		value: payoff.payoff
	    }
	});
    },
    fetchExpiries: function() {
	var handler=this.initOptionsHandler("expiry");
	this.props.exoticsApi.fetchExpiries(handler);
    },
    formatExpiryOptions: function(expiries) {
	return expiries.map(function(expiry) {
	    return {
		value: expiry.value
	    }
	});
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
	this.fetchTeams(this.state.params);
	this.fetchPayoffs(this.state.params);
	this.fetchExpiries();
	this.updatePrice(this.state.params); 
    },
    componentDidMount: function() {
	this.initialise();
    },
    hasPayoff: function(teamname, payoffname) {
	var payoffs=this.state.options.payoff.filter(function(payoff) {
	    return (payoff.team==teamname) && (payoff.payoff==payoffname);
	});
	return payoffs.length!=0;
    },
    changeHandler: function(name, value) {
	if (this.state.params[name]!=value) {
	    var state=this.state;
	    state.params[name]=value;
	    if (name=="league") {
		// load teams for league
		state.options.team=[];
		state.params.team=undefined;
		this.fetchTeams(state.params);
		// load payoffs for league
		state.options.payoff=[];
		state.params.payoff=undefined;
		this.fetchPayoffs(state.params);
	    } else if (name=="team") {
		// reset selected payoff if no longer exists
		if (!this.hasPayoff(value, this.state.params.payoff)) {
		    state.params.payoff=undefined;
		}
	    }
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
				options: this.formatLeagueOptions(this.state.options.league),
				value: this.state.params.league,
				changeHandler: this.changeHandler,
				blankStyle: this.props.blankStyle
			    }),
			React.createElement(
			    MySelect, {
				label: "Position",
				name: "payoff",
				options: this.formatPayoffOptions(this.filterPayoffs(this.state.options.payoff, this.state.params.team)),
				value: this.state.params.payoff,
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
				options: this.formatTeamOptions(this.state.options.team),
				value: this.state.params.team,
				changeHandler: this.changeHandler,
				blankStyle: this.props.blankStyle
			    }),
			React.createElement(
			    MySelect, {
				label: "At",
				name: "expiry",
				// options: this.formatExpiryOptions(this.state.options.expiry),
				options: this.state.options.expiry,
				value: this.state.params.expiry,
				changeHandler: this.changeHandler,
				blankStyle: this.props.blankStyle
			    })
		    ]
		})
	    ]
	})
    }
});

