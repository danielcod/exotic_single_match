var LeagueTeamSelectorRow=React.createClass({
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
		league: [],
		team: [],
	    },
	    league: this.props.league,
	    team: this.props.team
	};
    },
    fetchLeagues: function() {
	var handler=this.initOptionsHandler("league");
	this.props.exoticsApi.fetchLeagues(handler);
    },
    formatLeagueOptions: function(leagues) {
	return leagues.map(function(league) {
	    return {
		value: league.name
	    }
	});
    },
    fetchTeams: function() {
	var handler=this.initOptionsHandler("team");
	this.props.exoticsApi.fetchTeams(handler);
    },
    filterTeams: function(teams, leaguename) {
	return teams.filter(function(team) {
	    return team.league==leaguename;
	})
    },
    formatTeamOptions: function(teams) {
	return teams.map(function(team) {
	    return {
		value: team.team
	    }
	});
    },
    changeHandler: function(name, value) {
	if (this.state[name]!=value) {
	    var state=this.state;
	    state[name]=value;
	    if (name=="league") {
		state.team=undefined;
	    }
	    this.setState(state);
	    this.props.changeHandler(name, value);
	}
    },
    initialise: function() {
	this.fetchLeagues();
	this.fetchTeams();
    },
    componentDidMount: function() {
	this.initialise();
    },
    render: function() {
	return React.DOM.div({
	    className: "row",
	    children: [
		React.DOM.div({
		    className: "col-xs-6",
		    children: React.createElement(
			MySelect, {
			    label: "League",
			    name: "league",
			    options: this.formatLeagueOptions(this.state.options.league),
			    value: this.state.league,
			    changeHandler: this.changeHandler,
			    blankStyle: this.props.blankStyle
			}),
		}),			
		React.DOM.div({
		    className: "col-xs-6",
		    children: React.createElement(
			MySelect, {
			    label: "Team",
			    name: "team",
			    options: this.formatTeamOptions(this.filterTeams(this.state.options.team, this.state.league)),
			    value: this.state.team,
			    changeHandler: this.changeHandler,
			    blankStyle: this.props.blankStyle
			})
		})
	    ]
	})
    }
});

var LeagueTeamSelectorTableRow=React.createClass({
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
		league: [],
		team: []
	    },
	    item: deepCopy(this.props.item)
	};
    },
    fetchLeagues: function() {
	var handler=this.initOptionsHandler("league");
	this.props.exoticsApi.fetchLeagues(handler);
    },
    formatLeagueOptions: function(leagues) {
	return leagues.map(function(league) {
	    return {
		value: league.name
	    }
	});
    },
    fetchTeams: function() {
	var handler=this.initOptionsHandler("team");
	this.props.exoticsApi.fetchTeams(handler);
    },
    filterTeams: function(teams, leaguename) {
	return teams.filter(function(team) {
	    return team.league==leaguename;
	})
    },
    formatTeamOptions: function(teams) {
	return teams.map(function(team) {
	    return {
		value: team.team
	    }
	});
    },
    changeHandler: function(name, value) {
	if (this.state.item[name]!=value) {
	    var state=this.state;
	    state.item[name]=value;
	    if (name=="league") {
		state.item.team=undefined;
	    }
	    this.setState(state);
	    this.props.changeHandler(this.props.item.id, name, value);
	}
    },
    addHandler: function() {
	this.props.addHandler(this.props.item.id);
    },
    deleteHandler: function() {
	if (!this.props.item.disabled) {
	    this.props.deleteHandler(this.props.item.id);
	}
    },
    componentWillReceiveProps: function(nextProps) {
	if (JSON.stringify(this.state.item)!=
	    JSON.stringify(nextProps.item)) {
	    var state=this.state;
	    state.item=deepCopy(nextProps.item);
	    this.setState(state);
	}
    },
    initialise: function() {
	this.fetchLeagues();
	this.fetchTeams();
    },
    componentDidMount: function() {
	this.initialise();
    },    
    render: function() {
	return React.DOM.tr({
	    children: [
		React.DOM.td({
		    style: {
		    	"margin-top": "0px",
			"margin-bottom": "0px",
			"padding-top": "0px",
			"padding-bottom": "0px"
		    },
		    children: React.DOM.a({
			className: "btn btn-secondary",
			children: React.DOM.i({
			    className: "glyphicon glyphicon-plus-sign"
			}),
			onClick: this.addHandler
		    })
		}),
		React.DOM.td({
		    style: {
		    	"margin-top": "0px",
			"margin-bottom": "0px",
			"padding-top": "12px",
			"padding-bottom": "0px"
		    },
		    children: React.createElement(
			MySelect, {
			    name: "league",
			    options: this.formatLeagueOptions(this.state.options.league),
			    value: this.state.item.league,
			    changeHandler: this.changeHandler,
			    blankStyle: this.props.blankStyle
			}
		    )
		}),		
		React.DOM.td({
		    style: {
		    	"margin-top": "0px",
			"margin-bottom": "0px",
			"padding-top": "12px",
			"padding-bottom": "0px"
		    },
		    children: React.createElement(
			MySelect, {
			    name: "team",
			    options: this.formatTeamOptions(this.filterTeams(this.state.options.team, this.state.item.league)),
			    value: this.state.item.team,
			    changeHandler: this.changeHandler,
			    blankStyle: this.props.blankStyle
			}
		    )
		}),
		React.DOM.td({
		    style: {
		    	"margin-top": "0px",
			"margin-bottom": "0px",
			"padding-top": "0px",
			"padding-bottom": "0px"
		    },
		    children: React.DOM.a({
			className: "btn btn-"+(this.props.item.disabled ? "default" : "secondary"),
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

var LeagueTeamSelectorTable=React.createClass({
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
	    item.disabled=(i==0);
	}
	return items;
    },
    getInitialState: function() {
	return {
	    items: this.initItems(deepCopy(this.props.items))
	}
    },
    addHandler: function(id) { // id currently not used
	var state=this.state;
	var items=[]
	for (var i=0; i < state.items.length; i++) {
	    var item=state.items[i];
	    items.push(item);
	    if (item.id==id) {
		items.push({
		    id: this.uuid(),
		    disabled: false
		});
	    }
	}
	state.items=items;
	this.setState(state);
	this.props.changeHandler(state.items);
    },
    changeHandler: function(id, name, value) {
	var state=this.state;
	var updated=false;
	for (var i=0; i < state.items.length; i++) {
	    var item=state.items[i];
	    if (item.id==id) {		
		if (item[name]!=value) {
		    item[name]=value;
		    if (name=="league") {
			item.team=undefined; // NB reset team
		    }
		    updated=true;
		}
	    }
	}
	if (updated) {
	    this.setState(state);
	    this.props.changeHandler(state.items);
	}
    },
    deleteHandler: function(id) {
	var state=this.state;
	var items=state.items.filter(function(item) {
	    return item.id!=id;
	});
	state.items=items;
	this.setState(state);
	this.props.changeHandler(state.items);
    },
    render: function() {
	return React.DOM.table({
	    className: "table",
	    children: React.DOM.tbody({
		children: this.state.items.map(function(item) {
		    return React.createElement(LeagueTeamSelectorTableRow, {
			item: item,
			exoticsApi: this.props.exoticsApi,
			blankStyle: this.props.blankStyle,
			addHandler: this.addHandler,
			changeHandler: this.changeHandler,
			deleteHandler: this.deleteHandler
		    });
		}.bind(this))
	    })
	});
    }
});
    
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
	    label: "At",
	    name: "expiry",
	    options: this.formatExpiryOptions(this.state.options.expiry),
	    value: this.state.expiry,
	    changeHandler: this.changeHandler,
	    blankStyle: this.props.blankStyle
	});
    }
});
