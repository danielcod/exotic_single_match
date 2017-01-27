var PlaceBetPanel=React.createClass({
    getInitialState: function() {
	return {
	    confirmMessage: undefined,
	    buttonMessage: "Place Bet",
	    params: undefined,
	    size: 2
	};
    },
    showProductHandler: function(struct) {
	var state=this.state;
	state.params=struct;
	this.setState(state);
    },
    componentDidMount: function() {
	this.props.exoticsApi.fetchPrice(this.props.initialProduct, this.showProductHandler);
    },
    sizeChangeHandler: function(size) {
	var state=this.state;
	state.size=size;
	this.setState(state);
    },
    render: function() {
	return React.DOM.div({
	    children: [
		React.createElement(ProcessSteps, {
		    steps: this.props.steps,
		    currentStep: 2
		}),
		(this.state.params!=undefined) ? React.DOM.h3({
		    className: "text-center",
		    style: {
			color: "#888",
			"margin-top": "20px"
		    },
		    children: React.DOM.h3({
			children: [
			    React.DOM.b({
				style: {
				    "margin-right": "5px"
				},
				children: this.state.params.description.selection
			    }),
			    React.DOM.span({
				children: this.state.params.description.market
			    })
			]
		    })
		}) : undefined,
		(this.state.params!=undefined) ? React.DOM.h3({
		    className: "text-center",
		    style: {
			color: "#888",
			"margin-top": "20px"
		    },
		    children: React.DOM.i({
			children: React.DOM.b({
			    children: "Your price: "+this.state.params.price
			})
		    })
		}) : undefined,
		(this.state.confirmMessage!=undefined) ? React.DOM.h3({
		    className: "text-center",
		    style: {
			color: "#888",
			"margin-top": "20px"
		    },
		    children: React.DOM.i({
			children: React.DOM.b({
			    children: this.state.confirmMessage
			})
		    })    
		}) : undefined,
		React.DOM.div({
		    className: "form-group",
		    children: [
			React.DOM.label({
			    children: "Your size"
			}),
			React.createElement(MyNumberInput, {
			    value: this.state.size,
			    changeHandler: this.sizeChangeHandler
			})
		    ]
		}),
		React.DOM.div({
		    className: "text-center",
		    children: React.DOM.div({
			className: "btn-group",
			style: {
			    "margin-top": "20px"
			},
			children: [
			    React.DOM.button({
				className: "btn btn-secondary",
				style: {
				    width: "100px"
				},
				children: "Cancel",
				onClick: function() {
				    this.props.stepChangeHandler(0, undefined);
				}.bind(this)
			    }),
			    React.DOM.button({
				className: "btn btn-primary",
				style: {
				    width: "100px"
				},
				children: this.state.buttonMessage,
				onClick: function() {
				    if (this.state.confirmMessage==undefined) {
					var state=this.state;
					state.confirmMessage="Your bet has been placed!";
					state.buttonMessage="Start Again";
					this.setState(state);
				    } else {
					this.props.stepChangeHandler(0, undefined);
				    }
				}.bind(this)
			    })
			]
		    })
		})
	    ]
	});
    }
});

