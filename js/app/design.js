var BlankSelectOption=[{label: "Select"}];

var AjaxSelect=React.createClass({
    getInitialState: function() {
	return {options: [],
		value: this.props.value};
    },
    loadSuccess: function(struct) {
	var state=this.state;
	state["options"]=[BlankSelectOption].concat(struct);
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
	if (this.props.url!=undefined) {
	    this.loadComponent(this.props.url);
	}
    },
    componentWillReceiveProps: function(nextProps) {	
	if ((nextProps.url!=undefined) && 
	    (this.props.url!=nextProps.url)) {
	    this.loadComponent(nextProps.url);
	}
    },
    render: function() {
	return React.DOM.select({
	    className: "form-control",
	    value: this.state.value,
	    onChange: function(event) {
		var value=event.target.value;
		this.setState({
		    value: value
		});
		this.props.changeHandler(this.props.name, value);
	    }.bind(this),
	    children: this.state.options.map(function(option) {
		return React.DOM.option({
		    value: option.value,
		    children: option.label || option.value
		})
	    })
	});
    }
});

var SingleTeamsForm=React.createClass({
    changeHandler: function(name, value) {
	console.log(name+"="+value);
    },
    render: function() {	
	return React.DOM.div({
	    children: [
		React.createElement(
		    AjaxSelect, {
			name: "league",
			url: '/site/design/leagues',
			value: this.props.league,
			changeHandler: this.changeHandler
		    }),
		React.createElement(
		    AjaxSelect, {
			name: "expiry",
			url: '/site/design/expiries',
			value: this.props.expiry,
			changeHandler: this.changeHandler
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
	return React.DOM.select({
	    className: "form-control",
	    value: this.state.value,
	    onChange: function(event) {
		var value=event.target.value;
		this.setState({
		    value: value
		});
		this.props.changeHandler(value);
	    }.bind(this),
	    children: this.props.options.map(function(option) {
		return React.DOM.option({
		    value: option.name,
		    children: option.label || option.name
		})
	    })
	});
    }
});

var DesignForm=React.createClass({
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
	var url="/site/design/init?product_id="+this.props.product_id;
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
    var page=React.createElement(DesignForm, {
	product_id: productId
    });
    var container=$("div[id='design']")[0];
    ReactDOM.render(page, container);    
};
