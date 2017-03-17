var MiniLeagueVersusRow=React.createClass({
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
	    bet: deepCopy(this.props.bet)
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
    fetchTeams: function(bet) {
	if (bet.league!=undefined) {
	    var handler=this.initOptionsHandler("team");
	    this.props.exoticsApi.fetchTeams(bet.league, handler);
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
	if (this.state.bet[name]!=value) {
	    var state=this.state;
	    state.bet[name]=value;
	    if (name=="league") {
		state.options.team=[];
		state.bet.team=undefined;
		this.fetchTeams(state.bet);
	    }
	    this.setState(state);
	    this.props.changeHandler(this.props.bet.id, name, value);
	}
    },
    addHandler: function() {
	this.props.addHandler(this.props.bet.id);
    },
    deleteHandler: function() {
	if (!this.props.bet.disabled) {
	    this.props.deleteHandler(this.props.bet.id);
	}
    },
    componentWillReceiveProps: function(nextProps) {
	if (JSON.stringify(this.state.bet)!=
	    JSON.stringify(nextProps.bet)) {
	    var state=this.state;
	    state.bet=deepCopy(nextProps.bet);
	    this.fetchTeams(state.bet);
	    this.setState(state);
	}
    },
    initialise: function() {
	this.fetchLeagues();
	this.fetchTeams(this.state.bet);
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
			    value: this.state.bet.league,
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
			    value: this.state.bet.team,
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
			className: "btn btn-"+(this.props.bet.disabled ? "default" : "secondary"),
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
    initParams: function(bet) {
	if (bet.versus==undefined) {
	    bet.versus=[{}, {}]; // two rows by default
	}
	for (var i=0; i < bet.versus.length; i++) {
	    var item=bet.versus[i];
	    item.id=this.itemUuid();
	    item.disabled=(i==0);
	}
	return bet;
    },
    getInitialState: function() {
	return {
	    bet: this.initParams(deepCopy(this.props.bet))
	}
    },
    addHandler: function(id) { // id currently not used
	var state=this.state;
	var versus=[]
	for (var i=0; i < state.bet.versus.length; i++) {
	    var item=state.bet.versus[i];
	    versus.push(item);
	    if (item.id==id) {
		versus.push({
		    id: this.itemUuid(),
		    disabled: false
		});
	    }
	}
	state.bet.versus=versus;
	this.setState(state);
	this.updatePrice(state.bet);
    },
    changeHandler: function(id, name, value) {
	var state=this.state;
	var updated=false;
	for (var i=0; i < state.bet.versus.length; i++) {
	    var item=state.bet.versus[i];
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
	    this.updatePrice(state.bet);
	}
    },
    deleteHandler: function(id) {
	var state=this.state;
	var versus=state.bet.versus.filter(function(item) {
	    return item.id!=id;
	});
	state.bet.versus=versus;
	this.setState(state);
	this.updatePrice(state.bet);
    },
    isComplete: function(bet) {
	// check min length
	if (bet.versus.length < 2) {
	    return false;
	}
	// check undefined fields
	for (var i=0; i < bet.versus.length; i++) {
	    var item=bet.versus[i];
	    if ((item.league==undefined) ||
		(item.team==undefined)) {
		return false;
	    }
	}
	// check unique team names
	var teamnames=[];
	for (var i=0; i < bet.versus.length; i++) {
	    var item=bet.versus[i];
	    if (teamnames.indexOf(item.team)==-1) {
		teamnames.push(item.team);
	    }
	}
	if (teamnames.length!=bet.versus.length) {
	    return false
	}
	return true;
    },
    priceHandler: function(struct) {
	$("span[id='price']").text(struct["price"]);
    },
    updatePrice: function(bet) {
	if (this.isComplete(bet)) {
	    $("span[id='price']").text("[updating ..]");
	    var struct={
		"type": "mini_league",
		"bet": bet
	    };
	    this.props.exoticsApi.fetchPrice(struct, this.priceHandler);
	    this.props.changeHandler(struct);
	} else {
	    $("span[id='price']").text("[..]");
	    this.props.changeHandler(undefined);
	}
    },
    initialise: function() {
	this.updatePrice(this.state.bet); 
    },
    componentDidMount: function() {
	this.initialise();
    },
    render: function() {	
	return React.DOM.div({
	    children: [
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
						children: []
					    }),
					    React.DOM.th({
						className: "text-center",
						colSpan: 2,
						children: "Versus"
					    }),
					    React.DOM.th({
						children: []
					    })
					]
				    })
				}),		
				React.DOM.tbody({
				    children: this.state.bet.versus.map(function(bet) {
					return React.createElement(MiniLeagueVersusRow, {
					    bet: bet,
					    exoticsApi: this.props.exoticsApi,
					    blankStyle: this.props.blankStyle,
					    addHandler: this.addHandler,
					    changeHandler: this.changeHandler,
					    deleteHandler: this.deleteHandler,

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
