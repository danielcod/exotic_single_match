var AppStageTwoPanel=React.createClass({
    render: function() {
	return React.DOM.div({
	    children: [
		React.DOM.h3({
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
		}),	
		React.createElement(ProductForm, {})
	    ]
	});
    }
});

var App=React.createClass({
    render: function() {
	return React.DOM.div({
	    children: [
		React.DOM.div({
		    className: "header clearfix",
		    children: React.DOM.h3({
			children: "Team Exotics Demo"
		    })
		}),
		React.createElement(AppStageTwoPanel, {}),
		React.DOM.footer({
		    className: "footer",
		    children: React.DOM.p({
			children: React.DOM.h5({
			    children: "&copy;ioSport 2017"
			})
		    })
		})
	    ]
	})
    }
});


var Main=function() {
    var app=React.createElement(App, {});
    var parent=$("div[id='app']")[0];
    ReactDOM.render(app, parent);
};
