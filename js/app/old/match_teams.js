var MatchTeamToggleCell=React.createClass({
    render: function() {
	return React.DOM.td({
	    style: {
		"background-color": (this.props.selected ? "#ec644b" : ""),
	    },
	    children: this.props.value,
	    onClick: this.props.clickHandler
	});
    }
});

/*
  price display currently commented out because not enough width in window; need to use team short codes for this to work
*/

var MatchTeamRow=React.createClass({
    getInitialState: function() {
	return {
	    teamnames: this.props.match.name.split(" vs "),
	    selected: {
		home: this.props.match.selected=="home",
		away: this.props.match.selected=="away"
	    }
	}
    },
    formatDescription: function(match, homeAway) {
	var teamnames=match.name.split(" vs ");
	var teamname, versus;
	if (homeAway=="home") {
	    teamname=teamnames[0];
	    versus=teamnames[1];
	} else {
	    teamname=teamnames[1];
	    versus=teamnames[0];
	}
	return teamname+" (vs "+versus+")";
    },
    formatPrice: function(value) {
	if (value < 2) {
	    // return value.toFixed(3);
	    return value.toFixed(2);
	} else if (value < 10) {
	    return value.toFixed(2);
	} else if (value < 100) {
	    return value.toFixed(1);
	} else {
	    return Math.floor(value);
	}
    },
    handleCellClicked: function(homeAway) {	
	// update state
	var state=this.state;
	state.selected[homeAway]=!state.selected[homeAway];
	var altHomeAway=(homeAway=="home") ? "away" : "home";
	if (state.selected[altHomeAway]) {
	    state.selected[altHomeAway]=false;
	}
	this.setState(state);
	// pass leg
	var leg={
	    match: this.props.match,
	    selection: {
		team: this.props.match.name.split(" vs ")[(homeAway=="home") ? 0 : 1],
		homeAway: homeAway,
	    },
	    description: this.formatDescription(this.props.match, homeAway),
	    price: this.props.match["1x2_prices"][(homeAway=="home") ? 0 : 2]
	};
	if (state.selected[homeAway]==true) {
	    this.props.clickHandler.add(leg);
	} else {
	    this.props.clickHandler.remove(leg);
	}
    },
    componentWillReceiveProps: function(nextProps) {
	if (nextProps.match.name!=this.props.match.name) {
	    var state=this.state;
	    state.teamnames=nextProps.match.name.split(" vs ");
	    state.selected={
		home: nextProps.match.selected=="home",
		away: nextProps.match.selected=="away"
	    }
	    this.setState(state);
	}
    },
    render: function() {
	return React.DOM.tr({
	    className: "text-center",
	    children: [
		React.DOM.td({
		    children: [
			React.DOM.span({
			    children: this.props.match.name
			}),
			React.DOM.br({}),
			React.createElement(DateTimeCell, {
			    value: this.props.match.kickoff,
			    type: "datetime"
			})
		    ]
		}),
		React.createElement(MatchTeamToggleCell, {
		    value: this.formatPrice(this.props.match["1x2_prices"][0]),
		    selected: this.state.selected.home,
		    clickHandler: function() {
			this.handleCellClicked("home")
		    }.bind(this)
		}),
		React.DOM.td({
		    children: React.DOM.span({
			// className: "text-muted",
			style: {
			    color: "#777"
			},
			children: this.formatPrice(this.props.match["1x2_prices"][1])
		    })
		}),
		React.createElement(MatchTeamToggleCell, {
		    value: this.formatPrice(this.props.match["1x2_prices"][2]),
		    selected: this.state.selected.away,
		    clickHandler: function() {
			this.handleCellClicked("away")
		    }.bind(this)
		})
	    ]
	});
    }
});

var MatchTeamTable=React.createClass({
    addLegState: function(matches, legs) {
	// initialise selected
	var selected={};
	for (var i=0; i < legs.length; i++) {
	    var leg=legs[i];
	    selected[leg.match.name]=leg.selection.homeAway;
	}
	// update selected params
	for (var i=0; i < matches.length; i++) {
	    var match=matches[i];
	    match.selected=selected[match.name];
	}
	return matches;
    },
    render: function() {
	return React.DOM.table({
	    className: "table table-condensed table-striped table-bordered",
	    children: [
		React.DOM.thead({
		    children: ["", "1", "X", "2"].map(function(label) {
			return React.DOM.th({
			    className: "text-center",
			    style: {
				"padding-bottom": "5px"
			    },
			    children: label
			})
		    })
		}),
		React.DOM.tbody({
		    children: this.addLegState(this.props.matches, this.props.legs).map(function(match) {
			return React.createElement(MatchTeamRow, {
			    match: match,
			    clickHandler: this.props.clickHandler
			})
		    }.bind(this))
		})
	    ]
	});
    }
});

var MatchTeamPanel=React.createClass({
    getInitialState: function() {
	return {
	    matches: [],
	    leagues: [],
	    league: undefined,
	    currentPage: 0
	}
    },
    handleLeagueChanged: function(name, value) {
	var state=this.state;
	state.league=value;
	state.currentPage=0; // NB
	this.setState(state);
    },
    applyPaginatorWindow: function(items) {
	var rows=this.props.paginator.rows;
	var i=this.state.currentPage*rows;
	var j=(this.state.currentPage+1)*rows;
	return items.slice(i, j);
    },
    handlePaginatorClicked: function(item) {
	var state=this.state;
	state.currentPage=item.value;
	this.setState(state);	
    },
    filterLeagues: function(matches) {
	var names=[];
	for (var i=0; i < matches.length; i++) {
	    var match=matches[i];
	    if (names.indexOf(match.league)==-1) {
		names.push(match.league);
	    }
	}
	return names.sort();
    },
    filterMatches: function(matches) {
	return matches.filter(function(match) {
	    return match.league==this.state.league;
	}.bind(this))
    },
    matchSorter: function(m0, m1) {	    
	if (m0.kickoff < m1.kickoff) {
	    return -1;
	} else if (m0.kickoff > m1.kickoff) {
	    return 1;
	} else {
	    if (m0.name < m1.name) {
		return -1
	    } else if (m0.name > m1.name) {
		return 1
	    } else {
		return 0;
	    }
	}
    },
    componentDidMount: function() {
	this.props.exoticsApi.fetchMatches(function(struct) {
	    var state=this.state;
	    var cutoff=new Date();
	    state.matches=struct.filter(function(match) {
		return new Date(match.kickoff) > cutoff;
	    }).sort(this.matchSorter);
	    state.leagues=this.filterLeagues(state.matches);
	    state.league=state.leagues[0];
	    this.setState(state);
	}.bind(this));	
    },
    render: function() {
	return React.DOM.div({
	    children: (this.state.league!=undefined)  ? [
		React.DOM.div({
		    style: {
			"margin-left": "100px",
			"margin-right": "100px"
		    },
		    children: React.createElement(MyFormComponent, {
			label: "League",
			component: React.createElement(MySelect, {
			    options: this.state.leagues.map(function(league) {
				return {
				    value: league
				};
			    }),
			    name: "league",
			    changeHandler: this.handleLeagueChanged
			})
		    })
		}),
		React.createElement(MatchTeamTable, {
		    matches: this.applyPaginatorWindow(this.filterMatches(this.state.matches)),
		    legs: this.props.legs,
		    clickHandler: this.props.clickHandler
		}),
		(this.filterMatches(this.state.matches).length > this.props.paginator.rows) ? React.createElement(MyPaginator, {
		    product: this.props.paginator,
		    data: this.state.matches.filter(function(match) {
			return match.league==this.state.league;
		    }.bind(this)),
		    clickHandler: this.handlePaginatorClicked,
		    currentPage: this.state.currentPage
		}) : undefined
	    ] : []
	});
    }
});
