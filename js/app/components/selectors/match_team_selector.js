var MatchTeamSelector=React.createClass({
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
	    item: this.props.item
	};
    },
    fetchTeams: function() {
	var handler=this.initOptionsHandler("team");
	this.props.exoticsApi.fetchBlob("app/match_teams", handler);
    },
    sortTeams: function(item0, item1) {
	var value0=item0.team+"/"+item0.kickoff;
	var value1=item1.team+"/"+item1.kickoff;
	if (value0 < value1) {
	    return -1;
	} else if (value0 > value1) {
	    return 1;
	} else {
	    return 0;
	}
    },
    formatTeamLabel: function(team) {
	if ((team.league==undefined) ||
	    (team.team==undefined) ||
	    (team.versus==undefined) ||
	    (team.home_away==undefined)) {
	    return undefined;
	} else {
	    // return team.team+" (vs "+team.versus+" :: "+team.league+") ["+team.kickoff+"]";
	    return team.team+" (vs "+team.versus+")";
	}
    },
    formatTeamValue: function(team) {
	if ((team.league==undefined) ||
	    (team.team==undefined) ||
	    (team.versus==undefined) ||
	    (team.home_away==undefined)) {
	    return undefined;
	} else {
	    return team.league+"/"+team.team+"/"+team.versus+"/"+team.home_away;
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
	var state=this.state;
	state.item.league=tokens[0];
	state.item.team=tokens[1];
	state.item.versus=tokens[2];
	state.item.home_away=tokens[3];
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
	    changeHandler: this.changeHandler,
	    options: this.formatTeamOptions(this.state.options.team),
	    value: this.formatTeamValue(this.state.item),
	    // pass thru attributes
	    blankStyle: this.props.blankStyle,
	    className: this.props.className,
	    defaultOption: this.props.defaultOption,
	    label: this.props.label,
	    name: this.props.name || "team"
	});
    }
});
