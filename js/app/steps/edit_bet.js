var Products=[{
    label: "Single Teams Outright",
    name: "single_teams",
    description: "An outright bet on a single team, but with dozens of payoffs per team - plus you don't have to wait until the end of the season!"
}];

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
	state.selectedProduct=this.deepCopy(struct);
	state.currentProduct=this.deepCopy(struct);
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
	this.loadComponent("/app/products/show");
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
		    options: Products,
		    value: this.state.currentProduct.type,
		    changeHandler: this.productChangeHandler
		}),
		React.DOM.p({
		    className: "text-center",
		    style: {
			color: "#888"
		    },
		    children: React.DOM.i({
			children: Products.filter(function(product) {
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
		React.DOM.h4({
		    className: "text-center",
		    style: {
			color: "#F88",
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
