var AccaPanelTabs=React.createClass({
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

var AccaLegRow=React.createClass({
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
	    children: [
		React.DOM.td({
		    children: React.createElement(DateTimeCell, {
			value: this.props.leg.match.kickoff,
			type: "datetime"
		    })
		}),
		React.DOM.td({
		    children: this.props.leg.selection.description
		}),
		React.DOM.td({
		    children: React.DOM.span({
			className: "text-muted",
			children: this.formatPrice(this.props.leg.selection.price)
		    })
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
			clickHandler: this.props.clickHandler,
			leg: leg
		    });
		}.bind(this))
	    })
	});
    }
});

var AccaNLegsToggle=React.createClass({
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
			onClick: this.props.clickHandlers.decrement
		    })
		}),
		React.DOM.li({
		    children: React.DOM.h4({
			className: "text-muted",
			style: {
			    color: "#AAA"
			},
			children: this.props.legCounter+((this.props.legCounter < this.props.nLegs) ? "+" : "")+" (of "+this.props.nLegs+")"
		    })
		}),
		React.DOM.li({
		    children: React.DOM.a({
			className: "btn btn-secondary",
			children: React.DOM.i({
			    className: "glyphicon glyphicon-plus-sign"
			}),
			onClick: this.props.clickHandlers.increment
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
	$('#'+this.props.id).slider({
	    ticks: initSliderTicks(),
	    ticks_labels: initSliderTickLabels()
	}).on("change", function(event, ui) {
	    var value=parseInt($("#"+this.props.id).data("slider").getValue());
	    this.props.changeHandler(value);
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
		id: this.props.id,
		type: "text",
		"data-slider-tooltip": "hide",
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
	    bet: {
		legs: []
	    },
	    legCounter: 1,
	    goalSlider: 1,
	    currentPage: 0
	}
    },
    handleTabClicked: function(tab) {
	var state=this.state;
	state.selectedTab=tab.name;
	this.setState(state);
    },
    handleLegAdded: function(newleg) {
	var state=this.state;
	state.bet.legs=state.bet.legs.filter(function(leg) {
	    return leg.match.name!=newleg.match.name;
	});
	state.bet.legs.push(newleg);
	this.setState(state);
	this.updatePrice();
    },
    handleLegRemoved: function(oldleg) {
	var state=this.state;
	state.bet.legs=state.bet.legs.filter(function(leg) {
	    return leg.selection.description!=oldleg.selection.description;
	});
	state.legCounter=Math.min(state.legCounter, state.bet.legs.length); // NB
	this.setState(state);
	this.updatePrice();
    },
    handleGoalsSliderChanged: function(value) {
	var state=this.state;
	state.goalSlider=value;
	this.setState(state);
	this.updatePrice();
    },
    incrementTeamsCounter: function() {
	var state=this.state;
	if (state.legCounter < state.bet.legs.length) {
	    state.legCounter+=1;
	    this.setState(state);
	}
	this.updatePrice();
    },
    decrementTeamsCounter: function() {
	var state=this.state
	if (state.legCounter > 1) {
	    state.legCounter-=1;
	    this.setState(state);
	}
	this.updatePrice();
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
    formatCurrentPrice: function(price) {
	if (price==undefined) {
	    return "[...]";
	} else {
	    return this.formatPrice(price);
	}
    },
    updatePrice: function() {
	var state=this.state;
	state.price=undefined;
	this.setState(state);
	setTimeout(function() {
	    state.price=1/(0.1+0.8*Math.random());
	    this.setState(state)
	}.bind(this), 500);
    },
    sortLegs: function(legs) {
	var sortFn=function(i0, i1) {	    
	    if (i0.match.kickoff < i1.match.kickoff) {
		return -1;
	    } else if (i0.match.kickoff > i1.match.kickoff) {
		return 1;
	    } else {
		if (i0.selection.description < i1.selection.description) {
		    return -1
		} else if (i0.selection.description > i1.selection.description) {
		    return 1
		} else {
		    return 0;
		}
	    }
	}.bind(this);
	return legs.sort(sortFn);
    },
    applyPaginatorWindow: function(items) {
	var rows=this.props.config.paginator.rows;
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
			"margin-top": "20px",
			"margin-left": "75px",
			"margin-right": "75px"
		    },
		    children: React.createElement(MyFormComponent, {
			label: "Product",			
			component: React.createElement(MySelect, {
			    className: "form-control btn-primary input-lg",
			    options: [
				{
				    value: "Exotic Acca"
				}
			    ],
			    name: "product",
			    changeHandler: function(name, value) {
				console.log(name+"="+value);
			    }
			})
		    })
		}),
		React.DOM.p({
		    className: "help-block",
		    children: React.DOM.i({
			children: "An Exotic Acca is like a traditional acca; but not all teams have to win for it to payout, so you don't have to select all the favourites; and you can add a goals condition to improve the price!"
		    })
		}),
		React.createElement(AccaPanelTabs, {
		    tabs: [
			{
			    name: "bet",
			    label: "My Bet"
			},
			{
			    name: "legs",
			    label: "Leg Selector"
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
					children: this.formatCurrentPrice(this.state.price)
				    })					
				]				    
			    })
			}),
			React.createElement(MyFormComponent, {
			    label: "Teams",
			    component: React.createElement(AccaLegTable, {
				clickHandler: this.handleLegRemoved,
				legs: this.applyPaginatorWindow(this.sortLegs(this.state.bet.legs)),
				label: "Teams"
			    })
			}),
			(this.state.bet.legs.length > this.props.config.paginator.rows) ? React.createElement(MyPaginator, {
			    config: this.props.config.paginator,
			    data: this.state.bet.legs,
			    clickHandler: this.handlePaginatorClicked,
			    currentPage: this.state.currentPage
			}) : undefined,
			React.createElement(MyFormComponent, {
			    label: "To Win By At Least",
			    component: React.createElement(AccaNGoalsSlider, {
				id: "goalSlider",
				min: 1,
				max: this.props.config.product.params.nGoalsMax,
				value: this.state.goalSlider,
				changeHandler: this.handleGoalsSliderChanged
			    })
			}),
			React.createElement(MyFormComponent, {
			    label: "How many legs need to win ?",
			    component: React.createElement(AccaNLegsToggle, {
				legCounter: this.state.legCounter,
				nLegs: this.state.bet.legs.length,
				clickHandlers: {
				    increment: this.incrementTeamsCounter,
				    decrement: this.decrementTeamsCounter
				}
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
				    console.log("placing bet");
				}
			    })
			})
		    ] : React.DOM.h4({
			className: "text-center text-muted",
			style: {
			    "margin-left": "50px",
			    "margin-right": "50px"
			},
			children: "Use the Leg Selector tab to add some selections"
		    })
		}) : undefined,
		(this.state.selectedTab=="legs") ? React.createElement(this.props.config.product.klass, {
		    exoticsApi: this.props.exoticsApi,
		    legs: this.state.bet.legs,
		    clickHandler: {
			add: this.handleLegAdded,
			remove: this.handleLegRemoved
		    },
		    paginator: this.props.config.paginator
		}) : undefined
	    ]
	})
    }
});

