var BetConditions=[
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
];

var BetPanelTabs=React.createClass({
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

var BetSelectionRow=React.createClass({
    render: function() {
	return React.DOM.tr({
	    children: [
		React.DOM.td({
		    children: this.props.formatter(this.props.selection)
		}),		
		React.DOM.td({
		    children: React.DOM.a({
			className: "btn btn-secondary",
			children: React.DOM.i({
			    className: "glyphicon glyphicon-remove"
			})
		    }),
		    onClick: this.props.clickHandler.bind(null, this.props.selection)
		})
	    ]
	})				    
    }
});

var BetSelectionTable=React.createClass({
    render: function() {
	return React.DOM.div({
	    className: "form-group",
	    children: [
		React.DOM.label({
		    children: this.props.label
		}),
		React.DOM.table({
		    className: "table table-condensed table-striped",
		    style: {
			"margin-top": "0px",
			"margin-bottom": "0px"
		    },
		    children: React.DOM.tbody({
			children: this.props.selections.map(function(selection) {
			    return React.createElement(BetSelectionRow, {
				formatter: this.props.formatter,
				clickHandler: this.props.clickHandler,
				selection: selection
			    });
			}.bind(this))
		    })
		})
	    ]
	});		
    }
});

var BetNSelectionsToggle=React.createClass({
    getInitialState: function() {
	return {
	    counter: 0
	}
    },
    handleIncrement: function() {
	var state=this.state;
	if (state.counter < this.props.nSelections-1) {
	    state.counter+=1;
	    this.setState(state);
	}	
    },
    handleDecrement: function() {
	var state=this.state
	if (state.counter > 0) {
	    state.counter-=1;
	    this.setState(state);
	}
    },
    render: function() {
	return React.DOM.ul({
	    className: "list-inline text-center",
	    style: {
		"margin-bottom": "20px"
	    },
	    children: [
		React.DOM.li({
		    children: React.DOM.a({
			className: "btn btn-secondary",
			children: React.DOM.i({
			    className: "glyphicon glyphicon-arrow-up"
			}),
			onClick: this.handleIncrement
		    })
		}),
		React.DOM.li({
		    children: React.DOM.h4({
			className: "text-muted",
			children: (1+this.state.counter)+"/"+this.props.nSelections+" team"+((this.props.nSelections==1) ? '' : 's')
		    })
		}),
		React.DOM.li({
		    children: React.DOM.a({
			className: "btn btn-secondary",
			children: React.DOM.i({
			    className: "glyphicon glyphicon-arrow-down"
			}),
			onClick: this.handleDecrement
		    })
		})
	    ]
	});
    }
});

var BetProductPanel=React.createClass({
    getInitialState: function() {
	return {
	    selectedTab: "bet",
	    matches: [],
	    bet: {
		selections: []
	    }
	}
    },
    handleTabClicked: function(tab) {
	var state=this.state;
	state.selectedTab=tab.name;
	this.setState(state);
    },
    handleMatchSelected: function(selection) {
	var state=this.state;
	state.bet.selections=state.bet.selections.filter(function(sel) {
	    return sel.match.name!=selection.match.name;
	});
	state.bet.selections.push(selection);
	this.setState(state);
    },
    handleSelectionRemoved: function(selection) {
	var state=this.state;
	var formattedSelection=this.formatSelection(selection);
	state.bet.selections=state.bet.selections.filter(function(sel) {
	    return this.formatSelection(sel)!=formattedSelection;
	}.bind(this));
	this.setState(state);
    },
    formatSelection: function(selection) {
	var teamnames=selection.match.name.split(" vs ");
	var teamname, versus;
	if (selection.attr=="home") {
	    teamname=teamnames[0];
	    versus=teamnames[1];
	} else {
	    teamname=teamnames[1];
	    versus=teamnames[0];
	}
	return teamname+" (vs "+versus+")";
    },
    formatMatches: function(matches) {
	// initialise selected
	var selected={};
	for (var i=0; i < this.state.bet.selections.length; i++) {
	    var selection=this.state.bet.selections[i];
	    selected[selection.match.name]=selection.attr;
	}
	// update selected params
	var matches=JSON.parse(JSON.stringify(matches));
	for (var i=0; i < matches.length; i++) {
	    var match=matches[i];
	    match.selected=selected[match.name];
	}
	return matches;
    },
    componentDidMount: function() {
	this.props.exoticsApi.fetchBlob("app/matches", function(struct) {
	    var state=this.state;
	    state.matches=struct;
	    this.setState(state);
	}.bind(this));	
    },
    render: function() {
	return React.DOM.div({
	    children: [
		React.createElement(BetPanelTabs, {
		    tabs: [
			{
			    name: "bet",
			    label: "Your Bet"
			},
			{
			    name: "matches",
			    label: "Team Selector"
			}
		    ],
		    selected: this.state.selectedTab,
		    clickHandler: this.handleTabClicked
		}),
		(this.state.selectedTab=="bet") ? React.DOM.div({
		    children: (this.state.bet.selections.length!=0) ? [
			React.createElement(BetSelectionTable, {
			    formatter: this.formatSelection,
			    clickHandler: this.handleSelectionRemoved,
			    selections: this.state.bet.selections,
			    label: "Selections"
			}),
			React.createElement(MyLabelledSelect, {
			    label: "Condition",
			    name: "teams_condition",
			    changeHandler: function(name, value) {
				console.log(name+"="+value);
			    },
			    options: BetConditions
			}),
			React.createElement(BetNSelectionsToggle, {
			    nSelections: this.state.bet.selections.length
			}),
		    ] : React.DOM.h4({
			className: "text-center text-muted",
			style: {
			    "margin-left": "50px",
			    "margin-right": "50px"
			},
			children: "No selections made yet; use the Team Selector tab"
		    })
		}) : undefined,
		(this.state.selectedTab=="matches") ? React.createElement(MatchTeamSelectionPanel, {
		    matches: this.formatMatches(this.state.matches),
		    clickHandler: {
			add: this.handleMatchSelected,
			remove: this.handleSelectionRemoved
		    },
		    paginator: {
			rows: 8
		    }
		}) : undefined
	    ]
	})
    }
});

