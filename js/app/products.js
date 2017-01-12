/*
  weird things happen if you use value=undefined; code will send label as value rather than an undefined value; so set value='' and then convert at changeHandler level
*/

var BlankSelectOption={label: "Select",
		       value: ""};

/*
  NB there's difference here between 'target_value' and 'visible value'
  the two may not be the same because target_value may not be present in options
  if target_value isn't part of options then the select will automatically show the first option, which in this case is structured to be the blank option
*/

var AjaxSelect=React.createClass({
    getInitialState: function() {
	return {options: [BlankSelectOption],
		target_value: this.props.value,
		visible_value: undefined};
    },
    loadSuccess: function(struct) {
	var state=this.state;
	state["options"]=[BlankSelectOption].concat(struct);
	state["visible_value"]=this.filterVisibleValue(struct);
	this.setState(state);
	this.setBlankOptionDisabled(this.state.visible_value!=undefined);
	this.props.changeHandler(this.props.name, this.state.visible_value);
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
	if (this.props.url!=undefined) {
	    this.loadComponent(this.props.url);
	}
    },
    componentWillReceiveProps: function(nextProps) {
	// check for new url
	if ((nextProps.url!=undefined) && 
	    (this.props.url!=nextProps.url)) {
	    // console.log(nextProps.url);
	    this.loadComponent(nextProps.url);
	}
	// check for new id
	if (this.props.id!=nextProps.id) {
	    this.updateValue(this.props.value);
	}
    },
    filterVisibleValue: function(struct) {
	var items=struct.filter(function(item) {
	    return item.value==this.state.target_value;
	}.bind(this));
	return (items.length > 0) ? this.state.target_value : undefined;
    },
    shallHighlight: function() {
	return this.state.visible_value==undefined;
    },
    formatValue: function(value) {
	return (value!='') ? value : undefined;
    },
    updateValue: function(value) {
	// console.log("Setting "+this.props.name+" target_value to "+value);
	var state=this.state
	state.target_value=value;
	state.visible_value=value;
	this.setState(state);
	this.setBlankOptionDisabled(true);
	this.props.changeHandler(this.props.name, value);
    },
    setBlankOptionDisabled: function(bool) {
	$(ReactDOM.findDOMNode(this)).find("option:first").attr("disabled", bool);
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
		    style: this.shallHighlight() ? {
			border: "3px solid #F88"
		    } : {},
		    onChange: function(event) {
			var value=this.formatValue(event.target.value);
			this.updateValue(value);
		    }.bind(this),
		    children: this.state.options.map(function(option) {
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
	    id: 1e10*Math.random(),
	    params: {},
	    price: undefined
	};
    },
    isComplete: function(params) {
	return ((params.league!=undefined) &&
		(params.team!=undefined) &&
		(params.payoff!=undefined) &&
		(params.expiry!=undefined));
    },
    fetchPriceSuccess: function(struct) {
	var state=this.state;
	state.price=struct.decimal_price;
	this.setState(state);
    },
    fetchPriceError: function(xhr, ajaxOptions, thrownError) {
	console.log(xhr.responseText);
    },
    fetchPrice: function(params) {
	var struct={"product": "single_teams",
		    "query": params};
	$.ajax({
	    type: "POST",
	    url: "/site/pricing",
	    data: JSON.stringify(struct),
	    contentType: "application/json",
	    dataType: "json",
	    success: this.fetchPriceSuccess,
	    error: this.fetchPriceError
	});
    },
    changeHandler: function(name, value) {
	var state=this.state;
	if (state.params[name]!=value) {
	    state.price=undefined;
	    state.params[name]=value;
	    if (name=="league") {
		state.params.team=undefined; 
		state.params.payoff=undefined;
	    };
	    this.setState(state);
	    if (this.isComplete(state.params)) {
		this.fetchPrice(state.params);
	    };
	}
    },
    initTeamsUrl: function(params) {
	return (params.league!=undefined) ? "/api/teams?league="+params.league : undefined;
    },
    initPayoffsUrl: function(params) {
	return (params.league!=undefined) ? "/site/products/single_teams/payoff?league="+params.league : undefined;
    },
    reset: function() {
	var state=this.state;
	state.id=1e10*Math.random();
	this.setState(state);
    },
    render: function() {	
	return React.DOM.div({
	    children: [
		React.DOM.div({
		    className: "row",
		    children: [
			React.DOM.div({
			    className: "col-xs-3"
			}),
			React.DOM.div({
			    className: "col-xs-6",
			    children: [
				React.DOM.h3({
				    className: "text-center",
				    style: {
					"color": "#888",
					"margin-bottom": "20px",
				    },
				    children: React.DOM.i({
					children: [
					    "Your price: ",
					    React.DOM.span({
						children: this.state.price || "[..]"
					    })
					]
				    })
				}),		
				React.createElement(
				    AjaxSelect, {
					label: "League",
					name: "league",
					url: '/api/leagues',
					value: this.props.league,
					changeHandler: this.changeHandler,
					id: this.state.id
				    }),
				React.createElement(
				    AjaxSelect, {
					label: "Team",
					name: 'team',
					url: this.initTeamsUrl(this.state.params),
					value: this.props.team,
					changeHandler: this.changeHandler,
					id: this.state.id
				    }),
				React.createElement(
				    AjaxSelect, {
					label: "Payoff",
					name: 'payoff',
					url: this.initPayoffsUrl(this.state.params),
					value: this.props.payoff,
					changeHandler: this.changeHandler,
					id: this.state.id
				    }),
				React.createElement(
				    AjaxSelect, {
					label: "Expiry",
					name: "expiry",
					url: '/api/expiries',
					value: this.props.expiry,
					changeHandler: this.changeHandler,
					id: this.state.id
				    }),
				React.DOM.div({
				    className: "text-right",
				    children: [
					React.DOM.button({
					    className: "btn btn-danger",
					    children: "Reset",
					    onClick: this.reset
					})
				    ]
				})
			    ]
			}),
			React.DOM.div({
			    className: "col-xs-3"
			})
		    ]
		})
	    ]
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
		React.createElement(ProductMapping[this.state.product.type], this.state.product.query)
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
