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
	    params: {}
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
	    this.props.changeHandler(this.props.item.id, name, value);
	}
    },
    deleteHandler: function() {
	if (!this.props.item.disabled) {
	    this.props.deleteHandler(this.props.item.id);
	}
    },
    initialise: function() {
	this.fetchLeagues();
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

var MiniLeagueForm=React.createClass({
    itemUuid: function() {
	return Math.round(Math.random()*1e16);
    },
    getInitialState: function() {
	return {
	    items: [
		{
		    id: this.itemUuid(),
		    disabled: true
		},
		{
		    id: this.itemUuid(),
		    disabled: false
		}
	    ]
	};
    },
    changeHandler: function(id, name, value) {
	console.log(id+" -> "+name+"="+value);
    },
    deleteHandler: function(id) {
	console.log(id+" deleted");
    },
    addHandler: function() {
	console.log("Row added");
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
				    children: this.state.items.map(function(item) {
					return React.createElement(MiniLeagueRow, {
					    item: item,
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
