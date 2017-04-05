var ExoticAccaForm=React.createClass({
    initOptionsHandler: function(name) {
	return function(struct) {
	    var state=this.state;
	    state.options[name]=struct;
	    this.setState(state);	
	}.bind(this);
    },
    initBet: function(bet) {
	if (bet.teams==undefined) {
	    bet.teams=[];
	}
	return bet;
    },
    getInitialState: function() {
	return {
	    options: {
		teamsCondition: [
		    {
			label: "More Than",
			value: ">"
		    },
		    {
			label: "Exactly",
			value: "="
		    },
		    {
			label: "Less Than",
			value: "<"
		    }
		],
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
		],
		goalsCondition: {
		    win: [
			{
			    label: "By More Than",
			    value: ">"
			},
			{
			    label: "By Exactly",
			    value: "="
			},
			{
			    label: "By Less Than",
			    value: "<"
			}
		    ],
		    draw: [
			{
			    label: "With Exactly",
			    value: "="
			}
		    ]
		}
	    },
	    bet: this.initBet(this.props.bet)
	};
    },
    teamsChangeHandler: function(items) {
	var state=this.state;
	var teams=items.map(function(item) {
	    return {
		league: item.league,
		team: item.team
	    };
	});
	state.bet.teams=teams;
	if ((state.bet.nTeams!=undefined) &&
	    (state.bet.nTeams > teams.length)) {
	    state.bet.nTeams=undefined;
	}
	this.setState(state);
	this.updatePrice(this.state.bet);
    },
    initNTeamsOptions: function(teams, condition) {
	var options=[];
	for (var i=0; i < teams.length; i++) {
	    if ((condition==">") && (i==(teams.length-1))) {
		continue;
	    }
	    if ((condition=="<") && (i==0)) {
		continue;
	    }
	    var suffix=(i==0) ? "Team" : "Teams";
	    var option={
		label: (i+1)+" "+suffix,
		value: i+1
	    };
	    options.push(option);
	}
	return options;
    },
    initGoalsConditionOptions: function(result) {
	if (result=="draw") {
	    return this.state.options.goalsCondition.draw;	    
	} else {
	    return this.state.options.goalsCondition.win;
	}
    },
    initNGoalsOptions: function(n, condition) {
	var options=[];
	for (var i=0; i < n+1; i++) {
	    if ((condition==">") && (i==n)) {
		continue;
	    }
	    if ((condition=="<") && (i==0)) {
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
	if (this.state.bet[name]!=value) {
	    var state=this.state;
	    state.bet[name]=value;
	    if (name=="result") {
		state.bet.goalsCondition=undefined;
	    }
	    this.setState(state);
	    this.updatePrice(this.state.bet);
	}
    },
    isComplete: function(bet) {
	return false;
    },
    updatePrice: function(bet) {
	if (this.isComplete(bet)) {
	    this.props.updatePriceHandler("mini_league", bet)
	} else {
	    this.props.resetPriceHandler();
	}
    },
    initialise: function() {
	this.updatePrice(this.state.bet); 
    },
    componentDidMount: function() {
	this.initialise();
    },
    render: function() {
	return React.createElement(GridLayout, {
	    rows: [
		React.createElement(SelectorTable, {
		    selectorClass: MatchTeamSelector,
		    items: this.state.bet.teams,
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
		    React.createElement(MySelect, {
			label: "Teams Condition",
			name: "teamsCondition",
			options: this.state.options.teamsCondition,
			value: this.state.bet.teamsCondition,
			changeHandler: this.changeHandler,
			blankStyle: this.props.blankStyle,
			defaultOption: {
			    label: "Select"
			}
		    }),
		    React.createElement(MySelect, {
			label: "Number of Teams",
			name: "nTeams",
			options: this.initNTeamsOptions(this.state.bet.teams, this.state.bet.teamsCondition),
			value: this.state.bet.nTeams,
			changeHandler: this.changeHandler,
			blankStyle: this.props.blankStyle,
			defaultOption: {
			    label: "Select"
			}
		    })
		],
		React.createElement(MySelect, {
		    label: "Result",
		    name: "result",
		    options: this.state.options.result,
		    value: this.state.bet.result,
		    changeHandler: this.changeHandler,
		    blankStyle: this.props.blankStyle,
		    defaultOption: {
			label: "Select"
		    }
		}),		
		[
		    React.createElement(MySelect, {
			label: "Goals Condition",
			name: "goalsCondition",
			options: this.initGoalsConditionOptions(this.state.bet.result),
			value: this.state.bet.goalsCondition,
			changeHandler: this.changeHandler,
			blankStyle: this.props.blankStyle,
			defaultOption: {
			    label: "Select"
			}
		    }),		
		    React.createElement(MySelect, {
			label: "Number of Goals",
			name: "nGoals",
			options: this.initNGoalsOptions(10, this.state.bet.goalsCondition),
			value: this.state.bet.nGoals,
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



