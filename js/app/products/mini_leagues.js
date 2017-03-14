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
			    blankStyle: this.props.blankStyle,
			    changeHandler: function(name, value) {
				console.log(name+"="+value);
			    }
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
			    blankStyle: this.props.blankStyle,
			    changeHandler: function(name, value) {
				console.log(name+"="+value);
			    }
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
			className: "btn btn-secondary",
			children: React.DOM.i({
			    className: "glyphicon glyphicon-remove"
			}),
			onClick: function() {
			    console.log("Delete row");
			}
		    })
		})
	    ]
	})				    
    }
});

var MiniLeagueForm=React.createClass({
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
			    onClick: function() {
				console.log("Add team")
			    }
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
				    children: [
					React.createElement(MiniLeagueRow, {
					    exoticsApi: this.props.exoticsApi,
					    blankStyle: this.props.blankStyle
					}),
					React.createElement(MiniLeagueRow, {
					    exoticsApi: this.props.exoticsApi,
					    blankStyle: this.props.blankStyle
					})
				    ]
				})
			    ]
			})
		    })					    
		})
	    ]
	});
    }
});
