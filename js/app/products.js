/*
  blank option must have option '', then be converted to undefined
  if you set value=undefined, will use label/child text as value
*/

var SimpleSelect=React.createClass({
    getInitialState: function() {
	return {
	    options: this.props.options,
	    value: this.props.value
	}
    },
    componentWillReceiveProps: function(nextProps) {
	var filterValues=function(struct) {
	    return struct.map(function(item) {
		return item.value;
	    }).join(";");
	};
	var state=this.state;
	var updated=false;
	// update options
	var optionsKey=filterValues(this.state.options);
	var newOptionsKey=filterValues(nextProps.options);
	if (optionsKey!=newOptionsKey) {
	    state.options=nextProps.options;
	    updated=true;
	}
	// update value
	if (this.state.value!=nextProps.value) {
	    state.value=nextProps.value;
	    updated=true;
	}
	// update
	if (updated) {
	    this.setState(state);
	}
    },
    formatValue: function(value) {
	return (value!='') ? value : undefined;
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
		    value: this.state.value,
		    style: (this.state.value==undefined) ? {
			border: "3px solid #F88"
		    } : {},
		    onChange: function(event) {
			var value=this.formatValue(event.target.value); // NB
			var state=this.state
			state.value=value;
			this.setState(state);
			this.props.changeHandler(this.props.name, value);
		    }.bind(this),
		    children: [
			React.DOM.option({
			    value: '', // NB
			    children: "Select"
			}),
			this.state.options.map(function(option) {
			    return React.DOM.option({
				value: option.value,
				children: option.label || option.value
			    })
			})
		    ]
		})
	    ]
	});		
    }
});

var SingleTeamsForm=React.createClass({
    initOptions: function(params) {
	var options={};
	for (var key in params) {
	    options[key]=[];
	};
	return options;
    },
    getInitialState: function() {
	return {
	    options: this.initOptions(this.props.params),
	    params: this.props.params
	};
    },
    loadSuccess: function(name, struct) {
	var state=this.state;
	state.options[name]=struct;
	this.setState(state);	
    },
    loadError: function(xhr, ajaxOptions, thrownError) {
	console.log(xhr.responseText);
    },
    loadOptions: function(name, url) {
	$.ajax({
	    url: url,
	    type: "GET",
	    dataType: "json",
	    success: function(struct) {
		this.loadSuccess(name, struct);
	    }.bind(this),
	    error: this.Error
	});
    },
    teamsUrl: function(params) {
	return "/api/teams?league="+params.league;
    },
    payoffsUrl: function(params) {
	return "/api/products/payoffs?product=single_teams&league="+params.league;
    },
    componentDidMount: function() {
	this.loadOptions("league", "/api/leagues");
	this.loadOptions("team", this.teamsUrl(this.state.params));
	this.loadOptions("payoff", this.payoffsUrl(this.state.params));
	this.loadOptions("expiry", "/api/expiries");
    },
    changeHandler: function(name, value) {
	if (this.state.params[name]!=value) {
	    var state=this.state;
	    state.params[name]=value;
	    if (name=="league") {
		// team
		state.options.team=[];
		state.params.team=undefined;
		this.loadOptions("team", this.teamsUrl(state.params));
		// payoff
		state.options.payoff=[];
		state.params.payoff=undefined;
		this.loadOptions("payoff", this.payoffsUrl(state.params));
	    };
	    this.setState(state);
	    console.log(JSON.stringify(this.state.params)); // TEMP
	}
    },
    render: function() {
	return React.DOM.div({
	    children: [
		React.createElement(
		    SimpleSelect, {
			label: "League",
			name: "league",
			options: this.state.options.league,
			value: this.state.params.league,
			changeHandler: this.changeHandler
		    }),
		React.createElement(
		    SimpleSelect, {
			label: "Team",
			name: "team",
			options: this.state.options.team,
			value: this.state.params.team,
			changeHandler: this.changeHandler
		    }),
		React.createElement(
		    SimpleSelect, {
			label: "Payoff",
			name: "payoff",
			options: this.state.options.payoff,
			value: this.state.params.payoff,
			changeHandler: this.changeHandler
		    }),
		React.createElement(
		    SimpleSelect, {
			label: "Expiry",
			name: "expiry",
			options: this.state.options.expiry,
			value: this.state.params.expiry,
			changeHandler: this.changeHandler
		    })
	    ]
	})
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
