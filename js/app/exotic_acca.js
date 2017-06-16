var AccaPanelTabs=React.createClass({
    render: function() {
	return React.DOM.ul({
	    className: "nav nav-tabs",
	    children: this.props.tabs.map(function(tab) {
		return React.DOM.li({
		    className: (tab.name==this.props.selected) ? "active" : "",
		    onClick: this.props.clickHandler.bind(null, tab),
		    children: React.DOM.a({
			children: (tab.color!=undefined) ? React.DOM.span({
			    className: "label label-"+tab.color,
			    children: tab.label
			}) : tab.label
		    })
		});			    
	    }.bind(this))
	});
    }
});

var AccaLegRow=React.createClass({
    render: function() {
	return React.DOM.tr({
	    children: [
		React.DOM.td({
		    children: React.createElement(DateTimeCell, {
			value: this.props.leg.match.kickoff
		    })
		}),
		React.DOM.td({
		    children: this.props.formatter(this.props.leg)
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
		    onClick: this.props.clickHandler.bind(null, this.props.leg)
		})
	    ]
	})				    
    }
});

var AccaLegTable=React.createClass({
    render: function() {
	return React.DOM.table({
	    className: "table table-condensed table-striped  text-center",
	    style: {
		"margin-top": "0px",
		"margin-bottom": "0px"
	    },
	    children: React.DOM.tbody({
		children: this.props.legs.map(function(leg) {
		    return React.createElement(AccaLegRow, {
			formatter: this.props.formatter,
			clickHandler: this.props.clickHandler,
			leg: leg
		    });
		}.bind(this))
	    })
	});
    }
});

var AccaNLegsToggle=React.createClass({
    getInitialState: function() {
	return {
	    counter: 1
	}
    },
    handleIncrement: function() {
	var state=this.state;
	if (state.counter < this.props.nLegs) {
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
    componentWillReceiveProps: function(nextProps) {
	var state=this.state;
	state.counter=Math.min(state.counter, nextProps.nLegs);
	this.setState(state);
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
			style: {
			    color: "#AAA"
			},
			children: this.state.counter+((this.state.counter < this.props.nLegs) ? "+" : "")+" (of "+this.props.nLegs+")"
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

var AccaNGoalsSlider=React.createClass({
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
		    labels.push("(Just Win)");
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

var AccaProductPanel=React.createClass({
    getInitialState: function() {
	return {
	    selectedTab: "bet",
	    legs: [],
	    bet: {
		legs: []
	    }
	}
    },
    handleTabClicked: function(tab) {
	var state=this.state;
	state.selectedTab=tab.name;
	this.setState(state);
    },
    handleLegAdded: function(leg) {
	var state=this.state;
	state.bet.legs=state.bet.legs.filter(function(sel) {
	    return sel.match.name!=leg.match.name;
	});
	state.bet.legs.push(leg);
	this.setState(state);
    },
    handleLegRemoved: function(leg) {
	var state=this.state;
	var formattedLeg=this.formatLeg(leg);
	state.bet.legs=state.bet.legs.filter(function(sel) {
	    return this.formatLeg(sel)!=formattedLeg;
	}.bind(this));
	this.setState(state);
    },
    formatLeg: function(leg) {
	var teamnames=leg.match.name.split(" vs ");
	var teamname, versus;
	if (leg.attr=="home") {
	    teamname=teamnames[0];
	    versus=teamnames[1];
	} else {
	    teamname=teamnames[1];
	    versus=teamnames[0];
	}
	return teamname+" (vs "+versus+")";
    },
    formatMatches: function(legs) {
	// initialise selected
	var selected={};
	for (var i=0; i < this.state.bet.legs.length; i++) {
	    var leg=this.state.bet.legs[i];
	    selected[leg.match.name]=leg.attr;
	}
	// update selected params
	var legs=JSON.parse(JSON.stringify(legs));
	for (var i=0; i < legs.length; i++) {
	    var match=legs[i];
	    match.selected=selected[match.name];
	}
	return legs;
    },
    sortLegs: function(legs) {
	var sortFn=function(i0, i1) {	    
	    if (i0.match.kickoff < i1.match.kickoff) {
		return -1;
	    } else if (i0.match.kickoff > i1.match.kickoff) {
		return 1;
	    } else {
		return 0;
	    }
	}
	return legs.sort(sortFn);
    },
    componentDidMount: function() {
	this.props.exoticsApi.fetchBlob("app/matches", function(struct) {
	    var state=this.state;
	    state.legs=struct;
	    this.setState(state);
	}.bind(this));	
    },
    render: function() {
	return React.DOM.div({
	    children: [
		React.createElement(AccaPanelTabs, {
		    tabs: [
			{
			    name: "bet",
			    label: "My Exotic Acca",
			    color: "teal"
			},
			{
			    name: "legs",
			    label: "Team Selector"
			}
		    ],
		    selected: this.state.selectedTab,
		    clickHandler: this.handleTabClicked
		}),
		(this.state.selectedTab=="bet") ? React.DOM.div({
		    children: (this.state.bet.legs.length!=0) ? [
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
			    component: React.createElement(AccaLegTable, {
				formatter: this.formatLeg,
				clickHandler: this.handleLegRemoved,
				legs: this.sortLegs(this.state.bet.legs),
				label: "Teams"
			    })
			}),
			React.createElement(MyFormComponent, {
			    label: "To Win By At Least",
			    component: React.createElement(AccaNGoalsSlider, {
				min: 1,
				max: 4,
				value: 1,
				changeHandler: function(name, value) {
				    console.log(name+"="+value);
				}
			    })
			}),
			React.createElement(MyFormComponent, {
			    label: "How many legs need to win ?",
			    component: React.createElement(AccaNLegsToggle, {
				nLegs: this.state.bet.legs.length
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
			children: "No legs added yet; use the Team Selector tab"
		    })
		}) : undefined,
		(this.state.selectedTab=="legs") ? React.createElement(MatchTeamPanel, {
		    matches: this.formatMatches(this.state.legs),
		    clickHandler: {
			add: this.handleLegAdded,
			remove: this.handleLegRemoved
		    },
		    paginator: {
			rows: 8
		    }
		}) : undefined
	    ]
	})
    }
});

