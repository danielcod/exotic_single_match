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
    getInitialState: function() {
	return {
	    selection: this.props.selection
	};
    },
    deleteHandler: function() {
	this.props.deleteHandler(this.props.selection.id);
    },
    componentWillReceiveProps: function(nextProps) {
	if (JSON.stringify(this.state.selection)!=
	    JSON.stringify(nextProps.selection)) {
	    var state=this.state;
	    state.selection=nextProps.selection;
	    this.setState(state);
	}
    },
    render: function() {
	return React.DOM.tr({
	    children: [
		React.DOM.td({
		    children: this.state.selection.name
		}),		
		React.DOM.td({
		    children: React.DOM.a({
			className: "btn btn-secondary",
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

var BetSelectionTable=React.createClass({
    uuid: function() {
	return Math.round(Math.random()*1e16);
    },
    initSelections: function(selections) {
	for (var i=0; i < selections.length; i++) {
	    var selection=selections[i];
	    selection.id=this.uuid();
	}
	return selections;
    },
    getInitialState: function() {
	return {
	    selections: this.initSelections(this.props.selections)
	}
    },
    deleteHandler: function(id) {
	if (this.state.selections.length > 1) {
	    var state=this.state;
	    var selections=state.selections.filter(function(selection) {
		return selection.id!=id;
	    });
	    state.selections=selections;
	    this.setState(state);
	    this.props.changeHandler(state.selections);
	}
    },    
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
			children: this.state.selections.map(function(selection) {
			    return React.createElement(BetSelectionRow, {
				selectorClass: this.props.selectorClass,
				selection: selection,
				exoticsApi: this.props.exoticsApi,
				deleteHandler: this.deleteHandler
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
	    nSelections: 10,
	    counter: 0
	}
    },
    handleIncrement: function() {
	var state=this.state;
	if (state.counter < state.nSelections-1) {
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
			children: (1+this.state.counter)+" team"+((this.state.counter==0) ? '' : 's')+" out of "+this.state.nSelections
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
			    label: "Your Selections"
			},
			{
			    name: "matches",
			    label: "Team Selector"
			}
		    ],
		    selected: this.state.selectedTab,
		    clickHandler: function(tab) {
			var state=this.state;
			state.selectedTab=tab.name;
			this.setState(state);
		    }.bind(this)
		}),
		(this.state.selectedTab=="bet") ? [
		    React.createElement(BetSelectionTable, {
			selections: this.state.bet.selections,
			exoticsApi: this.props.exoticsApi,
			changeHandler: function(selections) {
			    console.log(JSON.stringify(selections));
			}.bind(this),
			label: "Selections"
		    }),
		    React.createElement(MySelect, {
			label: "Condition",
			name: "teams_condition",
			value: this.state.bet.teams_condition,
			changeHandler: function(name, value) {
			    console.log(name+"="+value);
			},
			options: BetConditions,
			defaultOption: {
			    label: "Select"
			}
		    }),
		    React.createElement(BetNSelectionsToggle, {
		    })
		]: [],
		(this.state.selectedTab=="matches") ? React.createElement(MatchTeamSelectionPanel, {
		    matches: this.state.matches,
		    clickHandler: function(match, attr) {
			var state=this.state;
			state.bet.selections.push(match);
			this.setState(state);
		    }.bind(this),
		    paginator: {
			rows: 8
		    }
		}) : undefined
	    ]
	})
    }
});

