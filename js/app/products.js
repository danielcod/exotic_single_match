var AjaxSelect=React.createClass({
    getInitialState: function() {
	return {
	    target_value: this.props.value
	}
    },
    formatValue: function(value) {
	return (value!='') ? value : undefined;
    },
    updateValue: function(value) {
	var state=this.state
	state.target_value=value;
	this.setState(state);
    },
    render: function() {
	return React.DOM.div({
	    className: "form-group",
	    children: [
		React.DOM.label({
		    children: this.props.label
		}),
		React.DOM.select({
		    className: "form-control",
		    value: this.state.target_value,
		    onChange: function(event) {
			var value=this.formatValue(event.target.value);
			this.updateValue(value);
		    }.bind(this),
		    children: this.props.options.map(function(option) {
			return React.DOM.option({
			    value: option.value,
			    children: option.label || option.value
			})
		    })
		})
	    ]
	});		
    }
});

var SingleTeamsForm=React.createClass({
    getInitialState: function() {
	return {
	    params: this.props.params
	};
    },
    loadOptionsSuccess: function(name, struct) {
	console.log(name+" -> "+JSON.stringify(struct));
    },
    loadOptionsError: function(xhr, ajaxOptions, thrownError) {
	console.log(xhr.responseText);
    },
    loadOptions: function(name, url) {
	$.ajax({
	    url: url,
	    type: "GET",
	    dataType: "json",
	    success: function(struct) {
		this.loadOptionsSuccess(name, struct);
	    }.bind(this),
	    error: this.loadOptionsError
	});
    },
    componentDidMount: function() {
	this.loadOptions("leagues", "/api/leagues");
	this.loadOptions("teams", "/api/teams?league="+this.state.params.league);
	this.loadOptions("payoffs", "/api/products/payoff?product=single_teams&league="+this.state.params.league);
	this.loadOptions("expiries", "/api/expiries");
    },
    render: function() {
	return React.DOM.div({
	    className: "text-center",
	    children: React.DOM.h3({
		children: "[Single Teams form goes here]"
	    })
	});
    }
});

var MiniLeaguesForm=React.createClass({
    render: function() {
	return React.DOM.div({
	    className: "text-center",
	    children: React.DOM.h3({
		children: "[Mini Leagues form goes here]"
	    })
	});
    }
});

var ProductMapping={
    "single_teams": SingleTeamsForm,
    "mini_leagues": MiniLeaguesForm
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
	    product: undefined
	};
    },
    loadSuccess: function(struct) {
	var state=this.state;
	for (var key in struct) {
	    state[key]=struct[key];
	}
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
	var url="/site/products/init?product_id="+this.props.product_id;
	this.loadComponent(url);
    },
    productChangeHandler: function(value) {
	var state=this.state;
	state["product"]={
	    type: value,
	    query: {}
	};
	this.setState(state);
    },
    render: function() {
	return React.DOM.div({
	    children: (this.state.product!=undefined) ? [
		React.createElement(ProductSelect, {
		    options: this.state.products,
		    value: this.state.product.type,
		    changeHandler: this.productChangeHandler
		}),
		React.createElement(ProductMapping[this.state.product.type], {
		    params: this.state.product.query
		})
	    ] : []
	});
    }
});

var Main=function() {
    var productId=$("input[name='product_id']").val();
    var productForm=React.createElement(ProductForm, {
	product_id: productId
    });
    var parent=$("div[id='products']")[0];
    ReactDOM.render(productForm, parent);    
};
