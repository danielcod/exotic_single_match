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
	    bet: deepCopy(this.props.bet)
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
    formatVersusOptions: function(teams) {
	return teams.map(function(team) {
	    return {
		value: team.versus
	    }
	});
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
		    detached: true
		}),
		React.createElement(MySelect, {
		    label: "Versus",
		    name: "versus",
		    options: this.formatVersusOptions(this.filterVersus(this.state.options.versus, this.state.bet.team)),
		    value: this.state.bet.versus, // change
		    changeHandler: this.changeHandler,
		    blankStyle: this.props.blankStyle
		}),
		React.createElement(ExpirySelector, {
		    exoticsApi: this.props.exoticsApi,
		    expiry: this.state.bet.expiry,
		    changeHandler: this.changeHandler,
		    blankStyle: this.props.blankStyle
		})
	    ]
	});	
    }
});

