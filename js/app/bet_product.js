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
		    children: this.props.selection.name
		}),		
		React.DOM.td({
		    children: React.DOM.a({
			className: "btn btn-secondary",
			children: React.DOM.i({
			    className: "glyphicon glyphicon-remove"
			})
		    })
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
				selectorClass: this.props.selectorClass,
				selection: selection,
				exoticsApi: this.props.exoticsApi
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
			    className: "glyphicon glyphicon-arrow-down"
			}),
			onClick: this.handleDecrement
		    })
		}),
		React.DOM.li({
		    children: React.DOM.h4({
			children: (1+this.state.counter)+" team"+((this.state.counter==0) ? '' : 's')+" out of "+this.props.nSelections
		    })
		}),
		React.DOM.li({
		    children: React.DOM.a({
			className: "btn btn-secondary",
			children: React.DOM.i({
			    className: "glyphicon glyphicon-arrow-up"
			}),
			onClick: this.handleIncrement
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
    handleBetAttrChanged: function(name, value) {
	console.log(name+"="+value);
    },
    handleMatchSelected: function(match, attr) {
	var state=this.state;
	state.bet.selections.push(match);
	this.setState(state);
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
		(this.state.selectedTab=="bet") ? [
		    React.createElement(BetSelectionTable, {
			selections: this.state.bet.selections,
			exoticsApi: this.props.exoticsApi,
			label: "Selections"
		    }),
		    React.DOM.div({
			style: {
			    "margin-left": "30px",
			    "margin-right": "30px"
			},
			children: React.createElement(MySelect, {
			    label: "Condition",
			    name: "teams_condition",
			    value: this.state.bet.teams_condition,
			    changeHandler: this.handleBetAttrChanged,
			    options: BetConditions,
			    defaultOption: {
				label: "Select"
			    }
			})
		    }),
		    React.createElement(BetNSelectionsToggle, {
			nSelections: this.state.bet.selections.length
		    })
		]: [],
		(this.state.selectedTab=="matches") ? React.createElement(MatchTeamSelectionPanel, {
		    matches: this.state.matches,
		    clickHandler: this.handleMatchSelected,
		    paginator: {
			rows: 8
		    }
		}) : undefined
	    ]
	})
    }
});

