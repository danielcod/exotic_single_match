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
	    products: [],
	    selectedProduct: undefined,
	    currentProduct: undefined
	};
    },
    deepCopy: function(struct) {
	return JSON.parse(JSON.stringify(struct));
    },
    loadSuccess: function(struct) {
	var state=this.state;
	state.products=this.deepCopy(struct.products);
	state.selectedProduct=this.deepCopy(struct.product);
	state.currentProduct=this.deepCopy(struct.product);
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
	this.loadComponent("/site/app/edit");
    },
    productChangeHandler: function(value) {
	var state=this.state;
	if (state.selectedProduct.type==value) {
	    state.currentProduct=state.selectedProduct;
	} else {
	    state.currentProduct={
		type: value,
		query: {}
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
			    return product.name==this.state.currentProduct.type
			}.bind(this))[0]["description"]
		    })
		}),
		React.createElement(ProductMapping[this.state.currentProduct.type], {
		    params: this.state.currentProduct.query,
		    blankStyle: ProductStyles.BlankOption
		})
	    ] : []
	});
    }
});

var EditBetPanel=React.createClass({
    render: function() {
	return React.DOM.div({
	    children: [
		React.createElement(AppProcessSteps, {
		    steps: AppProcessStepLabels,
		    currentStep: 1
		}),
		React.DOM.h3({
		    className: "text-center",
		    style: {
			color: "#888",
			"margin-bottom": "20px"			
		    },
		    children: React.DOM.i({
			children: [
			    "Your price: ",
			    React.DOM.span({
				id: "price",
				children: "[..]"
			    })
			]
		    })			
		}),
		React.createElement(ProductForm, {}),
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
				    this.props.stepChangeHandler(0);
				}.bind(this)
			    }),
			    React.DOM.button({
				className: "btn btn-primary",
				style: {
				    width: "100px"
				},
				children: "Next",
				onClick: function() {
				    this.props.stepChangeHandler(2);
				}.bind(this)
			    })
			]
		    })
		})
	    ]
	});
    }
});
