var AppProcessStepLabels=[
    "Browse Bets",
    "Edit Bet",
    "Place Bet"
];

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
    initSteps: function(labels, currentStep) {
	var steps=[];
	var width=12/labels.length;
	for (var i=0; i < labels.length; i++) {
	    var label=labels[i];
	    var status;
	    if (i < currentStep) {
		status="complete";
	    } else if (i==currentStep) {
		status="active";
	    } else {
		status="disabled"
	    }
	    var stepArgs={
		width: width,
		step: i+1,
		label: label,
		status: status
	    };
	    var step=React.createElement(AppProcessStep, stepArgs);
	    steps.push(step);
	}
	return steps;
    },
    render: function() {
	return React.DOM.div({
	    className: "row bs-wizard",
	    style: {
		"border-bottom": "0px"
	    },
	    children: this.initSteps(this.props.steps, this.props.currentStep)
	});
    }
});

var AppBrowseBetsPanel=React.createClass({
    render: function() {
	return React.DOM.div({
	    children: [
		React.createElement(AppProcessSteps, {
		    steps: AppProcessStepLabels,
		    currentStep: 0
		})
	    ]
	});
    }
});
			   
var AppEditBetPanel=React.createClass({
    render: function() {
	return React.DOM.div({
	    children: [
		React.createElement(AppProcessSteps, {
		    steps: AppProcessStepLabels,
		    currentStep: 1
		}),
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

var AppPlaceBetPanel=React.createClass({
    render: function() {
	return React.DOM.div({
	    children: [
		React.createElement(AppProcessSteps, {
		    steps: AppProcessStepLabels,
		    currentStep: 2
		})
	    ]
	});
    }
});

var App=React.createClass({
    getInitialState: function() {
	return {
	    currentStep: 0
	}
    },
    render: function() {
	return React.DOM.div({
	    children: [
		React.DOM.div({
		    className: "header clearfix",
		    children: React.DOM.h3({
			children: "Team Exotics Demo"
		    })
		}),
		(this.state.currentStep==0) ? React.createElement(AppBrowseBetsPanel, {
		}) : undefined,
		(this.state.currentStep==1) ? React.createElement(AppEditBetPanel, {
		}) : undefined,
		(this.state.currentStep==2) ? React.createElement(AppPlaceBetPanel, {
		}) : undefined,
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
