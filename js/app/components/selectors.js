// NB any selectors which take an item and/or are used within the context of a table should be careful to pass items by value and not by reference

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
	    options: this.formatExpiryOptions(this.state.options.expiry),
	    value: this.state.expiry,
	    changeHandler: this.changeHandler,
	    blankStyle: this.props.blankStyle,
	    name: this.props.name || "expiry",
	    label: this.props.label || "At"
	});
    }
});

var TeamSelector=React.createClass({
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
	    },
	    item: JSON.parse(JSON.stringify(this.props.item)) // NB value not reference
	};
    },
    fetchTeams: function() {
	var handler=this.initOptionsHandler("team");
	this.props.exoticsApi.fetchTeams(handler);
    },
    sortTeams: function(item0, item1) {
	if (item0.team < item1.team) {
	    return -1;
	} else if (item0.team > item1.team) {
	    return 1;
	} else {
	    return 0;
	}
    },
    formatTeamLabel: function(team) {
	if ((team.league==undefined) ||
	    (team.team==undefined)) {
	    return undefined;
	} else {
	    return team.team+" ("+team.league+")";
	}
    },
    formatTeamValue: function(team) {
	if ((team.league==undefined) ||
	    (team.team==undefined)) {
	    return undefined;
	} else {
	    return team.league+"/"+team.team;
	}
    },    
    formatTeamOptions: function(teams) {
	return teams.sort(this.sortTeams).map(function(team) {
	    return {
		label: this.formatTeamLabel(team),
		value: this.formatTeamValue(team)
	    }
	}.bind(this));
    },
    changeHandler: function(name, value) {
	var tokens=value.split("/");
	var leaguename=tokens[0];
	var teamname=tokens[1];
	var state=this.state;
	state.item.league=leaguename;
	state.item.team=teamname;
	this.setState(state);
	this.props.changeHandler(state.item);
    },
    componentWillReceiveProps: function(nextProps) {
	if (JSON.stringify(this.state.item)!=
	    JSON.stringify(nextProps.item)) {
	    var state=this.state;
	    state.item=nextProps.item;
	    this.setState(state);
	}
    },
    initialise: function() {
	this.fetchTeams();
    },
    componentDidMount: function() {
	this.initialise();
    },
    render: function() {
	return React.createElement(MySelect, {
	    options: this.formatTeamOptions(this.state.options.team),
	    value: this.formatTeamValue(this.state.item),
	    changeHandler: this.changeHandler,
	    blankStyle: this.props.blankStyle,
	    label: this.props.label,
	    defaultLabel: this.props.defaultLabel,
	    className: this.props.className,
	    name: this.props.name || "team"
	});
    }
});

