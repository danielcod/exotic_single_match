var MatchToggleCell=React.createClass({
    render: function() {
	return React.DOM.td({
	    children: this.props.selected ? React.DOM.span({
		className: "label label-red",
		children: React.DOM.b({
		    children: this.props.value
		})
	    }) : this.props.value,
	    onClick: this.props.clickHandler
	});
    }
});

var MatchRow=React.createClass({
    getInitialState: function() {
	return {
	    selected: false // NB needs to be changed to reflect leg match state
	}
    },
    handleCellClicked: function() {
	// update state
	var state=this.state;
	state.selected=!state.selected;
	this.setState(state);
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
    render: function() {
	return React.DOM.tr({
	    className: "text-center",
	    children: [
		React.DOM.td({
		    children: React.createElement(DateTimeCell, {
			value: this.props.match.kickoff,
			type: "datetime"
		    })
		}),
		React.createElement(MatchTeamToggleCell, {
		    value: this.props.match.name,
		    selected: this.state.selected,
		    clickHandler: this.handleCellClicked
		}),
		React.DOM.td({
		    children: React.DOM.span({
			className: "text-muted",
			children: this.formatPrice(this.props.match["1x2_prices"][1])
		    })
		}),
	    ]
	});
    }
});

var MatchTable=React.createClass({
    addLegState: function(matches, legs) {
	// add code to add selected values to matches
	return matches;
    },
    render: function() {
	return React.DOM.table({
	    className: "table table-condensed table-striped",
	    children: React.DOM.tbody({
		children: this.addLegState(this.props.matches, this.props.legs).map(function(match) {
		    return React.createElement(MatchRow, {
			match: match,
			clickHandler: this.props.clickHandler
		    })
		}.bind(this))
	    })
	});
    }
});

var MatchPanel=React.createClass({
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
		React.createElement(MatchTable, {
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

