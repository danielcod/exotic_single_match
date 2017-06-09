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

var ExoticAccaSelectionRow=React.createClass({
    getInitialState: function() {
	return {
	    item: this.props.item
	};
    },
    deleteHandler: function() {
	this.props.deleteHandler(this.props.item.id);
    },
    componentWillReceiveProps: function(nextProps) {
	if (JSON.stringify(this.state.item)!=
	    JSON.stringify(nextProps.item)) {
	    var state=this.state;
	    state.item=nextProps.item;
	    this.setState(state);
	}
    },
    render: function() {
	return React.DOM.tr({
	    children: [
		React.DOM.td({
		    children: this.state.item.team+" (vs "+this.state.item.versus+")"
		}),		
		React.DOM.td({
		    children: React.DOM.a({
			className: "btn btn-secondary",
			children: React.DOM.i({
			    className: "glyphicon glyphicon-remove"
			}),
			onClick: this.deleteHandler
		    })
		})
	    ]
	})				    
    }
});

var ExoticAccaSelectionTable=React.createClass({
    uuid: function() {
	return Math.round(Math.random()*1e16);
    },
    initItems: function(items) {
	if (items.length==0) {
	    items.push({});
	}
	for (var i=0; i < items.length; i++) {
	    var item=items[i];
	    item.id=this.uuid();
	}
	return items;
    },
    getInitialState: function() {
	return {
	    items: this.initItems(this.props.items)
	}
    },
    deleteHandler: function(id) {
	if (this.state.items.length > 1) {
	    var state=this.state;
	    var items=state.items.filter(function(item) {
		return item.id!=id;
	    });
	    state.items=items;
	    this.setState(state);
	    this.props.changeHandler(state.items);
	}
    },    
    render: function() {
	return React.DOM.div({
	    className: "form-group",
	    children: [
		React.DOM.label({
		    children: this.props.label
		}),
		React.DOM.table({
		    className: "table",
		    style: {
			"margin-top": "0px",
			"margin-bottom": "0px"
		    },
		    children: React.DOM.tbody({
			children: this.state.items.map(function(item) {
			    return React.createElement(ExoticAccaSelectionRow, {
				selectorClass: this.props.selectorClass,
				item: item,
				exoticsApi: this.props.exoticsApi,
				deleteHandler: this.deleteHandler
			    });
			}.bind(this))
		    })
		})
	    ]
	});		
    }
});

var ExoticAccaConditionSelector=React.createClass({
    getInitialState: function() {
	return {
	    options: [
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
	};
    },    
    render: function() {
	return React.createElement(MySelect, {
	    changeHandler: this.props.changeHandler,
	    options: this.state.options,
	    value: this.props.value,
	    // pass thru attributes
	    blankStyle: this.props.blankStyle,
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
	console.log(name+" -> "+value);
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
	this.updatePrice(this.state.bet);
    },
    render: function() {
	return React.DOM.div({
	    children: [
		React.createElement(ExoticAccaTabs, {
		    tabs: [
			{
			    name: "bet",
			    label: "Your Selections"
			},
			{
			    name: "matches",
			    label: "Team Selector"
			}
		    ],
		    selected: this.state.selectedTab,
		    clickHandler: function(tab) {
			var state=this.state;
			state.selectedTab=tab.name;
			this.setState(state);
		    }.bind(this)
		}),
		(this.state.selectedTab=="bet") ? React.createElement(ExoticAccaSelectionTable, {
			items: this.state.bet.params.teams,
			exoticsApi: this.props.exoticsApi,
			changeHandler: this.teamsChangeHandler,
			label: "Teams"
		}) : undefined,
		(this.state.selectedTab=="matches") ? React.DOM.h1({
		    className: "text-center",
		    style: {
			"margin-top": "10px",
			"margin-bottom": "20px"
		    },
		    children: "[Team Selector]"
		}) : undefined,
		React.createElement(ExoticAccaConditionSelector, {
		    label: "Teams Condition",
		    name: "teams_condition",
		    value: this.state.bet.params.teams_condition,
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



