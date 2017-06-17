var MatchTeamCell=React.createClass({
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
    handleCellClicked: function(attr) {	
	var state=this.state;
	state.selected[attr]=!state.selected[attr];
	var altAttr=(attr=="home") ? "away" : "home";
	if (state.selected[altAttr]) {
	    state.selected[altAttr]=false;
	}
	this.setState(state);
	if (state.selected[attr]==true) {
	    this.props.clickHandler.add({
		match: this.props.match,
		attr: attr
	    });
	} else {
	    this.props.clickHandler.remove({
		match: this.props.match,
		attr: attr
	    });
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
		    children: React.createElement(DateTimeCell, {
			value: this.props.match.kickoff,
			col: {
			    type: "datetime"
			}
		    })
		}),
		React.createElement(MatchTeamCell, {
		    value: this.state.teamnames[0],
		    selected: this.state.selected.home,
		    clickHandler: function() {
			this.handleCellClicked("home")
		    }.bind(this)
		}),
		React.DOM.td({
		    children: " vs "
		}),
		React.createElement(MatchTeamCell, {
		    value: this.state.teamnames[1],
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
    render: function() {
	return React.DOM.table({
	    className: "table table-condensed table-striped",
	    children: React.DOM.tbody({
		children: this.props.matches.map(function(match) {
		    return React.createElement(MatchTeamRow, {
			match: match,
			clickHandler: this.props.clickHandler
		    })
		}.bind(this))
	    })
	});
    }
});

var MatchTeamPanel=React.createClass({
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
    getInitialState: function() {
	return {
	    leagues: this.filterLeagues(this.props.matches),
	    league: this.filterLeagues(this.props.matches)[0],
	    currentPage: 0
	}
    },
    changeHandler: function(name, value) {
	console.log(name+"="+value);
	var state=this.state;
	state.league=value;
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
    render: function() {
	return React.DOM.div({
	    children: [
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
			    changeHandler: this.changeHandler
			})
		    })
		}),
		React.createElement(MatchTeamTable, {
		    matches: this.applyPaginatorWindow(this.props.matches.filter(function(match) {
			return match.league==this.state.league;
		    }.bind(this))),
		    clickHandler: this.props.clickHandler
		}),
		React.createElement(MyPaginator, {
		    config: this.props.paginator,
		    data: this.props.matches.filter(function(match) {
			return match.league==this.state.league;
		    }.bind(this)),
		    clickHandler: this.handlePaginatorClicked,
		    currentPage: this.state.currentPage
		})
	    ]
	});
    }
});

