var AppPriceSpan=React.createClass({
    render: function() {
	return React.DOM.h3({
	    className: "text-center",
	    style: {
		color: "#888",
		"margin-bottom": "20px"			
	    },
	    children: React.DOM.i({
		children: [
		    "Your price: ",
		    React.DOM.span({
			id: "price",
			children: "[..]"
		    })
		]
	    })			
	});	
    }
});

var AppStageTwoPanel=React.createClass({
    render: function() {
	return React.DOM.div({
	    children: [
		React.createElement(AppPriceSpan, {}),
		React.createElement(ProductForm, {})
	    ]
	});
    }
});

var App=React.createClass({
    render: function() {
	return React.DOM.div({
	    children: [
		React.createElement(AppStageTwoPanel, {})
	    ]
	})
    }
});


var Main=function() {
    var app=React.createElement(App, {});
    var parent=$("div[id='app']")[0];
    ReactDOM.render(app, parent);
};
