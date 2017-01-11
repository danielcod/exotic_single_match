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

var ProductSelect=React.createClass({
    render: function() {
	return React.DOM.select({
	    className: "form-control",
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
	    products: []
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
	this.initialise("/site/products/init");
    },
    render: function() {	
	return React.DOM.div({	    
	    className: "text-center",
	    style: {
		"margin-bottom": "30px"
	    },
	    children: [
		React.createElement(ProductSelect, {
		    options: this.state.products
		}),
		React.createElement(MiniLeaguesForm, {})
	    ]
	});
    }
});

var Main=function() {
    var page=React.createElement(ProductsForm, {})
    var container=$("div[id='products']")[0];
    ReactDOM.render(page, container);    
};
