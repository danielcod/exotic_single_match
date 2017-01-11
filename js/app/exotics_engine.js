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

var SimpleSelect=React.createClass({
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
    loadProductsSuccess: function(struct) {
	console.log(JSON.stringify(struct));
    },
    loadProductsError: function(xhr, ajaxOptions, thrownError) {
	console.log(xhr.responseText);
    },
    loadProducts: function(url) {
	$.ajax({
	    url: url,
	    type: "GET",
	    dataType: "json",
	    success: this.loadProductsSuccess,
	    error: this.loadProductsError
	});
    },
    componentDidMount: function() {
	this.loadProducts("/site/products/list");
    },
    render: function() {	
	return React.DOM.div({	    
	    className: "text-center",
	    style: {
		"margin-bottom": "30px"
	    },
	    children: [
		React.createElement(SimpleSelect, {
		    options: [
			{name: "Hello"}
		    ]
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
