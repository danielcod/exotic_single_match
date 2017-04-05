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
		goalsCondition: [
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
		nGoals: [
		    {
			label: "0 Goals",
			value: 0
		    },
		    {
			label: "1 Goal",
			value: 1
		    },
		    {
			label: "2 Goals",
			value: 2
		    },
		    {
			label: "3 Goals",
			value: 3
		    },
		    {
			label: "4 Goals",
			value: 4
		    },
		    {
			label: "5 Goals",
			value: 5
		    }
		],
	    },
	    bet: this.initBet(this.props.bet)
	};
    },
    teamsChangeHandler: function(items) {
	var state=this.state;
	state.bet.teams=items.map(function(item) {
	    return {
		league: item.league,
		team: item.team
	    };
	});
	this.setState(state);
	this.updatePrice(this.state.bet);
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
			label: "Goals Condition",
			name: "goalsCondition",
			options: this.state.options.goalsCondition,
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
			options: this.state.options.nGoals,
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



