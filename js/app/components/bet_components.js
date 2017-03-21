var LeagueTeamSelectorRow=React.createClass({
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
	    },
	    league: this.props.league,
	    team: this.props.team
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
    fetchTeams: function() {
	var handler=this.initOptionsHandler("team");
	this.props.exoticsApi.fetchTeams(handler);
    },
    filterTeams: function(teams, leaguename) {
	return teams.filter(function(team) {
	    return team.league==leaguename;
	})
    },
    formatTeamOptions: function(teams) {
	return teams.map(function(team) {
	    return {
		value: team.team
	    }
	});
    },
    changeHandler: function(name, value) {
	if (this.state[name]!=value) {
	    var state=this.state;
	    state[name]=value;
	    if (name=="league") {
		state.team=undefined;
	    }
	    this.setState(state);
	    this.props.changeHandler(name, value);
	}
    },
    initialise: function() {
	this.fetchLeagues();
	this.fetchTeams();
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
		    children: React.createElement(
			MySelect, {
			    label: "League",
			    name: "league",
			    options: this.formatLeagueOptions(this.state.options.league),
			    value: this.state.league,
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
			    options: this.formatTeamOptions(this.filterTeams(this.state.options.team, this.state.league)),
			    value: this.state.team,
			    changeHandler: this.changeHandler,
			    blankStyle: this.props.blankStyle
			})
		})
	    ]
	})
    }
});

var ExpirySelector=React.createClass({
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
		expiry: []
	    },
	    expiry: this.props.expiry
	};
    },
    fetchExpiries: function() {
	var handler=this.initOptionsHandler("expiry");
	this.props.exoticsApi.fetchExpiries(handler);
    },
    formatExpiryOptions: function(expiries) {
	return expiries; // expiries come with label, value fields
    },
    changeHandler: function(name, value) {
	if (this.state[name]!=value) {
	    var state=this.state;
	    state[name]=value;
	    this.setState(state);
	    this.props.changeHandler(name, value);
	}
    },
    initialise: function() {
	this.fetchExpiries();
    },
    componentDidMount: function() {
	this.initialise();
    },
    render: function() {
	return React.createElement(MySelect, {
	    label: "At",
	    name: "expiry",
	    options: this.formatExpiryOptions(this.state.options.expiry),
	    value: this.state.expiry,
	    changeHandler: this.changeHandler,
	    blankStyle: this.props.blankStyle
	});
    }
});
