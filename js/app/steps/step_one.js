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
			    children: this.props.product.params.description.market
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
    },
    componentDidMount: function() {
	this.props.exoticsApi.browseProducts(this.browseProductsHandler);
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
		children: this.state.products.map(function(product) {
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
    initItems: function(nRows, pageSize, rowOffset, paginatorSize, clickHandler) {
	var nItems=Math.floor(nRows/pageSize);
	if (0 != nRows % pageSize) {
	    nItems+=1;
	}
	var currentItem=Math.floor(rowOffset/pageSize);
	var firstItem=paginatorSize*Math.floor(currentItem/paginatorSize);
	var lastItem=Math.min(nItems-1, firstItem+paginatorSize);
	var items=[];
	if (firstItem!=0) {
	    items.push(React.DOM.li({
		onClick: clickHandler.bind(null, (firstItem-1)*pageSize),
		children: React.DOM.a({
		    children: React.DOM.span({
			dangerouslySetInnerHTML: {
			    "__html": "&laquo;"
			}
		    })
		})
	    }));
	}
	for (var i=firstItem; i < lastItem; i++) {
	    var item=React.DOM.li({
		className: (currentItem==i) ? "active" : "",
		onClick: clickHandler.bind(null, i*pageSize),
		children: React.DOM.a({
		    children: (i+1).toString()
		})
	    })
	    items.push(item);
	}
	if (lastItem!=nItems-1) {
	    items.push(React.DOM.li({
		onClick: clickHandler.bind(null, lastItem*pageSize),
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
		children: this.initItems(this.props.nRows,
					 this.props.pageSize,
					 this.props.rowOffset,
					 this.props.paginatorSize,
					 this.props.clickHandler)
	    })
	});
    }
});

var BrowseProductsPanel=React.createClass({
    getInitialState: function() {
	return {
	    rowOffset: 0,
	    selectedTab: "popular"
	}
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
				React.DOM.select({
				    className: "form-control input-sm btn-secondary",
				    style: {
					"margin-right": "5px"
				    },
				    children: React.DOM.option({
					children: "Team"
				    })
				}),
				React.DOM.select({
				    className: "form-control input-sm btn-secondary",
				    children: React.DOM.option({
					children: "Exotic"
				    })
				}),
				React.DOM.button({
				    className: "btn btn-sm btn-primary pull-right",
				    children: "Build My Own"
				})
			    ]
			})
		    })
		}),
		React.createElement(BrowseProductsTable, {
		    exoticsApi: this.props.exoticsApi,
		    clickHandler: this.handleStepClicked
		}),
		React.DOM.div({
		    className: "text-center",
		    children: React.createElement(BrowseProductsPaginator, {
			nRows: 91,
			pageSize: 10,
			rowOffset: this.state.rowOffset,			
			paginatorSize: 5,
			clickHandler: this.handlePaginatorClicked
		    })
		})
	    ]
	});
    }
});
