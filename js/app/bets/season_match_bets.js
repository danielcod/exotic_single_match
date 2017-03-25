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
		versus: []
	    },
	    bet: this.props.bet
	};
    },
    fetchVersus: function() {
	var handler=this.initOptionsHandler("versus");
	this.props.exoticsApi.fetchBlob("smb_versus", handler);
    },
    filterVersus: function(teams, teamname) {
	return teams.filter(function(team) {
	    return (team.team==teamname) && (team.versus!=teamname);
	})
    },
    formatVersusLabel: function(team) {
	if ((team.league==undefined) ||
	    (team.versus==undefined)) {
	    return undefined;
	} else {
	    return team.versus+" ("+team.league+")";
	}
    },
    formatVersusOptions: function(teams) {
	return teams.map(function(team) {
	    return {
		label: this.formatVersusLabel(team),
		value: team.versus
	    }
	}.bind(this));
    },
    hasVersus: function(teamname, versusname) {
	var versus=this.state.options.versus.filter(function(versus) {
	    return (versus.team==teamname) && (versus.versus==versusname);
	});
	return versus.length!=0;
    },
    teamChangeHandler: function(struct) {
	if ((this.state.bet.league!=struct.league) ||
	    (this.state.bet.team!=struct.team)) {
	    var state=this.state;
	    state.bet.league=struct.league;
	    state.bet.team=struct.team;
	    if (!this.hasVersus(struct.team, state.bet.versus)) {
		state.bet.versus=undefined;
	    }
	    this.setState(state);
	    this.updatePrice(this.state.bet);
	}
    },
    changeHandler: function(name, value) {
	if (this.state.bet[name]!=value) {
	    var state=this.state;
	    state.bet[name]=value;
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
	this.fetchVersus();
	this.updatePrice(this.state.bet); 
    },
    componentDidMount: function() {
	this.initialise();
    },
    render: function() {
	return React.createElement(GridLayout, {
	    rows: [
		React.createElement(TeamSelector, {
		    exoticsApi: this.props.exoticsApi,
		    item: {
			league: this.state.bet.league,
			team: this.state.bet.team
		    },
		    changeHandler: this.teamChangeHandler,
		    blankStyle: this.props.blankStyle,
		    label: "Team",
		    defaultOption: {
			label: "Select"
		    }
		}),
		React.createElement(MySelect, {
		    label: "Versus",
		    name: "versus",
		    options: this.formatVersusOptions(this.filterVersus(this.state.options.versus, this.state.bet.team)),
		    value: this.state.bet.versus,
		    changeHandler: this.changeHandler,
		    blankStyle: this.props.blankStyle,
		    defaultOption: {
			label: "Select"
		    }
		}),
		React.createElement(ExpirySelector, {
		    exoticsApi: this.props.exoticsApi,
		    expiry: this.state.bet.expiry,
		    changeHandler: this.changeHandler,
		    blankStyle: this.props.blankStyle,
		    defaultOption: {
			label: "Select"
		    }
		})
	    ]
	});	
    }
});

