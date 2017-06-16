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
		    children: React.createElement(DateTimeCell, {
			value: this.props.selection.match.kickoff
		    })
		}),
		React.DOM.td({
		    children: this.props.formatter(this.props.selection)
		}),
		React.DOM.td({
		    children: 4.56
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
	return React.DOM.table({
	    className: "table table-condensed table-striped  text-center",
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
	});
    }
});

var BetNSelectionsToggle=React.createClass({
    getInitialState: function() {
	return {
	    counter: 1
	}
    },
    handleIncrement: function() {
	var state=this.state;
	if (state.counter < this.props.nSelections) {
	    state.counter+=1;
	    this.setState(state);
	}	
    },
    handleDecrement: function() {
	var state=this.state
	if (state.counter > 1) {
	    state.counter-=1;
	    this.setState(state);
	}
    },
    render: function() {
	return React.DOM.ul({
	    className: "list-inline text-center",
	    children: [
		React.DOM.li({
		    children: React.DOM.a({
			className: "btn btn-secondary",
			children: React.DOM.i({
			    className: "glyphicon glyphicon-minus-sign"
			}),
			onClick: this.handleDecrement
		    })
		}),
		React.DOM.li({
		    children: React.DOM.h4({
			className: "text-muted",
			children: this.state.counter+((this.state.counter < this.props.nSelections) ? "+" : "")+" (of "+this.props.nSelections+")"
		    })
		}),
		React.DOM.li({
		    children: React.DOM.a({
			className: "btn btn-secondary",
			children: React.DOM.i({
			    className: "glyphicon glyphicon-plus-sign"
			}),
			onClick: this.handleIncrement
		    })
		})
	    ]
	});
    }
});

var BetNGoalsSlider=React.createClass({
    componentDidMount: function() {
	var initSliderTicks=function() {
	    var ticks=[];
	    for (var i=this.props.min; i <= this.props.max; i++) {
		ticks.push(i);
	    }
	    return ticks;
	}.bind(this);
	var initSliderTickLabels=function() {
	    var labels=[];
	    for (var i=this.props.min; i <= this.props.max; i++) {
		if (i==this.props.min) {
		    labels.push("Just Win");
		} else {
		    labels.push(i+"+ Goals");
		}
	    }
	    return labels;
	}.bind(this);
	$('#slider').slider({
	    ticks: initSliderTicks(),
	    ticks_labels: initSliderTickLabels(),
	    formatter: function(value) {
		return value+"+";
	    }
	}).on("change", function(event, ui) {
	    var value=parseInt($("#slider").data("slider").getValue());
	    this.props.changeHandler("n_teams", value);
	}.bind(this));	
    },
    render: function() {
	return React.DOM.div({
	    style: {
		"margin-left": "30px",
		"margin-right": "30px"
	    },
	    children: React.DOM.input({
		style: {
		    width: "100%"
		},
		id: "slider",
		type: "text",
		"data-slider-min": this.props.min,
		"data-slider-max": this.props.max,
		"data-slider-value": this.props.value,
		"data-slider-step": 1
	    })
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
    sortSelections: function(selections) {
	var sortFn=function(i0, i1) {	    
	    if (i0.match.kickoff < i1.match.kickoff) {
		return -1;
	    } else if (i0.match.kickoff > i1.match.kickoff) {
		return 1;
	    } else {
		return 0;
	    }
	}
	return selections.sort(sortFn);
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
			    label: "My Exotic Acca"
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
			React.DOM.div({
			    className: "form-group",
			    children: React.DOM.h3({
				className: "current-price text-center",
				children: [
				    "Current price: ",
				    React.DOM.span({
					id: "price",
					children: "1.23"
				    })					
				]				    
			    })
			}),
			React.createElement(MyFormComponent, {
			    label: "Teams",
			    component: React.createElement(BetSelectionTable, {
				formatter: this.formatSelection,
				clickHandler: this.handleSelectionRemoved,
				selections: this.sortSelections(this.state.bet.selections),
				label: "Teams"
			    })
			}),
			React.createElement(MyFormComponent, {
			    label: "To Win By At Least",
			    component: React.createElement(BetNGoalsSlider, {
				min: 1,
				max: 4,
				value: 1,
				changeHandler: function(name, value) {
				    console.log(name+"="+value);
				}
			    })
			}),
			React.createElement(MyFormComponent, {
			    label: "How many selections need to win ?",
			    component: React.createElement(BetNSelectionsToggle, {
				nSelections: this.state.bet.selections.length
			    })
			}),
			React.DOM.hr({
			    style: {
				"border-color": "#555"
			    }
			}),
			React.DOM.div({
			    className: "text-center",
			    style: {
				"margin-bottom": "20px"
			    },
			    children: React.DOM.button({
				className: "btn btn-primary",
				children: "Place Bet",
				onClick: function() {
				    console.log("[placebet]");
				}
			    })
			})
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

