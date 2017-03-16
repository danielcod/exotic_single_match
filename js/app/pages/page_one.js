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

var BrowseProductsTeamSelect=React.createClass({
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

var BrowseProductsExoticSelect=React.createClass({
    render: function() {
	return React.DOM.select({
	    className: "form-control input-sm btn-secondary",
	    onChange: function(event) {
		var value=event.target.value;
		this.props.changeHandler(value);
	    }.bind(this),
	    children: this.props.productTypes.map(function(productType) {
		return React.DOM.option({
		    children: productType.label || productType.value
		});
	    })
	})
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
				this.props.product.description.selection,
				React.DOM.span({
				    style: {
					"margin-left": "10px"
				    },
				    className: "label label-"+this.props.product.description.group.level,
				    children: this.props.product.description.group.label
				})
			    ]
			}),
			React.DOM.p({
			    dangerouslySetInnerHTML: {
				"__html": this.props.product.description.market
			    }
			})
		    ]
		}),
		React.DOM.td({
		    className: "text-center",			    
		    children: React.DOM.span({
			className: "price",
			children: this.props.product.price
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
	    selectedTab: this.props.selectedTab,
	    selectedTeam: this.props.selectedTeam,
	    selectedProductType: this.props.selectedProductType,
	    products: []
	};
    },
    listProductsHandler: function(struct) {
	var state=this.state;
	state.products=struct;
	this.setState(state);
	this.props.dataLoadedHandler(struct.length);
    },
    componentDidMount: function() {
	this.props.exoticsApi.listProducts(this.props.selectedTab, this.props.selectedTeam, this.props.selectedProductType, this.listProductsHandler);
    },
    componentWillReceiveProps: function(nextProps) {
	var state=this.state;
	var updated=false;
	if (nextProps.selectedTab!=this.props.selectedTab) {
	    state.selectedTab=nextProps.selectedTab;
	    updated=true;
	}
	if (nextProps.selectedTeam!=this.props.selectedTeam) {
	    state.selectedTeam=nextProps.selectedTeam;
	    updated=true;
	}
	if (nextProps.selectedProductType!=this.props.selectedProductType) {
	    state.selectedProductType=nextProps.selectedProductType;
	    updated=true;
	}
	if (updated) {
	    this.setState(state);
	    this.props.exoticsApi.listProducts(this.state.selectedTab, this.state.selectedTeam, this.state.selectedProductType, this.listProductsHandler);
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

var BrowseProductsPanel=React.createClass({
    getInitialState: function() {
	return {
	    selectedTab: "popular",
	    defaultTeam: {
		label: "All Teams",
		value: "All"
	    },
	    selectedTeam: "All",
	    defaultProductType: {
		label: "All Exotics",
		value: "All"
	    },
	    selectedProductType: "All",
	    nRows: 5,
	    nItems: undefined,
	    rowOffset: 0,
	    paginatorLength: 5,
	    teams: [],
	    productTypes: []
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
	state.teams=teams.sort(this.sortTeams);
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
	state.productTypes=productTypes.sort(this.sortProductTypes);
	this.setState(state);
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
    handleTeamChanged: function(value) {
	var state=this.state;
	state.selectedTeam=value;
	this.setState(state);
    },
    handleProductTypeChanged: function(value) {
	var state=this.state;
	state.selectedProductType=value;
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
				    teams: [this.state.defaultTeam].concat(this.formatTeamOptions(this.state.teams)),
				    changeHandler: this.handleTeamChanged
				}),
				React.createElement(BrowseProductsExoticSelect, {
				    productTypes: [this.state.defaultProductType].concat(this.formatProductTypeOptions(this.state.productTypes)),
				    changeHandler: this.handleProductTypeChanged
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
		    selectedTab: this.state.selectedTab,
		    selectedTeam: this.state.selectedTeam,
		    selectedProductType: this.state.selectedProductType
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
