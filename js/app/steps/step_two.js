var EditProductMapping={
    "single_teams": SingleTeamsForm
};

var EditProductSelect=React.createClass({
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

var EditProductForm=React.createClass({
    getInitialState: function() {
	return {
	    initialProduct: undefined,
	    selectedProduct: undefined,
	    products: []
	};
    },
    productTypesHandler: function(struct) {
	var state=this.state;
	state.products=struct;
	this.setState(state);
    },
    productHandler: function(struct) {
	var state=this.state;
	state.initialProduct=deepCopy(struct);
	state.selectedProduct=deepCopy(struct);
	this.setState(state);
    },
    componentDidMount: function() {
	this.props.exoticsApi.fetchProductTypes(this.productTypesHandler);
	this.props.exoticsApi.showProduct(this.props.initialProduct.type, this.props.initialProduct.params.id, this.productHandler);
    },
    productChangeHandler: function(value) {
	var state=this.state;
	if (state.initialProduct.type==value) {
	    state.selectedProduct=state.initialProduct;
	} else {
	    state.selectedProduct={
		type: value,
		params: {}
	    };
	}
	this.setState(state);
    },
    render: function() {
	return React.DOM.div({
	    children: (this.state.selectedProduct!=undefined) ? [
		React.createElement(EditProductSelect, {
		    options: this.state.products,
		    value: this.state.selectedProduct.type,
		    changeHandler: this.productChangeHandler
		}),
		React.DOM.p({
		    className: "text-center",
		    style: {
			color: "#888"
		    },
		    children: (this.state.products.length > 0) ? React.DOM.i({
			children: this.state.products.filter(function(product) {
			    return product.type==this.state.selectedProduct.type
			}.bind(this))[0]["description"]
		    }) : undefined
		}),
		React.createElement(EditProductMapping[this.state.selectedProduct.type], {
		    exoticsApi: this.props.exoticsApi,
		    changeHandler: this.props.productChangeHandler,
		    params: this.state.selectedProduct.params,
		    blankStyle: {
			border: "3px solid #F88"
		    }
		})
	    ] : []
	});
    }
});

var EditProductPanel=React.createClass({
    getInitialState: function() {
	return {
	    currentProduct: this.props.initialProduct
	}
    },
    productChangeHandler: function(struct) {
	console.log(JSON.stringify(struct)); // TEMP
	var state=this.state;
	state.currentProduct=struct;
	this.setState(state);
    },
    render: function() {
	return React.DOM.div({
	    children: [
		React.createElement(ProcessSteps, {
		    steps: this.props.steps,
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
		React.createElement(EditProductForm, {
		    exoticsApi: this.props.exoticsApi,
		    productChangeHandler: this.productChangeHandler,
		    initialProduct: this.props.initialProduct
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
				    if (this.state.currentProduct!=undefined) {
					this.props.stepChangeHandler(2, this.state.currentProduct);
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
