var ExoticAccaTabs=React.createClass({
    render: function() {
	return React.DOM.ul({
	    className: "nav nav-tabs",
	    children: this.props.tabs.map(function(tab) {
		return React.DOM.li({
		    className: (tab.name==this.props.selected) ? "active" : "",
		    onClick: this.props.clickHandler.bind(null, tab),
		    children: React.DOM.a({
			children: tab.label
		    })
		});				    
	    }.bind(this))
	});
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


var ExoticAccaNTeamsSlider=React.createClass({
    componentDidMount: function() {
	var initSliderTicks=function() {
	    var ticks=[];
	    for (var i=this.props.min; i <= this.props.max; i++) {
		ticks.push(i);
	    }
	    return ticks;
	}.bind(this);
	$('#slider').slider({
	    ticks: initSliderTicks(),
	    formatter: function(value) {
		return value;
	    },
	}).on("change", function(event, ui) {
	    // console.log(
	    var value=parseInt($("#slider").data("slider").getValue());
	    this.props.changeHandler("n_teams", value);
	}.bind(this));	
    },
    render: function() {
	return React.DOM.div({
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
			"data-slider-min": this.props.min,
			"data-slider-max": this.props.max,
			"data-slider-step": 1
		    })
		})
	    ]
	})	
    }
});

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
	    bet: this.initBet(this.props.bet),
	    slider: {
		min: 1
	    },
	    selectedTab: "bet"
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
    changeHandler: function(name, value) {
	console.log(name+"="+value); // TEMP
	if (this.state.bet.params[name]!=value) {
	    var state=this.state;
	    if (name=="n_teams") {
		state.bet.params[name]=parseInt(value);
	    } else {
		state.bet.params[name]=value;
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
    },
    render: function() {
	return React.createElement(ExoticAccaGridLayout, {
	    rows: [
		React.createElement(ExoticAccaTabs, {
		    tabs: [
			{
			    name: "bet",
			    label: "Bet"
			},
			{
			    name: "matches",
			    label: "Matches"
			}
		    ],
		    selected: this.state.selectedTab,
		    clickHandler: function(tab) {
			var state=this.state;
			state.selectedTab=tab.name;
			this.setState(state);
		    }.bind(this)
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
		React.createElement(ExoticAccaNTeamsSlider, {
		    min: this.state.slider.min,
		    max: this.state.bet.params.teams.length,
		    changeHandler: this.changeHandler
		})
	    ]
	})
    }
});



