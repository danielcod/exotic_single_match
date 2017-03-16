var SingleTeamOutrightForm=React.createClass({
    initOptionsHandler: function(name) {
	return function(struct) {
	    var state=this.state;
	    state.options[name]=struct;
	    this.setState(state);	
	}.bind(this);
    },
    getInitialState: function() {
	return {
	    options: {
		league: [],
		team: [],
		payoff: [],
		expiry: []
	    },
	    product: deepCopy(this.props.product)
	};
    },
    fetchLeagues: function() {
	var handler=this.initOptionsHandler("league");
	this.props.exoticsApi.fetchLeagues(handler);
    },
    formatLeagueOptions: function(leagues) {
	return leagues.map(function(league) {
	    return {
		value: league.name
	    }
	});
    },
    fetchTeams: function(product) {
	if (product.league!=undefined) {
	    var handler=this.initOptionsHandler("team");
	    this.props.exoticsApi.fetchTeams(product.league, handler);
	}
    },
    formatTeamOptions: function(teams) {
	return teams.map(function(team) {
	    return {
		value: team.name
	    }
	});
    },
    fetchPayoffs: function(product) {
	if (product.league!=undefined) {
	    var handler=this.initOptionsHandler("payoff");
	    var key="outright_payoffs/"+product.league;
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
	return expiries; // expiries come with label, value fields
    },
    hasPayoff: function(teamname, payoffname) {
	var payoffs=this.state.options.payoff.filter(function(payoff) {
	    return (payoff.team==teamname) && (payoff.payoff==payoffname);
	});
	return payoffs.length!=0;
    },
    changeHandler: function(name, value) {
	if (this.state.product[name]!=value) {
	    var state=this.state;
	    state.product[name]=value;
	    if (name=="league") {
		// load teams for league
		state.options.team=[];
		state.product.team=undefined;
		this.fetchTeams(state.product);
		// load payoffs for league
		state.options.payoff=[];
		state.product.payoff=undefined;
		this.fetchPayoffs(state.product);
	    } else if (name=="team") {
		// reset selected payoff if no longer exists
		if (!this.hasPayoff(value, this.state.product.payoff)) {
		    state.product.payoff=undefined;
		}
	    }
	    this.setState(state);
	    this.updatePrice(this.state.product);
	}
    },
    isComplete: function(product) {
	return ((product.league!=undefined) &&
		(product.team!=undefined) &&
		(product.payoff!=undefined) &&
		(product.expiry!=undefined));
    },
    priceHandler: function(struct) {
	$("span[id='price']").text(struct["price"]);
    },
    updatePrice: function(product) {
	if (this.isComplete(product)) {
	    $("span[id='price']").text("[updating ..]");
	    var struct={
		"type": "single_team_outright",
		"product": product
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
	this.fetchTeams(this.state.product);
	this.fetchPayoffs(this.state.product);
	this.fetchExpiries();
	this.updatePrice(this.state.product); 
    },
    componentDidMount: function() {
	this.initialise();
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
				value: this.state.product.league,
				changeHandler: this.changeHandler,
				blankStyle: this.props.blankStyle
			    }),
			React.createElement(
			    MySelect, {
				label: "Position",
				name: "payoff",
				options: this.formatPayoffOptions(this.filterPayoffs(this.state.options.payoff, this.state.product.team)),
				value: this.state.product.payoff,
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
				value: this.state.product.team,
				changeHandler: this.changeHandler,
				blankStyle: this.props.blankStyle
			    }),
			React.createElement(
			    MySelect, {
				label: "At",
				name: "expiry",
				options: this.formatExpiryOptions(this.state.options.expiry),
				value: this.state.product.expiry,
				changeHandler: this.changeHandler,
				blankStyle: this.props.blankStyle
			    })
		    ]
		})
	    ]
	})
    }
});

