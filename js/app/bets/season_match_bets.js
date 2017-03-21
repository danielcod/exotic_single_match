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
		team: [],
		versus: []
	    },
	    bet: deepCopy(this.props.bet)
	};
    },
    fetchTeams: function() {
	var handler=this.initOptionsHandler("team");
	this.props.exoticsApi.fetchTeams(handler);
    },
    sortTeams: function(item0, item1) {
	if (item0.name < item1.name) {
	    return -1;
	} else if (item0.name > item1.name) {
	    return 1;
	} else {
	    return 0;
	}
    },
    formatTeamOptions: function(teams) {
	return teams.sort(this.sortTeams).map(function(team) {
	    return {
		label: team.name+" ("+team.league+")",
		value: team.league+"/"+team.name
	    }
	});
    },
    fetchVersus: function() {
	var handler=this.initOptionsHandler("versus");
	this.props.exoticsApi.fetchBlob("smb_versus", handler);
    },
    filterVersus: function(teams, teamname) {
	return teams.filter(function(team) {
	    return (team.name==teamname) && (team.versus!=teamname);
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
	    return (versus.name==teamname) && (versus.versus==versusname);
	});
	return versus.length!=0;
    },
    teamChangeHandler: function(name, value) {
	var tokens=value.split("/");
	var leaguename=tokens[0];
	var teamname=tokens[1];
	var state=this.state;
	state.bet.league=leaguename;
	state.bet.team=teamname;
	this.setState(state);
	// this.props.changeHandler(state.bet);
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
	this.fetchTeams();
	this.fetchVersus();
	this.updatePrice(this.state.bet); 
    },
    componentDidMount: function() {
	this.initialise();
    },
    render: function() {
	return React.createElement(GridLayout, {
	    rows: [
		React.createElement(MySelect, {
		    label: "Team",
		    name: "team",
		    options: this.formatTeamOptions(this.state.options.team),
		    value: this.state.bet.league+"/"+this.state.bet.team,
		    changeHandler: this.teamChangeHandler,
		    blankStyle: this.props.blankStyle
		}),
		React.createElement(MySelect, {
		    label: "Versus",
		    name: "versus",
		    options: this.formatTeamOptions(this.state.options.team),
		    value: this.state.bet.league+"/"+this.state.bet.team,
		    changeHandler: this.teamChangeHandler,
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



