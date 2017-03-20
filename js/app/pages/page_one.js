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

var BrowseBetsTeamSelect=React.createClass({
    render: function() {
	return React.DOM.select({
	    className: "form-control input-sm btn-secondary",
	    style: {
		"margin-right": "5px"
	    },
	    onChange: function(event) {
		var value=event.target.value;
		this.props.changeHandler(value);
	    }.bind(this),
	    children: this.props.teams.map(function(team) {
		return React.DOM.option({
		    children: team.label || team.value
		});
	    })
	});
    }
});

var BrowseBetsProductSelect=React.createClass({
    render: function() {
	return React.DOM.select({
	    className: "form-control input-sm btn-secondary",
	    onChange: function(event) {
		var value=event.target.value;
		this.props.changeHandler(value);
	    }.bind(this),
	    children: this.props.products.map(function(product) {
		return React.DOM.option({
		    children: product.label || product.value
		});
	    })
	})
    }
});

var BrowseBetsRow=React.createClass({
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
					"margin-left": "10px"
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
			children: this.props.bet.price
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
	    team: this.props.team,
	    product: this.props.product,
	    bets: []
	};
    },
    listBetsHandler: function(struct) {
	var state=this.state;
	state.bets=struct;
	this.setState(state);
	this.props.dataLoadedHandler(struct.length);
    },
    componentDidMount: function() {
	this.props.exoticsApi.listBets(this.props.tab, this.props.team, this.props.product, this.listBetsHandler);
    },
    componentWillReceiveProps: function(nextProps) {
	var state=this.state;
	var updated=false;
	if (nextProps.tab!=this.props.tab) {
	    state.tab=nextProps.tab;
	    updated=true;
	}
	if (nextProps.team!=this.props.team) {
	    state.team=nextProps.team;
	    updated=true;
	}
	if (nextProps.product!=this.props.product) {
	    state.product=nextProps.product;
	    updated=true;
	}
	if (updated) {
	    this.setState(state);
	    this.props.exoticsApi.listBets(this.state.tab, this.state.team, this.state.product, this.listBetsHandler);
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

var BrowseBetsPanel=React.createClass({
    getInitialState: function() {
	return {
	    tab: "popular",
	    defaultTeam: {
		label: "All Teams",
		value: "All"
	    },
	    team: "All",
	    defaultProduct: {
		label: "All Exotics",
		value: "All"
	    },
	    product: "All",
	    nRows: 5,
	    nItems: undefined,
	    rowOffset: 0,
	    paginatorLength: 5,
	    teams: [],
	    products: []
	}
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
    fetchTeamsHandler: function(teams) {
	var state=this.state;
	state.teams=teams.sort(this.sortTeams);
	this.setState(state);
    },
    formatTeamOptions: function(teams) {
	return teams.map(function(team) {
	    return {
		value: team.team
	    }
	});
    },
    sortProducts: function(item0, item1) {
	if (item0.label < item1.label) {
	    return -1;
	} else if (item0.label > item1.label) {
	    return 1;
	} else {
	    return 0;
	}
    },
    fetchProductsHandler: function(products) {
	var state=this.state;
	state.products=products.sort(this.sortProducts);
	this.setState(state);
    },
    formatProductOptions: function(products) {
	return products.map(function(product) {
	    return {		
		value: product.label
	    }
	});
    },
    componentDidMount: function() {
	this.props.exoticsApi.fetchTeams(this.fetchTeamsHandler);
	this.props.exoticsApi.fetchProducts(this.fetchProductsHandler);
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
    handleTeamChanged: function(value) {
	var state=this.state;
	state.team=value;
	this.setState(state);
    },
    handleProductChanged: function(value) {
	var state=this.state;
	state.product=value;
	this.setState(state);
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
		React.DOM.form({
		    children: React.DOM.div({
			className: "row row_filters",
			children: React.DOM.div({
			    className: "col-xs-12",
			    children: [
				React.createElement(BrowseBetsTeamSelect, {
				    teams: [this.state.defaultTeam].concat(this.formatTeamOptions(this.state.teams)),
				    changeHandler: this.handleTeamChanged
				}),
				React.createElement(BrowseBetsProductSelect, {
				    products: [this.state.defaultProduct].concat(this.formatProductOptions(this.state.products)),
				    changeHandler: this.handleProductChanged
				}),
				React.DOM.a({
				    className: "btn btn-sm btn-primary pull-right",
				    onClick: this.handleCreateBet,
				    children: "Build My Own"
				})
			    ]
			})
		    })
		}),
		React.createElement(BrowseBetsTable, {
		    exoticsApi: this.props.exoticsApi,
		    clickHandler: this.handleStepClicked,
		    dataLoadedHandler: this.handleDataLoaded,
		    rowOffset: this.state.rowOffset,
		    nRows: this.state.nRows,
		    tab: this.state.tab,
		    team: this.state.team,
		    product: this.state.product
		}),
		(this.state.nItems!=undefined) ? React.DOM.div({
		    className: "text-center",
		    children: React.createElement(Paginator, {
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
