var EditBetSelect=React.createClass({
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
		    children: "Bet Type"
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

var EditBetForm=React.createClass({
    initBet: function(bet) {
	return (bet!=undefined) ? deepCopy(bet) : {
	    type: "single_team_outright"
	}
    },
    getInitialState: function() {
	return {
	    initialBet: undefined,
	    selectedBet: undefined,
	    products: []
	};
    },
    sortProducts: function(item0, item1) {
	if (item0.label < item1.label) {
	    return -1;
	} else if (item0.label > item1.label) {
	    return 1;
	} else {
	    return 0;
	}
    },
    productsHandler: function(struct) {
	var state=this.state;	
	state.products=struct.sort(this.sortProducts);
	this.setState(state);
    },
    betHandler: function(struct) {
	var state=this.state;
	state.initialBet=deepCopy(struct);
	state.selectedBet=deepCopy(struct);
	this.setState(state);
    },
    componentDidMount: function() {
	this.props.exoticsApi.fetchProducts(this.productsHandler);
	this.betHandler(this.initBet(this.props.initialBet));
    },
    productChangeHandler: function(value) {
	var state=this.state;
	if (state.initialBet.type==value) {
	    state.selectedBet=state.initialBet;
	} else {
	    state.selectedBet={
		type: value,
		bet: {}
	    };
	}
	this.setState(state);
    },
    loadProductForm: function(type) {
	for(var i=0 ; i < this.state.products.length; i++) {
	    var product=this.state.products[i];
	    if (type==product.type) {
		return eval(product.form);
	    }
	}
	return undefined;
    },
    updatePrice: function(type, bet) {
	this.props.priceChangeHandler("[updating ..]");
	this.props.exoticsApi.fetchPrice({
	    type: type,
	    bet: bet	    
	}, function(struct) {
	    this.props.priceChangeHandler(struct["price"]);
	}.bind(this));
	this.props.productChangeHandler({
	    type: type,
	    bet: bet
	});
    },
    resetPrice: function() {
	this.props.priceChangeHandler("[..]");
	this.props.productChangeHandler(undefined);
    },
    render: function() {
	return React.DOM.div({
	    children: (this.state.selectedBet!=undefined) ? [
		React.createElement(EditBetSelect, {
		    options: this.state.products,
		    value: this.state.selectedBet.type,
		    changeHandler: this.productChangeHandler
		}),
		React.DOM.p({
		    className: "help-block",
		    children: (this.state.products.length > 0) ? React.DOM.i({
			children: this.state.products.filter(function(bet) {
			    return bet.type==this.state.selectedBet.type
			}.bind(this))[0]["description"]
		    }) : undefined
		}),
		React.createElement(this.loadProductForm(this.state.selectedBet.type), {
		    exoticsApi: this.props.exoticsApi,
		    bet: this.state.selectedBet,
		    blankStyle: {
			border: "3px solid #59a0df"
		    },
		    updatePriceHandler: this.updatePrice,
		    resetPriceHandler: this.resetPrice
		})
	    ] : []
	});
    }
});

var EditBetPanel=React.createClass({
    getInitialState: function() {
	return {
	    currentBet: this.props.initialBet,
	    price: "[..]"
	}
    },
    productChangeHandler: function(struct) {
	var state=this.state;
	state.currentBet=struct;
	this.setState(state);
    },
    priceChangeHandler: function(price) {
	var state=this.state;
	state.price=price;
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
				children: this.state.price
			    })					
			]				    
		    })
		}),
		React.createElement(EditBetForm, {
		    exoticsApi: this.props.exoticsApi,
		    productChangeHandler: this.productChangeHandler,
		    priceChangeHandler: this.priceChangeHandler,
		    initialBet: this.props.initialBet
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
				if (this.state.currentBet!=undefined) {
				    this.props.stepChangeHandler(2, this.state.currentBet);
				}
			    }.bind(this)
			})
		    ]
		})
	    ]
	});
    }
});
