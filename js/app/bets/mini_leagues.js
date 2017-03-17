var MiniLeagueForm=React.createClass({
    initOptionsHandler: function(name) {
	return function(struct) {
	    var state=this.state;
	    state.options[name]=struct;
	    this.setState(state);	
	}.bind(this);
    },
    initBet: function(bet) {
	if (bet.versus==undefined) {
	    bet.versus=[];
	}
	return bet;
    },
    getInitialState: function() {
	return {
	    options: {
		league: [],
		team: [],
		payoff: [
		    {
			value: "Top"
		    },
		    {
			value: "Bottom"
		    }
		],
		expiry: []
	    },
	    bet: this.initBet(deepCopy(this.props.bet))
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
    fetchTeams: function(bet) {
	if (bet.league!=undefined) {
	    var handler=this.initOptionsHandler("team");
	    this.props.exoticsApi.fetchTeams(bet.league, handler);
	}
    },
    formatTeamOptions: function(teams) {
	return teams.map(function(team) {
	    return {
		value: team.name
	    }
	});
    },
    versusChangeHandler: function(items) {
	var state=this.state;
	state.bet.versus=items.map(function(item) {
	    return {
		league: item.league,
		team: item.team
	    };
	});
	this.setState(state);
    },
    fetchExpiries: function() {
	var handler=this.initOptionsHandler("expiry");
	this.props.exoticsApi.fetchExpiries(handler);
    },
    formatExpiryOptions: function(expiries) {
	return expiries; // expiries come with label, value fields
    },
    changeHandler: function(name, value) {
	if (this.state.bet[name]!=value) {
	    var state=this.state;
	    state.bet[name]=value;
	    if (name=="league") {
		// load teams for league
		state.options.team=[];
		state.bet.team=undefined;
		this.fetchTeams(state.bet);
	    }
	    this.setState(state);
	    this.updatePrice(this.state.bet);
	}
    },
    isComplete: function(bet) {
	return ((bet.league!=undefined) &&
		(bet.team!=undefined) &&
		(bet.payoff!=undefined) &&
		(bet.expiry!=undefined));
    },
    updatePrice: function(bet) {
	if (this.isComplete(bet)) {
	    this.props.updatePriceHandler("mini_league", bet)
	} else {
	    this.props.resetPriceHandler();
	}
    },
    initialise: function() {
	this.fetchLeagues();
	this.fetchTeams(this.state.bet);
	this.fetchExpiries();
	this.updatePrice(this.state.bet); 
    },
    componentDidMount: function() {
	this.initialise();
    },
    render: function() {
	return React.DOM.div({
	    children: [
		React.DOM.div({
		    className: "row",
		    children: [
			React.DOM.div({
			    className: "col-xs-6",
			    children: React.createElement(
				MySelect, {
				    label: "League",
				    name: "league",
				    options: this.formatLeagueOptions(this.state.options.league),
				    value: this.state.bet.league,
				    changeHandler: this.changeHandler,
				    blankStyle: this.props.blankStyle
				}),
			}),			
			React.DOM.div({
			    className: "col-xs-6",
			    children: React.createElement(
				MySelect, {
				    label: "Team",
				    name: "team",
				    options: this.formatTeamOptions(this.state.options.team),
				    value: this.state.bet.team,
				    changeHandler: this.changeHandler,
				    blankStyle: this.props.blankStyle
				})
			})			
		    ]
		}),
		React.DOM.div({
		    className: "row",
		    children: React.DOM.div({
			className: "col-xs-12",
			children: [
			    React.DOM.div({
				className: "text-center",
				children: React.DOM.label({
				    style: {
					"margin-top": "12px"
				    },
				    children: "Versus"
				})
			    }),
			    React.createElement(TeamSelectorTable, {
				items: this.state.bet.versus,
				exoticsApi: this.props.exoticsApi,
				blankStyle: this.props.blankStyle,
				changeHandler: this.versusChangeHandler
			    })
			]
		    })
		}),
		React.DOM.div({
		    className: "row",
		    children: [
			React.DOM.div({
			    className: "col-xs-6",
			    children: React.createElement(
				MySelect, {
				    label: "Position",
				    name: "payoff",
				    options: this.state.options.payoff,
				    value: this.state.bet.payoff,
				    changeHandler: this.changeHandler,
				    blankStyle: this.props.blankStyle
				})
			}),
			React.DOM.div({
			    className: "col-xs-6",
			    children: React.createElement(
				MySelect, {
				    label: "At",
				    name: "expiry",
				    options: this.formatExpiryOptions(this.state.options.expiry),
				    value: this.state.bet.expiry,
				    changeHandler: this.changeHandler,
				    blankStyle: this.props.blankStyle
				})
			})
		    ]
		})
	    ]
	})
    }
});



