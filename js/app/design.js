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
	    query: undefined,
	    selected_product: "mini_leagues", // TEMP
	};
    },
    loadProductsCallback: function(struct) {
	var state=this.state;
	state["products"]=struct;
	this.setState(state);
    },
    loadQueryCallback: function(struct) {
	var state=this.state;
	state["query"]=struct;
	this.setState(state);
    },
    loadError: function(xhr, ajaxOptions, thrownError) {
	console.log(xhr.responseText);
    },
    loadProducts: function() {
	$.ajax({
	    url: "/site/design/products",
	    type: "GET",
	    dataType: "json",
	    success: this.loadProductsCallback,
	    error: this.loadError
	});
    },
    loadQuery: function() {
	$.ajax({
	    url: "/site/design/query",
	    type: "GET",
	    dataType: "json",
	    success: this.loadQueryCallback,
	    error: this.loadError
	});
    },
    componentDidMount: function() {
	this.loadProducts();
	this.loadQuery();
    },
    productChangeHandler: function(value) {
	var state=this.state;
	state["selected_product"]=value;
	this.setState(state);
    },
    render: function() {	
	return React.DOM.div({
	    className: "text-center",
	    style: {
		"margin-bottom": "30px"
	    },
	    children: (this.state.selected_product!=undefined) ? [
		React.createElement(ProductSelect, {
		    options: this.state.products,
		    value: this.state.selected_product,
		    changeHandler: this.productChangeHandler
		}),
		React.createElement(ProductMapping[this.state.selected_product], {})
	    ] : []
	});
    }
});

var Main=function() {
    var page=React.createElement(ProductsForm, {})
    var container=$("div[id='products']")[0];
    ReactDOM.render(page, container);    
};
