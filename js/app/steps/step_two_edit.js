var ProductMapping={
    "single_teams": SingleTeamsForm
};

var ProductStyles={
    BlankOption: {
	border: "3px solid #F88"
    }
};

var ProductSelect=React.createClass({
    getInitialState: function() {
	return {
	    value: this.props.value
	}
    },
    render: function() {
	return React.DOM.div({
	    className: "form-group",
	    children: [
		React.DOM.label({
		    children: "Product Type"
		}),
		React.DOM.select({
		    className: "form-control",
		    value: this.state.value,
		    onChange: function(event) {
			var value=event.target.value;
			var state=this.state
			state.value=value;
			this.setState(state);
			this.props.changeHandler(value);
		    }.bind(this),
		    children: this.props.options.map(function(option) {
			return React.DOM.option({
			    value: option.name,
			    children: option.label || option.name
			})
		    })
		})
	    ]
	});
    }	
});

var ProductForm=React.createClass({
    getInitialState: function() {
	return {
	    exoticsApi: new ExoticsAPI(this.ajaxErrHandler, false),
	    selectedProduct: undefined,
	    currentProduct: undefined,
	    products: []
	};
    },
    deepCopy: function(struct) {
	return JSON.parse(JSON.stringify(struct));
    },
    ajaxErrHandler: function(xhr, ajaxOptions, thrownError) {
	console.log(xhr.responseText);
    },
    listProductsHandler: function(struct) {
	var state=this.state;
	state.products=struct;
	this.setState(state);
    },
    showProductHandler: function(struct) {
	var state=this.state;
	state.selectedProduct=this.deepCopy(struct);
	state.currentProduct=this.deepCopy(struct);
	this.setState(state);
    },
    componentDidMount: function() {
	this.state.exoticsApi.listProducts(this.listProductsHandler);
	this.state.exoticsApi.showProduct(this.props.selectedProduct.type, this.props.selectedProduct.id, this.showProductHandler);
    },
    productChangeHandler: function(value) {
	var state=this.state;
	if (state.selectedProduct.type==value) {
	    state.currentProduct=state.selectedProduct;
	} else {
	    state.currentProduct={
		type: value,
		params: {}
	    };
	}
	this.setState(state);
    },
    render: function() {
	return React.DOM.div({
	    children: (this.state.currentProduct!=undefined) ? [
		React.createElement(ProductSelect, {
		    options: this.state.products,
		    value: this.state.currentProduct.type,
		    changeHandler: this.productChangeHandler
		}),
		React.DOM.p({
		    className: "text-center",
		    style: {
			color: "#888"
		    },
		    children: React.DOM.i({
			children: this.state.products.filter(function(product) {
			    return product.type==this.state.currentProduct.type
			}.bind(this))[0]["description"]
		    })
		}),
		React.createElement(ProductMapping[this.state.currentProduct.type], {
		    params: this.state.currentProduct.params,
		    blankStyle: ProductStyles.BlankOption
		})
	    ] : []
	});
    }
});

var EditProductPanel=React.createClass({
    render: function() {
	return React.DOM.div({
	    children: [
		React.createElement(ProcessSteps, {
		    steps: ProcessStepLabels,
		    currentStep: 1
		}),
		React.DOM.p({
		    className: "text-center",
		    style: {
			color: "#888"
		    },
		    children: React.DOM.i({
			children: "Edit your chosen product; the price will be updated in real time; click 'Next' to place a bet when you're done"
		    })
		}),		
		React.DOM.h3({
		    className: "text-center",
		    style: {
			color: "#888",
			"margin-bottom": "20px",
			"margin-top": "20px"
		    },
		    children: React.DOM.i({
			children: React.DOM.b({
			    children: [
				"Current price: ",
				React.DOM.span({
				    id: "price",
				    children: "[..]"
				})
			    ]
			})
		    })			
		}),
		React.createElement(ProductForm, {
		    selectedProduct: this.props.selectedProduct
		}),
		React.DOM.div({
		    className: "text-center",
		    children: React.DOM.div({
			className: "btn-group",
			style: {
			    "margin-top": "20px"
			},
			children: [
			    React.DOM.button({
				className: "btn btn-secondary",
				style: {
				    width: "100px"
				},
				children: "Cancel",
				onClick: function() {
				    this.props.stepChangeHandler(0, undefined);
				}.bind(this)
			    }),
			    React.DOM.button({
				className: "btn btn-primary",
				style: {
				    width: "100px"
				},
				children: "Next",
				onClick: function() {
				    this.props.stepChangeHandler(2, this.props.selectedProduct);
				}.bind(this)
			    })
			]
		    })
		})
	    ]
	});
    }
});
