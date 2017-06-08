var ExoticAccaGridLayout=React.createClass({
    initItem: function(item, colwidth) {
	return React.DOM.div({
	    className: "col-xs-"+colwidth,
	    children: item
	});
    },
    initRow: function(row) {
	var colwidth=12/row.length;
	return React.DOM.div({
	    className: "row",
	    children: Array.isArray(row) ? row.map(function(item) {		
		return this.initItem(item, colwidth)
	    }.bind(this)) : this.initItem(row, 12)
	});
    },
    render: function() {
	return React.DOM.div({
	    children: this.props.rows.map(function(row) {
		return this.initRow(row);
	    }.bind(this))
	})
    }
});

var ExoticAccaConditionSelector=React.createClass({
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
	if (bet.params.result==undefined) {
	    bet.params.result="win"; // TEMP
	}
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
    changeHandler: function(name, value) {
	if (this.state.bet.params[name]!=value) {
	    var state=this.state;
	    if (name=="n_teams") {
		state.bet.params[name]=parseInt(value);
	    } else {
		state.bet.params[name]=value;
	    }
	    // don't finesse resets; there are too many options, just blank out dependant fields
	    if (name=="teams_condition") {
		state.bet.params.n_teams=undefined;
	    }
	    this.setState(state);
	    this.updatePrice(this.state.bet);
	}
    },
    isComplete: function(bet) {
	// check scalar fields
	if ((bet.params.teams_condition==undefined) ||
	    (bet.params.n_teams==undefined)) {
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
	// update price
	this.updatePrice(this.state.bet);
	// configure slider
	$('#slider').slider({
	    ticks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
	    formatter: function(value) {
		return value;
	    },
	}).on("change", function(event, ui) {
	    console.log($("#slider").data("slider").getValue());
	});	
    },
    render: function() {
	return React.createElement(ExoticAccaGridLayout, {
	    rows: [
		React.DOM.ul({
		    className: "nav nav-tabs",
		    children: [
			React.DOM.li({
			    className: "active",
			    children: React.DOM.a({
				children: "Bet"
			    })
			}),
			React.DOM.li({
			    children: React.DOM.a({
				children: "Matches"
			    })
			})
		    ]		    
		}),
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
		React.createElement(ExoticAccaConditionSelector, {
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
		}),
		React.DOM.div({
		    className: "form-group",
		    children: [
			React.DOM.label({
			    children: "Number of Teams"
			}),
			React.DOM.div({
			    style: {
				"margin-left": "10px",
				"margin-right": "10px"
			    },
			    children: React.DOM.input({
				style: {
				    width: "100%"
				},
				id: "slider",
				type: "text",
				"data-slider-id": 'ex1Slider',
				"data-slider-min": 1,
				"data-slider-max": 5,
				"data-slider-step": 1,
				"data-slider-value": 2
			    })
			})
		    ]
		})
	    ]
	})
    }
});



