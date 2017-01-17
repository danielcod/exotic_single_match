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
    loadSuccess: function(struct) {
	var state=this.state;
	state.products=struct;
	this.setState(state);
    },
    loadError: function(xhr, ajaxOptions, thrownError) {
	console.log(xhr.responseText);
    },
    loadComponent: function(url) {
	$.ajax({
	    url: url,
	    type: "GET",
	    dataType: "json",
	    success: this.loadSuccess,
	    error: this.loadError
	});
    },
    componentDidMount: function() {
	this.loadComponent("/app/products/list");
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
    createProduct: function() {
	console.log("createProduct");
    },
    render: function() {
	return React.DOM.div({
	    children: [
		React.createElement(ProcessSteps, {
		    steps: ProcessStepLabels,
		    currentStep: 0
		}),		
		React.DOM.p({
		    className: "text-center",
		    style: {
			color: "#888"
		    },
		    children: React.DOM.i({
			children: "Select a product that looks interesting, and click 'Next' to either edit it or to place a bet"
		    })
		}),
		React.DOM.div({
		    className: "text-right",
		    style: {
			"margin-bottom": "10px"
		    },
		    children: React.DOM.button({
			className: "btn btn-secondary",
			onClick: this.createProduct,
			children: "Create"
		    })
		}),
		React.createElement(BrowseProductsTable, {
		    clickHandler: this.handleClicked
		}),
		React.DOM.div({
		    className: "text-center",
		    children: React.DOM.div({
			className: "btn-group",
			children: [
			    React.DOM.button({
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
			    }),
			    React.DOM.button({
				className: "btn btn-"+this.state.buttonLevel,
				style: {
				    width: "100px"
				},
				children: "Place Bet",
				onClick: function() {
				    if (this.state.selectedProduct!=undefined) {
					this.props.stepChangeHandler(2, this.state.selectedProduct);
				    }
				}.bind(this)
			    })
			]
		    })
		})
	    ]
	});
    }
});
