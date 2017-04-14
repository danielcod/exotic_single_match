var ResultSelector=React.createClass({
    getInitialState: function() {
	return {
	    options: {
		result: [
		    {
			label: "To Win",
			value: "win"
		    },
		    {
			label: "To Draw",
			value: "draw"
		    },
		    {
			label: "To Lose",
			value: "lose"
		    }
		]
	    },
	    result: this.props.result
	};
    },    
    changeHandler: function(name, value) {
	if (this.state[name]!=value) {
	    var state=this.state;
	    state[name]=value;
	    this.setState(state);
	    this.props.changeHandler(name, value);
	}
    },
    render: function() {
	return React.createElement(MySelect, {
	    changeHandler: this.changeHandler,
	    options: this.state.options.result,
	    value: this.state.result,
	    // pass thru attributes
	    blankStyle: this.props.blankStyle,
	    className: this.props.className,
	    defaultOption: this.props.defaultOption,	    
	    label: this.props.label || "Result",
	    name: this.props.name || "result"
	});
    }
});


var ConditionSelector=React.createClass({
    getInitialState: function() {
	return {
	    options: {
		condition: [
		    {
			label: "More Than",
			value: ">"
		    },
		    {
			label: "At Least",
			value: ">="
		    },
		    {
			label: "Exactly",
			value: "="
		    },
		    {
			label: "Less Than",
			value: "<"
		    },
		    {
			label: "At Most",
			value: "<="
		    }
		]
	    },
	    condition: this.props.condition
	};
    },    
    changeHandler: function(name, value) {
	if (this.state[name]!=value) {
	    var state=this.state;
	    state[name]=value;
	    this.setState(state);
	    this.props.changeHandler(name, value);
	}
    },
    render: function() {
	return React.createElement(MySelect, {
	    changeHandler: this.changeHandler,
	    options: this.state.options.condition,
	    value: this.state.condition,
	    // pass thru attributes
	    blankStyle: this.props.blankStyle,
	    className: this.props.className,
	    defaultOption: this.props.defaultOption,	    
	    label: this.props.label || "Condition",
	    name: this.props.name || "condition"
	});
    }
});

var ExoticAccaForm=React.createClass({
    initOptionsHandler: function(name) {
	return function(struct) {
	    var state=this.state;
	    state.options[name]=struct;
	    this.setState(state);	
	}.bind(this);
    },
    initBet: function(bet) {
	if (bet.params.teams==undefined) {
	    bet.params.teams=[];
	}
	return bet;
    },
    getInitialState: function() {
	return {
	    bet: this.initBet(this.props.bet)
	};
    },
    teamsChangeHandler: function(items) {
	var state=this.state;
	var teams=items.map(function(item) {
	    return {
		league: item.league,
		team: item.team,
		versus: item.versus,
		match: item.match,
		home_away: item.home_away
	    };
	}.bind(this));
	state.bet.params.teams=teams;
	if ((state.bet.params.n_teams!=undefined) &&
	    (state.bet.params.n_teams > teams.length)) {
	    state.bet.params.n_teams=undefined;
	}
	this.setState(state);
	this.updatePrice(this.state.bet);
    },
    initNTeamsOptions: function(teams, condition) {
	var options=[];
	for (var i=0; i < teams.length+1; i++) {
	    if ((i==teams.length) &&
		((condition==">") || (condition==">="))) {
		continue;
	    }
	    if ((i==0) &&
		((condition=="<") || (condition=="<="))) {
		continue;
	    }
	    var suffix=(i==1) ? "Team" : "Teams";
	    var option={
		label: i+" "+suffix,
		value: i
	    };
	    options.push(option);
	}
	return options;
    },
    initNGoalsOptions: function(n, result) {
	var options=[];
	for (var i=0; i < n+1; i++) {	    	    
	    if ((i==0) && (result!="draw")) {
		continue;
	    }
	    var suffix=(i==1) ? "Goal" : "Goals";
	    var option={
		label: i+" "+suffix,
		value: i
	    }
	    options.push(option);
	}
	return options;
    },
    changeHandler: function(name, value) {
	if (this.state.bet.params[name]!=value) {
	    var state=this.state;
	    if ((name=="n_teams") ||
		(name=="n_goals")) {
		state.bet.params[name]=parseInt(value);
	    } else {
		state.bet.params[name]=value;
	    }
	    // don't finesse resets; there are too many options, just blank out dependant fields
	    if (name=="teams_condition") {
		state.bet.params.n_teams=undefined;
	    }
	    if (name=="result") {
		state.bet.params.goals_condition=undefined;
		state.bet.params.n_goals=undefined;
	    }
	    if (name=="goals_condition") {
		state.bet.params.n_goals=undefined;
	    }
	    this.setState(state);
	    this.updatePrice(this.state.bet);
	}
    },
    isComplete: function(bet) {
	// check scalar fields
	if ((bet.params.teams_condition==undefined) ||
	    (bet.params.n_teams==undefined) ||
	    (bet.params.result==undefined) ||
	    (bet.params.goals_condition==undefined) || 
	    (bet.params.n_goals==undefined)) {
	    return false;
	}
	// check undefined teams fields
	for (var i=0; i < bet.params.teams.length; i++) {
	    var item=bet.params.teams[i];
	    if ((item.league==undefined) ||
		(item.team==undefined)) {
		return false;
	    }
	}
	// check unique team names
	var teamnames=[];	
	for (var i=0; i < bet.params.teams.length; i++) {
	    var item=bet.params.teams[i];
	    if (teamnames.indexOf(item.team)==-1) {
		teamnames.push(item.team);
	    }
	}
	if (teamnames.length!=(bet.params.teams.length)) {
	    return false
	}
	return true;
    },
    updatePrice: function(bet) {
	if (this.isComplete(bet)) {
	    this.props.updatePriceHandler(bet)
	} else {
	    this.props.resetPriceHandler();
	}
    },
    componentDidMount: function() {
	this.updatePrice(this.state.bet); 
    },
    render: function() {
	return React.createElement(GridLayout, {
	    rows: [
		React.createElement(SelectorTable, {
		    selectorClass: MatchTeamSelector,
		    items: this.state.bet.params.teams,
		    exoticsApi: this.props.exoticsApi,
		    blankStyle: this.props.blankStyle,
		    changeHandler: this.teamsChangeHandler,
		    label: "Teams",
		    addLabel: "Add Team",
		    defaultOption: {
			label: "Select"
		    }
		}),
		[
		    React.createElement(ConditionSelector, {
			label: "Teams Condition",
			name: "teams_condition",
			condition: this.state.bet.params.teams_condition,
			changeHandler: this.changeHandler,
			blankStyle: this.props.blankStyle,
			defaultOption: {
			    label: "Select"
			}
		    }),
		    React.createElement(MySelect, {
			label: "Number of Teams",
			name: "n_teams",
			options: this.initNTeamsOptions(this.state.bet.params.teams, this.state.bet.params.teams_condition),
			value: this.state.bet.params.n_teams,
			changeHandler: this.changeHandler,
			blankStyle: this.props.blankStyle,
			defaultOption: {
			    label: "Select"
			}
		    })
		],
		React.createElement(ResultSelector, {
		    result: this.state.bet.params.result,
		    changeHandler: this.changeHandler,
		    blankStyle: this.props.blankStyle,
		    defaultOption: {
			label: "Select"
		    }
		}),
		[
		    React.createElement(ConditionSelector, {
			label: "Goals Condition",
			name: "goals_condition",
			condition: this.state.bet.params.goals_condition,
			changeHandler: this.changeHandler,
			blankStyle: this.props.blankStyle,
			defaultOption: {
			    label: "Select"
			}
		    }),
		    React.createElement(MySelect, {
			label: "Number of Goals",
			name: "n_goals",
			options: this.initNGoalsOptions(10, this.state.bet.params.result),
			value: this.state.bet.params.n_goals,
			changeHandler: this.changeHandler,
			blankStyle: this.props.blankStyle,
			defaultOption: {
			    label: "Select"
			}
		    })
		]
	    ]
	})
    }
});



