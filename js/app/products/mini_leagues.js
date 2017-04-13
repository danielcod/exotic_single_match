var MiniLeagueForm=React.createClass({
    initOptionsHandler: function(name) {
	return function(struct) {
	    var state=this.state;
	    state.options[name]=struct;
	    this.setState(state);	
	}.bind(this);
    },
    initBet: function(bet) {
	if (bet.params.versus==undefined) {
	    bet.params.versus=[];
	}
	return bet;
    },
    getInitialState: function() {
	return {
	    options: {
		payoff: [
		    {
			value: "Winner"
		    },
		    {
			value: "Bottom"
		    }
		]
	    },
	    bet: this.initBet(this.props.bet)
	};
    },
    teamChangeHandler: function(struct) {
	if ((this.state.bet.params.league!=struct.league) ||
	    (this.state.bet.params.team!=struct.team)) {
	    var state=this.state;
	    state.bet.params.league=struct.league;
	    state.bet.params.team=struct.team;
	    this.setState(state);
	    this.updatePrice(this.state.bet);
	}
    },
    versusChangeHandler: function(items) {
	var state=this.state;
	state.bet.params.versus=items.map(function(item) {
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
	// check scalar fields
	if ((bet.params.league==undefined) ||
	    (bet.params.team==undefined) ||
	    (bet.params.payoff==undefined) ||
	    (bet.params.expiry==undefined)) {
	    return false;
	}
	// check undefined versus fields
	for (var i=0; i < bet.params.versus.length; i++) {
	    var item=bet.params.versus[i];
	    if ((item.league==undefined) ||
		(item.team==undefined)) {
		return false;
	    }
	}
	// check unique team names
	var teamnames=[bet.params.team];	
	for (var i=0; i < bet.params.versus.length; i++) {
	    var item=bet.params.versus[i];
	    if (teamnames.indexOf(item.team)==-1) {
		teamnames.push(item.team);
	    }
	}
	if (teamnames.length!=(bet.params.versus.length+1)) {
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
		React.createElement(SelectorTable, {
		    selectorClass: TeamSelector,
		    items: this.state.bet.params.versus,
		    exoticsApi: this.props.exoticsApi,
		    blankStyle: this.props.blankStyle,
		    changeHandler: this.versusChangeHandler,
		    label: "Versus",
		    addLabel: "Add Team",
		    defaultOption: {
			label: "Select"
		    }
		}),
		[
		    React.createElement(MySelect, {
			label: "Winner/Bottom",
			name: "payoff",
			options: this.state.options.payoff,
			value: this.state.bet.params.payoff,
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
	    ]
	})
    }
});



