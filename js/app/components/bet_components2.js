var TeamSelector=React.createClass({
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
	this.props.exoticsApi.fetchTeams(handler);
    },
    sortTeams: function(item0, item1) {
	if (item0.team < item1.team) {
	    return -1;
	} else if (item0.team > item1.team) {
	    return 1;
	} else {
	    return 0;
	}
    },
    formatTeamOptions: function(teams) {
	return teams.sort(this.sortTeams).map(function(team) {
	    return {
		label: team.team+" ("+team.league+")",
		value: team.league+"/"+team.team
	    }
	});
    },
    changeHandler: function(name, value) {
	var tokens=value.split("/");
	var leaguename=tokens[0];
	var teamname=tokens[1];
	var state=this.state;
	state.item.league=leaguename;
	state.item.team=teamname;
	this.setState(state);
	this.props.changeHandler(state.item);
    },
    initialise: function() {
	this.fetchTeams();
    },
    componentDidMount: function() {
	this.initialise();
    },
    render: function() {
	return React.createElement(
	    MySelect, {
		label: "Team",
		name: "team",
		options: this.formatTeamOptions(this.state.options.team),
		value: this.state.item.league+"/"+this.state.item.team,
		changeHandler: this.changeHandler,
		blankStyle: this.props.blankStyle
	    }
	);
    }
});

var TeamSelectorRow=React.createClass({
    getInitialState: function() {
	return {
	    item: deepCopy(this.props.item)
	};
    },
    changeHandler: function(struct) {
	if ((this.state.item.league!=struct.league) ||
	    (this.state.item.team!=struct.team)) {
	    var state=this.state;
	    state.item.league=struct.league;
	    state.item.team=struct.team;
	    this.setState(state);
	    this.props.changeHandler(this.props.item.id, struct);
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
		    children: React.createElement(TeamSelector, {
			exoticsApi: this.props.exoticsApi,
			item: {
			    league: this.state.item.league,
			    team: this.state.item.team
			},
			changeHandler: this.changeHandler,
			blankStyle: this.props.blankStyle
		    })
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

var LeagueTeamTable=React.createClass({
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
    changeHandler: function(id, struct) {
	var state=this.state;
	for (var i=0; i < state.items.length; i++) {
	    var item=state.items[i];
	    if (item.id==id) {
		item.league=struct.league;
		item.team=struct.team;
	    }
	}
	this.setState(state);
	this.props.changeHandler(state.items);
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
