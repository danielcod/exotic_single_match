var SeasonMatchBetForm=React.createClass({
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
		versus: [],
		expiry: []
	    },
	    bet: deepCopy(this.props.bet)
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
    fetchVersus: function(bet) {
	if (bet.league!=undefined) {
	    var handler=this.initOptionsHandler("versus");
	    var key="smb_versus/"+bet.league;
	    this.props.exoticsApi.fetchBlob(key, handler);
	}
    },
    filterVersus: function(teams, teamname) {
	return teams.filter(function(team) {
	    return (team.team==teamname) && (team.versus!=teamname);
	})
    },
    formatVersusOptions: function(teams) {
	return teams.map(function(team) {
	    return {
		value: team.versus
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
    hasVersus: function(teamname, versusname) {
	var versus=this.state.options.versus.filter(function(versus) {
	    return (versus.team==teamname) && (versus.versus==versusname);
	});
	return versus.length!=0;
    },
    changeHandler: function(name, value) {
	if (this.state.bet[name]!=value) {
	    var state=this.state;
	    state.bet[name]=value;
	    if (name=="league") {
		state.options.team=[];
		state.bet.team=undefined;
		this.fetchTeams(state.bet);
		state.options.versus=[];
		state.bet.versus=undefined;
		this.fetchVersus(state.bet);
	    } else if (name=="team") {
		if (!this.hasVersus(value, this.state.bet.versus)) {
		    state.bet.versus=undefined;
		}
            }
	    this.setState(state);
	    this.updatePrice(this.state.bet);
	}
    },
    isComplete: function(bet) {
	return ((bet.league!=undefined) &&
		(bet.team!=undefined) &&
		(bet.versus!=undefined) &&
		(bet.team!=bet.versus) &&
		(bet.expiry!=undefined));
    },
    updatePrice: function(bet) {
	if (this.isComplete(bet)) {
	    this.props.updatePriceHandler("season_match_bet", bet)
	} else {
	    this.props.resetPriceHandler();
	}
    },
    initialise: function() {
	this.fetchLeagues();
	this.fetchTeams(this.state.bet);
	this.fetchVersus(this.state.bet);
	this.fetchExpiries();
	this.updatePrice(this.state.bet); 
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
				value: this.state.bet.league,
				changeHandler: this.changeHandler,
				blankStyle: this.props.blankStyle
			    }),
			React.createElement(
			    MySelect, {
				label: "Versus",
				name: "versus",
				options: this.formatVersusOptions(this.filterVersus(this.state.options.versus, this.state.bet.team)),
				value: this.state.bet.versus,
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
				label: "Your Team",
				name: "team",
				options: this.formatTeamOptions(this.state.options.team),
				value: this.state.bet.team,
				changeHandler: this.changeHandler,
				blankStyle: this.props.blankStyle
			    }),
			React.createElement(
			    MySelect, {
				label: "At",
				name: "expiry",
				options: this.formatExpiryOptions(this.state.options.expiry),
				value: this.state.bet.expiry,
				changeHandler: this.changeHandler,
				blankStyle: this.props.blankStyle
			    })
		    ]
		})
	    ]
	})
    }
});

