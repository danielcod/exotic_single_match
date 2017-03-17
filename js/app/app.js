var ProcessStep=React.createClass({
    render: function() {
	return React.DOM.div({
	    className: "col-xs-"+this.props.width+" bs-wizard-step "+this.props.status,
	    children: [
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
	    children: this.initSteps(this.props.steps, this.props.currentStep)
	});
    }
});

var App=React.createClass({
    getInitialState: function() {
	return {
	    currentStep: 0,
	    currentBet: undefined
	}
    },
    stepChangeHandler: function(nextStep, selectedBet) {
	var state=this.state;
	state.currentStep=nextStep;
	state.currentBet=selectedBet;
	this.setState(state);
    },    
    render: function() {
	return React.DOM.div({
	    children: [
		React.DOM.div({
		    className: "header clearfix",
		    children: React.DOM.h1({
			children: "Team Exotics"
		    })
		}),
		React.createElement(this.props.steps[this.state.currentStep].klass, {
		    exoticsApi: this.props.exoticsApi,
		    steps: this.props.steps,
		    stepChangeHandler: this.stepChangeHandler,
		    initialBet: this.state.currentBet
		}),
		React.DOM.footer({
		    className: "footer",
		    children: [
			"Powered by",
			React.DOM.img({
			    className: "img-responsive",
			    src: "img/iosport.png",
			    alt: "ioSport"			    
			})
		    ]
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
		label: "Browse",
		klass: BrowseBetsPanel
	    },
	    {
		label: "Edit",
		klass: EditBetPanel
	    },
	    {
		label: "Bet",
		klass: PlaceBetPanel
	    }
	]
    });
    var parent=$("div[id='app']")[0];
    ReactDOM.render(app, parent);
};
