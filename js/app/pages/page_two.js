// note that product loading is duplicated here; is loaded once by ProductSelector, but is then loaded separately for product form rendering; shouldn't matter because of API services cache

var EditBetForm=React.createClass({
    initBet: function(bet) {	
	return (bet!=undefined) ? bet : {
	    "type":"exotic_acca"
	}
    },
    getInitialState: function() {
	return {
	    bet: this.initBet(this.props.bet),
	    products: [],
	    price: "[..]"
	}
    },
    productsHandler: function(struct) {
	var state=this.state;	
	state.products=struct;
	this.setState(state);
    },
    componentDidMount: function() {
	this.props.exoticsApi.fetchProducts(this.productsHandler);
    },
    productChangeHandler: function(name, value) {
	var state=this.state;
	state.bet={
	    type: value
	}
	this.setState(state);
    },
    formatPrice: function(probability) {
	return (1/Math.min(0.99, Math.max(0.01, probability))).toFixed(2);
    },
    priceChangeHandler: function(price) {
	var state=this.state;
	state.price=price;
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
    updatePrice: function(bet) {
	this.priceChangeHandler("[updating ..]");
	this.props.exoticsApi.fetchPrice(bet, function(struct) {
	    this.priceChangeHandler(this.formatPrice(struct["probability"]));
	}.bind(this));
	this.props.productChangeHandler(bet);
    },
    resetPrice: function() {
	this.priceChangeHandler("[..]");
	this.props.productChangeHandler(undefined);
    },
    render: function() {
	return React.DOM.div({
	    children: [
		React.DOM.div({
		    style: {
			"margin-top": "20px"
		    },		   
		    children: React.createElement(ProductSelector, {
			exoticsApi: this.props.exoticsApi,
			className: "form-control btn-primary input-lg",
			product: this.state.bet,
			changeHandler: this.productChangeHandler
		    })
		}),
		React.DOM.p({
		    className: "help-block",
		    children: (this.state.products.length > 0) ? React.DOM.i({
			dangerouslySetInnerHTML: {
			    "__html": this.state.products.filter(function(bet) {
				return bet.type==this.state.bet.type
			    }.bind(this))[0]["description"]
			}
		    }) : undefined
		}),
		React.DOM.div({
		    className: "form-group",
		    children: React.DOM.h3({
			className: "current-price text-center",
			children: [
			    "Current price: ",
			    React.DOM.span({
				id: "price",
				children: this.state.price
			    })					
			]				    
		    })
		}),
		(this.state.products.length!=0) ? React.createElement(this.loadProductForm(this.state.bet.type), {
		    exoticsApi: this.props.exoticsApi,
		    bet: this.state.bet,
		    blankStyle: {
			border: "3px solid #59a0df"
		    },
		    updatePriceHandler: this.updatePrice,
		    resetPriceHandler: this.resetPrice
		}) : undefined
	    ]
	});
    }
});

var EditBetPanel=React.createClass({
    getInitialState: function() {
	return {
	    bet: this.props.bet
	}
    },
    productChangeHandler: function(struct) {
	var state=this.state;
	state.bet=struct;
	this.setState(state);
    },
    deepCopy: function(struct) {
	if (struct==undefined) {
	    return struct;
	}
	return JSON.parse(JSON.stringify(struct));
    },
    render: function() {
	return React.DOM.div({
	    children: [
		React.createElement(ProcessSteps, {
		    steps: this.props.steps,
		    currentStep: 1
		}),
		React.createElement(EditBetForm, {
		    exoticsApi: this.props.exoticsApi,
		    productChangeHandler: this.productChangeHandler,
		    bet: this.deepCopy(this.props.bet) // don't want original bet to be updated; create a copy
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
				if (this.state.bet!=undefined) {
				    this.props.stepChangeHandler(2, this.state.bet);
				}
			    }.bind(this)
			})
		    ]
		})
	    ]
	});
    }
});
