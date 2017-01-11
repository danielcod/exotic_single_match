var SingleTeamsForm=React.createClass({
    render: function() {	
	return React.DOM.h3({
	    children: React.DOM.span({
		className: "label label-primary",
		children: "Single Teams Form"
	    })
	});
    }
});

var MiniLeaguesForm=React.createClass({
    render: function() {	
	return React.DOM.h3({
	    children: React.DOM.span({
		className: "label label-warning",
		children: "Mini Leagues Form"
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

var ProductsForm=React.createClass({
    getInitialState: function() {
	return {
	    products: [],
	    bet_type: undefined,
	    bet_query: {}
	};
    },
    initCallback: function(struct) {
	var state=this.state;
	for (var key in struct) {
	    state[key]=struct[key];
	};
	this.setState(state);
    },
    initError: function(xhr, ajaxOptions, thrownError) {
	console.log(xhr.responseText);
    },
    initialise: function(url) {
	$.ajax({
	    url: url,
	    type: "GET",
	    dataType: "json",
	    success: this.initCallback,
	    error: this.initError
	});
    },
    componentDidMount: function() {
	this.initialise("/site/products");
    },
    productChangeHandler: function(value) {
	var state=this.state;
	state["bet_type"]=value;
	this.setState(state);
    },
    render: function() {	
	return React.DOM.div({
	    className: "text-center",
	    style: {
		"margin-bottom": "30px"
	    },
	    children: (this.state.bet_type!=undefined) ? [
		React.createElement(ProductSelect, {
		    options: this.state.products,
		    value: this.state.bet_type,
		    changeHandler: this.productChangeHandler
		}),
		React.createElement(ProductMapping[this.state.bet_type], {})
	    ] : []
	});
    }
});

var Main=function() {
    var page=React.createElement(ProductsForm, {})
    var container=$("div[id='products']")[0];
    ReactDOM.render(page, container);    
};
