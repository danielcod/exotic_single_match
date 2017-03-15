var MiniLeagueRow=React.createClass({
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
	    params: deepCopy(this.props.params)
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
    fetchTeams: function(params) {
	if (params.league!=undefined) {
	    var handler=this.initOptionsHandler("team");
	    this.props.exoticsApi.fetchTeams(params.league, handler);
	}
    },
    formatTeamOptions: function(teams) {
	return teams.map(function(team) {
	    return {
		value: team.name
	    }
	});
    },
    changeHandler: function(name, value) {
	if (this.state.params[name]!=value) {
	    var state=this.state;
	    state.params[name]=value;
	    if (name=="league") {
		state.options.team=[];
		state.params.team=undefined;
		this.fetchTeams(state.params);
	    }
	    this.setState(state);
	    this.props.changeHandler(this.props.params.id, name, value);
	}
    },
    deleteHandler: function() {
	if (!this.props.params.disabled) {
	    this.props.deleteHandler(this.props.params.id);
	}
    },
    initialise: function() {
	this.fetchLeagues();
	this.fetchTeams(this.state.params);
    },
    componentWillReceiveProps: function(nextProps) {
	if (JSON.stringify(this.state.params)!=
	    JSON.stringify(nextProps.params)) {
	    var state=this.state;
	    state.params=deepCopy(nextProps.params);
	    this.fetchTeams(state.params);
	    this.setState(state);
	}
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
			"padding-top": "12px",
			"padding-bottom": "0px"
		    },
		    children: React.createElement(
			MySelect, {
			    name: "league",
			    options: this.formatLeagueOptions(this.state.options.league),
			    value: this.state.params.league,
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
			    options: this.formatTeamOptions(this.state.options.team),
			    value: this.state.params.team,
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
			className: "btn btn-"+(this.props.params.disabled ? "default" : "secondary"),
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

var MiniLeagueForm=React.createClass({
    itemUuid: function() {
	return Math.round(Math.random()*1e16);
    },
    initParams: function(params) {
	for (var i=0; i < params.items.length; i++) {
	    var item=params.items[i];
	    item.id=this.itemUuid();
	    item.disabled=(i==0);
	}
	return params;
    },
    getInitialState: function() {
	return {
	    params: {
		items: []
	    }
	}
    },
    changeHandler: function(id, name, value) {
	var state=this.state;
	var updated=false;
	for (var i=0; i < state.params.items.length; i++) {
	    var item=state.params.items[i];
	    if ((item.id==id) &&
		(item[name]!=value)) {
		item[name]=value;
		updated=true;
	    }
	}
	if (updated) {
	    this.setState(state);
	}
    },
    deleteHandler: function(id) {
	var state=this.state;
	var items=state.params.items.filter(function(item) {
	    return item.id!=id;
	});
	state.params.items=items;
	this.setState(state);
    },
    addHandler: function() {
	var state=this.state;
	state.params.items.push({
	    id: this.itemUuid(),
	    disabled: false
	});
	this.setState(state);
    },
    componentDidMount: function() {
	var params={
	    items: [
		{
		    league: "ENG.1",
		    team: "Arsenal"
		},
		{
		    league: "SPA.1",
		    team: "Barcelona"
		}
	    ]
	};
	var state=this.state;
	state.params=this.initParams(params);
	this.setState(state);
    },
    render: function() {	
	return React.DOM.div({
	    children: [
		React.DOM.div({		    
		    className: "row",
		    children: React.DOM.div({
			className: "col-xs-12",
			children: React.DOM.a({
			    className: "btn btn-sm btn-primary pull-right",
			    children: "Add Team",
			    onClick: this.addHandler
			})
		    })
		}),
		React.DOM.div({
		    className: "row",
		    children: React.DOM.div({
			className: "col-xs-12",
			children: React.DOM.table({
			    className: "table",
			    style: {
				margin: "0px",
				padding: "0px"
			    },
			    children: [
				React.DOM.thead({
				    children: React.DOM.tr({
					children: [
					    React.DOM.th({
						children: "League"
					    }),
					    React.DOM.th({
						children: "Team"
					    }),
					    React.DOM.th({
						children: []
					    })
					]
				    })
				}),		
				React.DOM.tbody({
				    children: this.state.params.items.map(function(params) {
					return React.createElement(MiniLeagueRow, {
					    params: params,
					    exoticsApi: this.props.exoticsApi,
					    blankStyle: this.props.blankStyle,
					    changeHandler: this.changeHandler,
					    deleteHandler: this.deleteHandler
					});
				    }.bind(this))
				})
			    ]
			})
		    })					    
		})
	    ]
	});
    }
});
