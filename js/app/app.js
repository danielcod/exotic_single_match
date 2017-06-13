var App=React.createClass({
    getInitialState: function() {
	return {
	    step: 0,
	    bet: undefined
	}
    },
    stepChangeHandler: function(step, bet) {
	var state=this.state;
	state.step=step;
	state.bet=bet;
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
		React.createElement(this.props.steps[this.state.step].klass, {
		    exoticsApi: this.props.exoticsApi,
		    steps: this.props.steps,
		    stepChangeHandler: this.stepChangeHandler,
		    bet: this.state.bet
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

var ajaxErrHandler=function(xhr, ajaxOptions, thrownError) {
    console.log(xhr.responseText);    
};

var Main=function() {
    var app=React.createElement(App, {
	exoticsApi: new ExoticsAPI(ajaxErrHandler, false),
	steps: [
	    {
		label: "Edit",
		klass: EditBetPanel
	    }
	]
    });
    var parent=$("div[id='app']")[0];
    ReactDOM.render(app, parent);
};
