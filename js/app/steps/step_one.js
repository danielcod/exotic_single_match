var BrowseProductsRow=React.createClass({
    render: function() {
	return React.DOM.tr({
	    onClick: function() {
		this.props.clickHandler(this.props.product);
	    }.bind(this),
	    style: ((this.props.selectedProduct!=undefined) &&
		    (this.props.product.id==this.props.selectedProduct.id)) ? {
		"background-color": "#8FA"
	    } : {},
	    children: [
		React.DOM.td({
		    children: this.props.product.description
		}),
		React.DOM.td({
		    className: "text-center",			    
		    children: this.props.product.price
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
	    selectedProduct: undefined,
	    buttonLevel: "secondary"
	};
    },
    handleClicked: function(product) {
	var state=this.state;
	state.selectedProduct=product;
	state.buttonLevel="primary";
	this.setState(state);
    },
    render: function() {
	return React.DOM.div({
	    children: [
		React.createElement(ProcessSteps, {
		    steps: this.props.steps,
		    currentStep: 0
		}),		
		React.DOM.p({
		    className: "text-center",
		    style: {
			color: "#888"
		    },
		    children: React.DOM.i({
			children: "Select a product you're interested in by clicking a table row; you can then edit that bet's details by clicking on 'Edit Bet'"
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
		}),
		React.DOM.div({
		    className: "text-center",
		    children: React.DOM.button({
			className: "btn btn-"+this.state.buttonLevel,
			style: {
			    width: "100px"
			},
			children: "Edit Bet",
			onClick: function() {
			    if (this.state.selectedProduct!=undefined) {
				this.props.stepChangeHandler(1, this.state.selectedProduct);
			    }
			}.bind(this)
		    })
		})
	    ]
	});
    }
});
