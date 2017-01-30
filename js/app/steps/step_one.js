var BrowseProductsTabs=React.createClass({
    render: function() {
	return React.DOM.ul({
	    className: "nav nav-tabs",
	    children: [
		React.DOM.li({
		    className: "active",
		    children: React.DOM.a({
			children: "Popular"
		    })
		}),
		React.DOM.li({
		    children: React.DOM.a({
			children: "Daily"
		    })
		}),
		React.DOM.li({
		    children: React.DOM.a({
			children: "Jackpots"
		    })
		}),
		React.DOM.li({
		    children: React.DOM.a({
			children: "My Bets"
		    })
		})
	    ]
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
    render: function() {
	return React.DOM.ul({
	    className: "pagination",
	    children: [
		React.DOM.li({
		    className: "active",
		    children: React.DOM.a({
			children: "1"
		    })
		}),
		React.DOM.li({
		    children: React.DOM.a({
			children: "2"
		    })
		}),
		React.DOM.li({
		    children: React.DOM.a({
			children: "3"
		    })
		}),
		React.DOM.li({
		    children: React.DOM.a({
			children: "4"
		    })
		}),
		React.DOM.li({
		    children: React.DOM.a({
			children: "5"
		    })
		})
	    ]
	});
    }
});

var BrowseProductsPanel=React.createClass({
    getInitialState: function() {
	return {
	    buttonLevel: "secondary"
	};
    },
    handleClicked: function(product) {
	this.props.stepChangeHandler(1, product);
    },
    render: function() {
	return React.DOM.div({
	    children: [
		React.createElement(ProcessSteps, {
		    steps: this.props.steps,
		    currentStep: 0
		}),
		React.DOM.div({
		    style: {
			"margin-bottom": "10px"
		    },
		    children: React.createElement(BrowseProductsTabs, {
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
		    clickHandler: this.handleClicked
		}),
		React.DOM.div({
		    className: "text-center",
		    style: {
			"margin-top": "-20px"
		    },
		    children: React.createElement(BrowseProductsPaginator, {
		    })
		})
	    ]
	});
    }
});
