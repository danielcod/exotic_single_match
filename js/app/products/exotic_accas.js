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

var ExoticAccaMatchTeamSelector=React.createClass({
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
	    (team.home_away==undefined) ||
	    (team.match==undefined)) {
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
	    (team.home_away==undefined) ||
	    (team.match==undefined)) {
	    return undefined;
	} else {
	    return team.league+"/"+team.team+"/"+team.versus+"/"+team.match+"/"+team.home_away;
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
	state.item.match=tokens[3];
	state.item.home_away=tokens[4];
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

var ExoticAccaSelectorRow=React.createClass({
    getInitialState: function() {
	return {
	    item: this.props.item
	};
    },
    changeHandler: function(struct) {
	var state=this.state;
	for (var attr in struct) {
	    if (struct[attr]!=state.item[attr]) {
		state.item[attr]=struct[attr]
	    }
	}
	this.setState(state);
	this.props.changeHandler(this.props.item.id, struct);
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
		    style: {
			"margin-left": "0px",
			"padding-left": "0px"
		    },
		    children: React.createElement(this.props.selectorClass, {
			exoticsApi: this.props.exoticsApi,
			item: this.state.item,
			changeHandler: this.changeHandler,
			blankStyle: this.props.blankStyle,
			defaultOption: this.props.defaultOption
		    })
		}),		
		React.DOM.td({
		    style: {
			"margin-right": "0px",
			"padding-right": "0px"
		    },
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

var ExoticAccaSelectorTable=React.createClass({
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
    addHandler: function() { 
	var state=this.state;
	var items=state.items;
	items.push({
	    id: this.uuid()
	});
	state.items=items;
	this.setState(state);
	this.props.changeHandler(state.items);
    },
    changeHandler: function(id, struct) {
	var state=this.state;
	for (var i=0; i < state.items.length; i++) {
	    var item=state.items[i];
	    if (item.id==id) {
		for (attr in struct) {
		    item[attr]=struct[attr];
		}
	    }
	}
	this.setState(state);
	this.props.changeHandler(state.items);
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
			    return React.createElement(ExoticAccaSelectorRow, {
				selectorClass: this.props.selectorClass,
				item: item,
				exoticsApi: this.props.exoticsApi,
				blankStyle: this.props.blankStyle,
				defaultOption: this.props.defaultOption,
				changeHandler: this.changeHandler,
				deleteHandler: this.deleteHandler
			    });
			}.bind(this))
		    })
		}),
		React.DOM.div({
		    className: "text-center",
		    children: React.DOM.a({
			className: "btn btn-secondary",
			style: {
			    "margin-top": "10px"
			},
			onClick: function() {
			    this.addHandler();
			}.bind(this),
			children: this.props.addLabel
		    })
		})
	    ]
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
	this.updatePrice(this.state.bet);
    },
    render: function() {
	return React.DOM.div({
	    children: [
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
		(this.state.selectedTab=="bet") ?React.createElement(ExoticAccaGridLayout, {
		    rows: [
			React.createElement(ExoticAccaSelectorTable, {
			    selectorClass: ExoticAccaMatchTeamSelector,
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
		}) : undefined,
		(this.state.selectedTab=="matches") ? React.DOM.h1({
		    className: "text-center",
		    style: {
			"margin-top": "10px",
			"margin-bottom": "10px"
		    },
		    children: "Hello World"
		}) : undefined
	    ]
	})
    }
});



