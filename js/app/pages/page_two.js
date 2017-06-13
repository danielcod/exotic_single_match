var EditBetForm=React.createClass({
    initBet: function(bet) {	
	return (bet!=undefined) ? bet : {
	    type: "exotic_acca",
	    params: {},
	    probability: undefined,
	    desciption: undefined
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
	    type: value,
	    params: {},
	    probability: undefined,
	    description: undefined
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
    updatePrice: function(bet) {
	this.priceChangeHandler("[updating ..]");
	this.props.exoticsApi.fetchPrice(bet, function(struct) {
	    var state=this.state;
	    state.bet.probability=struct.probability;
	    state.bet.description=struct.description;
	    this.setState(state);
	    this.priceChangeHandler(this.formatPrice(struct.probability));
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
		(this.state.products.length!=0) ? React.createElement(ExoticAccaForm, {
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
			    className: "btn btn-primary",
			    style: {
				width: "100px",
				"margin-left": "3px"
			    },
			    children: "Next",
			    onClick: function() {
				if (this.state.bet!=undefined) {
				    // this.props.stepChangeHandler(1, this.state.bet);
				    console.log("next step!");
				}
			    }.bind(this)
			})
		    ]
		})
	    ]
	});
    }
});
