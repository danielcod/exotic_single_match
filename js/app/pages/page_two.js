var EditProductMapping={
    "single_team_outright": SingleTeamOutrightForm,
    "season_match_bet": SeasonMatchBetForm,
    "mini_league": MiniLeagueForm
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
		    className: "form-control btn-primary input-lg",
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
			    value: option.type,
			    children: option.label || option.type
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
    sortProductTypes: function(item0, item1) {
	if (item0.label < item1.label) {
	    return -1;
	} else if (item0.label > item1.label) {
	    return 1;
	} else {
	    return 0;
	}
    },
    productTypesHandler: function(struct) {
	var state=this.state;	
	state.products=struct.sort(this.sortProductTypes);
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
	if (this.props.initialProduct!=undefined) {
	    this.props.exoticsApi.showProduct(this.props.initialProduct.type, this.props.initialProduct.params.id, this.productHandler);
	} else {
	    this.productHandler({
		type: "single_team_outright",
		params: {}
	    })
	}
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
    loadProductClass: function(name) {
	return EditProductMapping[name];
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
		    className: "help-block",
		    children: (this.state.products.length > 0) ? React.DOM.i({
			children: this.state.products.filter(function(product) {
			    return product.type==this.state.selectedProduct.type
			}.bind(this))[0]["description"]
		    }) : undefined
		}),
		React.createElement(this.loadProductClass(this.state.selectedProduct.type), {
		    exoticsApi: this.props.exoticsApi,
		    changeHandler: this.props.productChangeHandler,
		    params: this.state.selectedProduct.params,
		    blankStyle: {
			border: "3px solid #59a0df"
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
		React.DOM.div({
		    className: "form-group",
		    children: React.DOM.h3({
			className: "current-price text-center",
			style: {
			    margin: "20 0 10px"
			},
			children: [
			    "Current price: ",
			    React.DOM.span({
				id: "price",
				children: "[..]"
			    })					
			]				    
		    })
		}),
		React.createElement(EditProductForm, {
		    exoticsApi: this.props.exoticsApi,
		    productChangeHandler: this.productChangeHandler,
		    initialProduct: this.props.initialProduct
		}),
		React.DOM.div({
		    className: "text-center",
		    style: {
			margin: "5px 0 20px"
		    },
		    children: [
			React.DOM.button({
			    className: "btn btn-secondary",
			    style: {
				width: "100px",
				"margin-right": "3px"				
			    },
			    children: "Cancel",
			    onClick: function() {
				this.props.stepChangeHandler(0, undefined);
			    }.bind(this)
			}),
			React.DOM.button({
			    className: "btn btn-primary",
			    style: {
				width: "100px",
				"margin-left": "3px"
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
	    ]
	});
    }
});
