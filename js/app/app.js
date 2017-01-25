var ProcessStep=React.createClass({
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

var ProcessSteps=React.createClass({    
    initSteps: function(steps, currentStep) {
	var items=[];
	var width=12/steps.length;
	for (var i=0; i < steps.length; i++) {
	    var label=steps[i].label;
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
	    var step=React.createElement(ProcessStep, stepArgs);
	    items.push(step);
	}
	return items;
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

var App=React.createClass({
    getInitialState: function() {
	return {
	    currentStep: 0,
	    currentProduct: undefined
	}
    },
    stepChangeHandler: function(nextStep, selectedProduct) {
	var state=this.state;
	state.currentStep=nextStep;
	state.currentProduct=selectedProduct;
	this.setState(state);
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
		React.createElement(this.props.steps[this.state.currentStep].klass, {
		    exoticsApi: this.props.exoticsApi,
		    steps: this.props.steps,
		    stepChangeHandler: this.stepChangeHandler,
		    selectedProduct: this.state.currentProduct
		}),
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
    var app=React.createElement(App, {
	exoticsApi: new ExoticsAPI(ajaxErrHandler, false),
	steps: [
	    {
		label: "Browse Bets",
		klass: BrowseProductsPanel
	    },
	    {
		label: "Edit Bet",
		klass: EditProductPanel
	    },
	    {
		label: "Place Bet",
		klass: PlaceBetPanel
	    }
	]
    });
    var parent=$("div[id='app']")[0];
    ReactDOM.render(app, parent);
};
