var BrowseProductsTabs=React.createClass({
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

var BrowseProductsRow=React.createClass({
    render: function() {
	return React.DOM.tr({
	    children: [
		React.DOM.td({
		    children: [
			React.DOM.h5({
			    children: [
				this.props.product.params.description.selection,
				React.DOM.span({
				    style: {
					"margin-left": "10px"
				    },
				    className: "label label-"+this.props.product.params.description.group.level,
				    children: this.props.product.params.description.group.label
				})
			    ]
			}),
			React.DOM.p({
			    dangerouslySetInnerHTML: {
				"__html": this.props.product.params.description.market
			    }
			})
		    ]
		}),
		React.DOM.td({
		    className: "text-center",			    
		    children: React.DOM.span({
			className: "price",
			children: this.props.product.params.price
		    })
		}),
		React.DOM.td({
		    children: React.DOM.a({
			className: "btn btn-secondary",
			onClick: function() {
			    this.props.clickHandler(this.props.product);
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

var BrowseProductsTable=React.createClass({
    getInitialState: function() {
	return {
	    selectedProduct: undefined,
	    products: []
	};
    },
    browseProductsHandler: function(struct) {
	var state=this.state;
	state.products=struct;
	this.setState(state);
	this.props.dataLoadedHandler(struct.length);
    },
    componentDidMount: function() {
	this.props.exoticsApi.browseProducts(this.props.selectedTab, this.browseProductsHandler);
    },
    componentWillReceiveProps: function(nextProps) {
	if (nextProps.selectedTab!=this.props.selectedTab) {
	    this.props.exoticsApi.browseProducts(nextProps.selectedTab, this.browseProductsHandler);
	}
    },
    handleClicked: function(product) {
	var state=this.state;
	state.selectedProduct=product;
	this.setState(state);
	this.props.clickHandler(product);
    },	
    render: function() {
	return React.DOM.table({
	    className: "table table-condensed table-bordered table-striped",
	    children: React.DOM.tbody({
		children: this.state.products.slice(this.props.rowOffset, this.props.rowOffset+this.props.nRows).map(function(product) {
		    return React.createElement(BrowseProductsRow, {
			product: product,
			selectedProduct: this.state.selectedProduct,
			clickHandler: this.handleClicked
		    });
		}.bind(this))
	    })
	});
    }
});

var BrowseProductsPaginator=React.createClass({
    initItems: function(table, paginator, clickHandler) {
	var nItems=Math.floor(table.nItems/table.nRows);
	if (0 != table.nItems % table.nRows) {
	    nItems+=1;
	}
	var currentItem=Math.floor(table.offset/table.nRows);
	var firstItem=paginator.length*Math.floor(currentItem/paginator.length);
	var lastItem=Math.min(nItems, firstItem+paginator.length);
	/*
	console.log(JSON.stringify({
	    table: table,
	    paginator: paginator,
	    nItems: nItems,
	    currentItem: currentItem,
	    firstItem: firstItem,
	    lastItem: lastItem
	}));
	*/
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

var BrowseProductsTeamSelect=React.createClass({
    render: function() {
	return React.DOM.select({
	    className: "form-control input-sm btn-secondary",
	    style: {
		"margin-right": "5px"
	    },
	    children: this.props.teams.map(function(team) {
		return React.DOM.option({
		    children: team.value
		});
	    })
	});
    }
});

var BrowseProductsExoticSelect=React.createClass({
    render: function() {
	return React.DOM.select({
	    className: "form-control input-sm btn-secondary",
	    children: this.props.productTypes.map(function(productType) {
		return React.DOM.option({
		    children: productType.value
		});
	    })
	})
    }
});

var BrowseProductsPanel=React.createClass({
    DefaultTeam: {
	name: "Team"
    },
    DefaultProductType: {
	label: "Exotic"
    },
    getInitialState: function() {
	return {
	    selectedTab: "popular",
	    nRows: 5,
	    nItems: undefined,
	    rowOffset: 0,
	    paginatorLength: 5,
	    teams: [this.DefaultTeam],
	    productTypes: [this.DefaultProductType]
	}
    },
    sortTeams: function(item0, item1) {
	if (item0.name < item1.name) {
	    return -1;
	} else if (item0.name > item1.name) {
	    return 1;
	} else {
	    return 0;
	}
    },
    fetchTeamsHandler: function(teams) {
	var state=this.state;
	state.teams=[this.DefaultTeam].concat(teams.sort(this.sortTeams));
	this.setState(state);
    },
    formatTeamOptions: function(teams) {
	return teams.map(function(team) {
	    return {
		value: team.name
	    }
	});
    },
    sortProductTypes: function(item0, item1) {
	if (item0.label < item1.label) {
	    return -1;
	} else if (item0.label > item1.label) {
	    return 1;
	} else {
	    return 0;
	}
    },
    fetchProductTypesHandler: function(productTypes) {
	var state=this.state;
	state.productTypes=[this.DefaultProductType].concat(productTypes.sort(this.sortProductTypes));
    },
    formatProductTypeOptions: function(productTypes) {
	return productTypes.map(function(productType) {
	    return {
		value: productType.label
	    }
	});
    },
    componentDidMount: function() {
	this.props.exoticsApi.fetchTeams(undefined, this.fetchTeamsHandler);
	this.props.exoticsApi.fetchProductTypes(this.fetchProductTypesHandler);
    },
    handleStepClicked: function(product) {
	this.props.stepChangeHandler(1, product);
    },
    handleTabClicked: function(tab) {
	var state=this.state;
	state.selectedTab=tab.name;
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
    handleCreateProduct: function() {
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
		    children: React.createElement(BrowseProductsTabs, {
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
			selected: this.state.selectedTab,
			clickHandler: this.handleTabClicked
		    })
		}),
		React.DOM.form({
		    children: React.DOM.div({
			className: "row row_filters",
			children: React.DOM.div({
			    className: "col-xs-12",
			    children: [
				React.createElement(BrowseProductsTeamSelect, {
				    teams: this.formatTeamOptions(this.state.teams)
				}),
				React.createElement(BrowseProductsExoticSelect, {
				    productTypes: this.formatProductTypeOptions(this.state.productTypes)
				}),
				React.DOM.a({
				    className: "btn btn-sm btn-primary pull-right",
				    onClick: this.handleCreateProduct,
				    children: "Build My Own"
				})
			    ]
			})
		    })
		}),
		React.createElement(BrowseProductsTable, {
		    exoticsApi: this.props.exoticsApi,
		    clickHandler: this.handleStepClicked,
		    dataLoadedHandler: this.handleDataLoaded,
		    rowOffset: this.state.rowOffset,
		    nRows: this.state.nRows,
		    selectedTab: this.state.selectedTab
		}),
		(this.state.nItems!=undefined) ? React.DOM.div({
		    className: "text-center",
		    children: React.createElement(BrowseProductsPaginator, {
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
