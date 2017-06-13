var BrowseBetsProductSelector=React.createClass({
    initOptionsHandler: function(name) {
	return function(struct) {
	    var state=this.state;
	    state.options[name]=struct;
	    this.setState(state);	
	}.bind(this);
    },
    getInitialState: function() {
	return {
	    options: {
		product: []
	    },
	    product: this.props.product
	};
    },
    fetchProducts: function() {
	var handler=this.initOptionsHandler("product");
	this.props.exoticsApi.fetchProducts(handler);
    },
    sortProducts: function(item0, item1) {
	if (item0.type < item1.type) {
	    return -1;
	} else if (item0.type > item1.type) {
	    return 1;
	} else {
	    return 0;
	}
    },
    formatProductLabel: function(product) {
	if (product==undefined) {
	    return undefined;
	} else {
	    return product.label;
	}
    },
    formatProductValue: function(product) {
	if (product==undefined) {
	    return undefined;
	} else {
	    return product.type;
	}
    },
    formatProductOptions: function(products) {
	return products.sort(this.sortProducts).map(function(product) {
	    return {
		label: this.formatProductLabel(product),
		value: this.formatProductValue(product)
	    }
	}.bind(this));
    },
    changeHandler: function(name, value) {
	if (this.state[name]!=value) {
	    var state=this.state;
	    state[name]=value;
	    this.setState(state);
	    this.props.changeHandler(name, value);
	}
    },
    initialise: function() {
	this.fetchProducts();
    },
    componentDidMount: function() {
	this.initialise();
    },
    render: function() {
	return React.createElement(MySelect, {
	    changeHandler: this.changeHandler,
	    options: this.formatProductOptions(this.state.options.product),
	    value: this.formatProductValue(this.state.product),
	    // pass thru attributes
	    blankStyle: this.props.blankStyle,
	    className: this.props.className,
	    defaultOption: this.props.defaultOption,
	    label: this.props.label,
	    name: this.props.name || "product"
	});
    }
});


var BrowseBetsTeamSelector=React.createClass({
    initOptionsHandler: function(name) {
	return function(struct) {
	    var state=this.state;
	    state.options[name]=struct;
	    this.setState(state);	
	}.bind(this);
    },
    getInitialState: function() {
	return {
	    options: {
		team: [],
	    },
	    item: this.props.item
	};
    },
    fetchTeams: function() {
	var handler=this.initOptionsHandler("team");
	this.props.exoticsApi.fetchBlob("app/teams", handler);
    },
    sortTeams: function(item0, item1) {
	if (item0.team < item1.team) {
	    return -1;
	} else if (item0.team > item1.team) {
	    return 1;
	} else {
	    return 0;
	}
    },
    formatTeamLabel: function(team) {
	if ((team.league==undefined) ||
	    (team.team==undefined)) {
	    return undefined;
	} else {
	    return team.team+" ("+team.league+")";
	}
    },
    formatTeamValue: function(team) {
	if ((team.league==undefined) ||
	    (team.team==undefined)) {
	    return undefined;
	} else {
	    return team.league+"/"+team.team;
	}
    },    
    formatTeamOptions: function(teams) {
	return teams.sort(this.sortTeams).map(function(team) {
	    return {
		label: this.formatTeamLabel(team),
		value: this.formatTeamValue(team)
	    }
	}.bind(this));
    },
    changeHandler: function(name, value) {
	var tokens=value.split("/");
	var leaguename=tokens[0];
	var teamname=tokens[1];
	var state=this.state;
	state.item.league=leaguename;
	state.item.team=teamname;
	this.setState(state);
	this.props.changeHandler(state.item);
    },
    componentWillReceiveProps: function(nextProps) {
	if (JSON.stringify(this.state.item)!=
	    JSON.stringify(nextProps.item)) {
	    var state=this.state;
	    state.item=nextProps.item;
	    this.setState(state);
	}
    },
    initialise: function() {
	this.fetchTeams();
    },
    componentDidMount: function() {
	this.initialise();
    },
    render: function() {
	return React.createElement(MySelect, {
	    changeHandler: this.changeHandler,
	    options: this.formatTeamOptions(this.state.options.team),
	    value: this.formatTeamValue(this.state.item),
	    // pass thru attributes
	    blankStyle: this.props.blankStyle,
	    className: this.props.className,
	    defaultOption: this.props.defaultOption,
	    label: this.props.label,
	    name: this.props.name || "team"
	});
    }
});



var BrowseBetsInlineList=React.createClass({
    render: function() {
	return React.DOM.ul({
	    style: this.props.style || {},
	    className: "list-inline",
	    children: this.props.items.map(function(item) {
		return React.DOM.li({
		    className: item.right ? "pull-right" : undefined,
		    style: {
			width: item.width+"px"
		    },
		    children: item.item
		});
	    })
	});
    }
});

var BrowseBetsTabs=React.createClass({
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


var BrowseBetsRow=React.createClass({
    formatPrice: function(probability) {
	return (1/Math.min(0.99, Math.max(0.01, probability))).toFixed(2);
    },
    render: function() {
	return React.DOM.tr({
	    children: [
		React.DOM.td({
		    children: [
			React.DOM.h5({
			    children: [
				this.props.bet.description.selection,
				React.DOM.span({
				    style: {
					"margin-left": (this.props.bet.description.selection!=undefined) ? "10px" : "0px"
				    },
				    className: "label label-"+this.props.bet.description.group.level,
				    children: this.props.bet.description.group.label
				})
			    ]
			}),
			React.DOM.p({
			    dangerouslySetInnerHTML: {
				"__html": this.props.bet.description.market
			    }
			})
		    ]
		}),
		React.DOM.td({
		    className: "text-center",			    
		    children: React.DOM.span({
			className: "price",
			children: this.formatPrice(this.props.bet.probability)
		    })
		}),
		React.DOM.td({
		    children: React.DOM.a({
			className: "btn btn-secondary",
			onClick: function() {
			    this.props.clickHandler(this.props.bet);
			}.bind(this),
			children: React.DOM.i({
			    className: "glyphicon glyphicon-pencil"
			})
		    })
		})
	    ]
	});
    }
});

var BrowseBetsTable=React.createClass({
    getInitialState: function() {
	return {
	    bet: undefined,
	    tab: this.props.tab,
	    bets: []
	};
    },
    betsHandler: function(struct) {
	var state=this.state;
	state.bets=struct;
	this.setState(state);
	this.props.dataLoadedHandler(struct.length);
    },
    componentDidMount: function() {
	// this.props.exoticsApi.fetchBlob("products/samples", this.betsHandler);
	this.betsHandler([]);
    },
    componentWillReceiveProps: function(nextProps) {
	var state=this.state;
	var updated=false;
	if (nextProps.tab!=this.props.tab) {
	    state.tab=nextProps.tab;
	    updated=true;
	}
	if (updated) {
	    this.setState(state);
	    this.props.exoticsApi.fetchBlob("products/samples", this.betsHandler);
	}
    },
    handleClicked: function(bet) {
	var state=this.state;
	state.bet=bet;
	this.setState(state);
	this.props.clickHandler(bet);
    },	
    render: function() {
	return React.DOM.table({
	    className: "table table-condensed table-bordered table-striped",
	    children: React.DOM.tbody({
		children: this.state.bets.slice(this.props.rowOffset, this.props.rowOffset+this.props.nRows).map(function(bet) {
		    return React.createElement(BrowseBetsRow, {
			bet: bet,
			clickHandler: this.handleClicked
		    });
		}.bind(this))
	    })
	});
    }
});

var BrowseBetsPaginator=React.createClass({
    initItems: function(table, paginator, clickHandler) {
	var nItems=Math.floor(table.nItems/table.nRows);
	if (0 != table.nItems % table.nRows) {
	    nItems+=1;
	}
	var currentItem=Math.floor(table.offset/table.nRows);
	var firstItem=paginator.length*Math.floor(currentItem/paginator.length);
	var lastItem=Math.min(nItems, firstItem+paginator.length);
	var items=[];
	// '<<'
	if (firstItem!=0) {
	    items.push(React.DOM.li({
		onClick: clickHandler.bind(null, (firstItem-1)*table.nRows),
		children: React.DOM.a({
		    children: React.DOM.span({
			dangerouslySetInnerHTML: {
			    "__html": "&laquo;"
			}
		    })
		})
	    }));
	}
	// numbered steps
	for (var i=firstItem; i < lastItem; i++) {
	    var item=React.DOM.li({
		className: (currentItem==i) ? "active" : "",
		onClick: clickHandler.bind(null, i*table.nRows),
		children: React.DOM.a({
		    children: (i+1).toString()
		})
	    })
	    items.push(item);
	}
	// '>>'
	if (lastItem!=nItems) {
	    items.push(React.DOM.li({
		onClick: clickHandler.bind(null, lastItem*table.nRows),
		children: React.DOM.a({
		    children: React.DOM.span({
			dangerouslySetInnerHTML: {
			    "__html": "&raquo;"
			}
		    })
		})
	    }))
	}
	return items;
    },
    render: function() {
	return React.DOM.nav({
	    children: React.DOM.ul({
		className: "pagination pagination-sm",
		children: this.initItems(this.props.table,
					 this.props.paginator,
					 this.props.clickHandler)
	    })
	});
    }
});


var BrowseBetsPanel=React.createClass({
    getInitialState: function() {
	return {
	    tab: "popular",
	    nRows: 5,
	    nItems: undefined,
	    rowOffset: 0,
	    paginatorLength: 5,
	    teams: []
	}
    },
    handleStepClicked: function(bet) {
	this.props.stepChangeHandler(1, bet);
    },
    handleTabClicked: function(tab) {
	var state=this.state;
	state.tab=tab.name;
	this.setState(state);
    },
    handlePaginatorClicked: function(rowOffset) {
	var state=this.state;
	state.rowOffset=rowOffset;
	this.setState(state);
    },
    handleDataLoaded: function(nItems) {
	var state=this.state;
	state.nItems=nItems;
	this.setState(state);
    },
    handleCreateBet: function() {
	this.props.stepChangeHandler(1, undefined);
    },
    render: function() {
	return React.DOM.div({
	    children: [
		React.createElement(ProcessSteps, {
		    steps: this.props.steps,
		    currentStep: 0
		}),
		React.DOM.div({
		    children: React.createElement(BrowseBetsTabs, {
			tabs: [
			    {
				name: "popular",
				label: "Popular"
			    },
			    {
				name: "daily",
				label: "Daily"
			    },
			    {
				name: "jackpots",
				label: "Jackpots"
			    },
			    {
				name: "my_bets",
				label: "My Bets"
			    }
			],
			selected: this.state.tab,
			clickHandler: this.handleTabClicked
		    })
		}),
		React.createElement(BrowseBetsInlineList, {
		    items: [
			{
			    item: React.createElement(BrowseBetsTeamSelector, {
				exoticsApi: this.props.exoticsApi,
				className: "form-control input-sm btn-secondary",
				item: {},
				defaultOption: {
				    label: "All Teams",
				},
				changeHandler: function(struct) {
				    console.log(JSON.stringify(struct));
				}
			    }),
			    width: 100
			},
			{
			    item: React.createElement(BrowseBetsProductSelector, {
				exoticsApi: this.props.exoticsApi,
				className: "form-control input-sm btn-secondary",
				item: {},
				defaultOption: {
				    label: "All Exotics"
				},
				changeHandler: function(name, value) {
				    console.log(name+"="+value);
				}
			    }),
			    width: 100
			},
			{
			    item: React.DOM.a({
				className: "btn btn-sm btn-primary",
				onClick: this.handleCreateBet,
				children: "Build My Own"
			    }),
			    width: 100,
			    right: true
			}
		    ],
		    style: {
			"margin-right": "7px"
		    }
		}),
		React.createElement(BrowseBetsTable, {
		    exoticsApi: this.props.exoticsApi,
		    clickHandler: this.handleStepClicked,
		    dataLoadedHandler: this.handleDataLoaded,
		    rowOffset: this.state.rowOffset,
		    nRows: this.state.nRows,
		    tab: this.state.tab,
		    team: this.state.team
		}),
		(this.state.nItems!=undefined) ? React.DOM.div({
		    className: "text-center",
		    children: React.createElement(BrowseBetsPaginator, {
			table: {
			    nItems:this.state.nItems,
			    nRows: this.state.nRows,
			    offset: this.state.rowOffset
			},
			paginator: {
			    length: this.state.paginatorLength
			},
			clickHandler: this.handlePaginatorClicked
		    })
		}) : null
	    ]
	});
    }
});
