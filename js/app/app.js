var AppProcessStep=React.createClass({
    render: function() {
	return React.DOM.div({
	    className: "col-xs-"+this.props.width+" bs-wizard-step "+this.props.status,
	    children: [
		React.DOM.div({
		    className: "text-center bs-wizard-stepnum",
		    children: "Step "+this.props.step
		}),
		React.DOM.div({
		    className: "progress",
		    children: React.DOM.div({
			className: "progress-bar"
		    })
		}),
		React.DOM.a({
		    href: "#",
		    className: "bs-wizard-dot"
		}),
		React.DOM.div({
		    className: "bs-wizard-info text-center",
		    children: this.props.label
		})
	    ]
	});
    }
});

var AppProcessSteps=React.createClass({
    render: function() {
	return React.DOM.div({
	    className: "row bs-wizard",
	    style: {
		"border-bottom": "0px"
	    },
	    children: [
		React.createElement(AppProcessStep, {
		    width: 4,
		    step: 1,
		    label: "Browse Bets",
		    status: "complete"
		}),
		React.createElement(AppProcessStep, {
		    width: 4,
		    step: 2,
		    label: "Edit Bet",
		    status: "active"
		}),
		React.createElement(AppProcessStep, {
		    width: 4,
		    step: 3,
		    label: "Place Bet",
		    status: "disabled"
		})
	    ]
	})
    }
});

var AppStageTwoPanel=React.createClass({
    render: function() {
	return React.DOM.div({
	    children: [
		React.createElement(AppProcessSteps, {}),
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
		    style: {
			"margin-top": "20px"
		    },
		    children: React.DOM.p({
			children: React.DOM.h5({
			    dangerouslySetInnerHTML: {
				"__html": "&copy; ioSport 2017"
			    }
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
