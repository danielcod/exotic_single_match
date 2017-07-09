var AccaPanelTabs=React.createClass({
    render: function() {
	return React.DOM.ul({
	    className: "nav nav-tabs",
	    children: this.props.tabs.map(function(tab) {
		return React.DOM.li({
		    className: (tab.name==this.props.selected) ? "active" : "",
		    onClick: this.props.clickHandler.bind(null, tab),
		    children: React.DOM.a({
			children: [
			    tab.label,
			    (tab.name=="bet") ? React.DOM.span({
				className: "badge",
				style: {
				    "margin-left": "10px"
				},
				children: this.props.legs.length
			    }) : undefined
			]
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
		    children: this.props.leg.description
		}),
		React.DOM.td({
		    children: React.DOM.span({
			className: "text-muted",
			children: this.formatPrice(this.props.leg.price)
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
			children: this.props.textFormatter(this.props.nLegs, this.props.legs.length)
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
	var initSliderTicks=function(minval, maxval) {
	    var ticks=[];
	    for (var i=minval; i <= maxval; i++) {
		ticks.push(i);
	    }
	    return ticks;
	}.bind(this);
	$('#'+this.props.id).slider({
	    ticks: initSliderTicks(this.props.min, this.props.max),
	    ticks_labels: this.props.tickLabeller(this.props.min,
						  this.props.max)
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

/*
  nLegs is the state value for NLegsToggle
  nGoals is the state value for NGoalsSlider
*/

var AccaProductPanel=React.createClass({
    initNLegs: function(product) {
	var toggle=product.betLegsToggle;
	return toggle ? toggle.minVal : 1;
    },
    initNGoals: function(product) {
	var slider=product.betGoalsSlider;
	return slider ? slider.minVal : 0;
    },
    getInitialState: function() {
	return {
	    selectedTab: "bet",
	    legs: [],
	    nLegs: this.initNLegs(this.props.product),
	    nGoals: this.initNGoals(this.props.product),
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
	state.legs=state.legs.filter(function(leg) {
	    return leg.match.name!=newleg.match.name;
	});
	state.legs.push(newleg);
	this.setState(state);
	this.updatePrice();
    },
    handleLegRemoved: function(oldleg) {
	var state=this.state;
	state.legs=state.legs.filter(function(leg) {
	    return leg.description!=oldleg.description;
	});
	state.nLegs=Math.max(this.props.product.betLegsToggle.minVal, Math.min(state.nLegs, state.legs.length)); // NB
	this.setState(state);
	this.updatePrice();
    },
    handleGoalsSliderChanged: function(value) {
	var state=this.state;
	if (value!=state.nGoals) {
	    state.nGoals=value;
	    this.setState(state);
	    this.updatePrice();
	}
    },
    incrementNLegs: function() {
	var state=this.state;
	if (state.nLegs < state.legs.length) {
	    state.nLegs+=1;
	    this.setState(state);
	    this.updatePrice();
	}
    },
    decrementNLegs: function() {
	var state=this.state
	if (state.nLegs > 1) {
	    state.nLegs-=1;
	    this.setState(state);
	    this.updatePrice();
	}
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
	if (this.state.legs.length > 0) {
	    // blank price, set price request id
	    var state=this.state;
	    state.price=undefined;
	    var priceId=Math.round(Math.random()*1e10);
	    state.priceId=priceId;
	    this.setState(state);
	    // fetch new price
	    setTimeout(function() {
		var struct={
		    name: this.props.product.name,
		    legs: this.state.legs,
		    nLegs: this.state.nLegs,
		    nGoals: this.state.nGoals,
		    bust: Math.round(Math.random()*1e10)
		};
		this.props.exoticsApi.fetchPrice(struct, function(struct) {
		    var state=this.state;
		    if (state.priceId==priceId) {
			state.price=struct.price;
			this.setState(state);
		    }
		}.bind(this));
	    }.bind(this), 500);
	}
    },
    sortLegs: function(legs) {
	var sortFn=function(i0, i1) {	    
	    if (i0.match.kickoff < i1.match.kickoff) {
		return -1;
	    } else if (i0.match.kickoff > i1.match.kickoff) {
		return 1;
	    } else {
		if (i0.description < i1.description) {
		    return -1
		} else if (i0.description > i1.description) {
		    return 1
		} else {
		    return 0;
		}
	    }
	}.bind(this);
	return legs.sort(sortFn);
    },
    applyPaginatorWindow: function(items) {
	var rows=this.props.betLegsPaginator.rows;
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
		    clickHandler: this.handleTabClicked,
		    legs: this.state.legs
		}),
		(this.state.selectedTab=="bet") ? React.DOM.div({
		    children: (this.state.legs.length!=0) ? [
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
			    label: "Legs",
			    component: React.createElement(AccaLegTable, {
				clickHandler: this.handleLegRemoved,
				legs: this.applyPaginatorWindow(this.sortLegs(this.state.legs))
			    })
			}),
			(this.state.legs.length > this.props.betLegsPaginator.rows) ? React.createElement(MyPaginator, {
			    product: this.props.betLegsPaginator,
			    data: this.state.legs,
			    clickHandler: this.handlePaginatorClicked,
			    currentPage: this.state.currentPage
			}) : undefined,
			this.props.product.betGoalsSlider ? React.createElement(MyFormComponent, {
			    label: this.props.product.betGoalsSlider.label,
			    component: React.createElement(AccaNGoalsSlider, {
				id: "goalSlider",
				min: this.props.product.betGoalsSlider.minVal,
				max: this.props.product.betGoalsSlider.maxVal,
				tickLabeller: this.props.product.betGoalsSlider.tickLabeller,
				value: this.state.nGoals,
				changeHandler: this.handleGoalsSliderChanged,
				
			    })
			}) : undefined,
			this.props.product.betLegsToggle ? React.createElement(MyFormComponent, {
			    label: this.props.product.betLegsToggle.label,
			    component: React.createElement(AccaNLegsToggle, {
				textFormatter: this.props.product.betLegsToggle.textFormatter,
				nLegs: this.state.nLegs,
				legs: this.state.legs,
				clickHandlers: {
				    increment: this.incrementNLegs,
				    decrement: this.decrementNLegs
				}
			    })
			}) : undefined,
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
		(this.state.selectedTab=="legs") ? React.createElement(this.props.product.legsPanel, {
		    exoticsApi: this.props.exoticsApi,
		    legs: this.state.legs,
		    clickHandler: {
			add: this.handleLegAdded,
			remove: this.handleLegRemoved
		    },
		    paginator: this.props.legsPaginator
		}) : undefined
	    ]
	})
    }
});

