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
	this.props.exoticsApi.fetchBlob("products/smb_versus", handler);
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
	if ((this.state.bet.params.league!=struct.league) ||
	    (this.state.bet.params.team!=struct.team)) {
	    var state=this.state;
	    state.bet.params.league=struct.league;
	    state.bet.params.team=struct.team;
	    // try and preserve versus value if possible
	    if (!this.hasVersus(struct.team, state.bet.params.versus)) {
		state.bet.params.versus=undefined;
	    }
	    this.setState(state);
	    this.updatePrice(this.state.bet);
	}
    },
    changeHandler: function(name, value) {
	if (this.state.bet.params[name]!=value) {
	    var state=this.state;
	    state.bet.params[name]=value;
	    this.setState(state);
	    this.updatePrice(this.state.bet);
	}
    },
    isComplete: function(bet) {
	return ((bet.params.league!=undefined) &&
		(bet.params.team!=undefined) &&
		(bet.params.versus!=undefined) &&
		(bet.params.team!=bet.params.versus) &&
		(bet.params.expiry!=undefined));
    },
    updatePrice: function(bet) {
	if (this.isComplete(bet)) {
	    this.props.updatePriceHandler(bet)
	} else {
	    this.props.resetPriceHandler();
	}
    },
    componentDidMount: function() {
	this.fetchVersus();
	this.updatePrice(this.state.bet); 
    },
    render: function() {
	return React.createElement(GridLayout, {
	    rows: [
		React.createElement(TeamSelector, {
		    exoticsApi: this.props.exoticsApi,
		    item: {
			league: this.state.bet.params.league,
			team: this.state.bet.params.team
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
		    options: this.formatVersusOptions(this.filterVersus(this.state.options.versus, this.state.bet.params.team)),
		    value: this.state.bet.params.versus,
		    changeHandler: this.changeHandler,
		    blankStyle: this.props.blankStyle,
		    defaultOption: {
			label: "Select"
		    }
		}),
		React.createElement(ExpirySelector, {
		    exoticsApi: this.props.exoticsApi,
		    expiry: this.state.bet.params.expiry,
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

