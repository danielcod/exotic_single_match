var PlaceBetPanel=React.createClass({
    render: function() {
	return React.DOM.div({
	    children: [
		React.createElement(ProcessSteps, {
		    steps: ProcessStepLabels,
		    currentStep: 2
		}),
		React.DOM.p({
		    className: "text-center",
		    style: {
			color: "#888"
		    },
		    children: React.DOM.i({
			children: "Check your bet details and price; enter your size and place your bet!"
		    })
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
				className: "btn btn-secondary",
				style: {
				    width: "100px"
				},
				children: "Re- edit",
				onClick: function() {
				    /*
				    this.props.stepChangeHandler(1, undefined);
				    */
				}.bind(this)
			    }),
			    React.DOM.button({
				className: "btn btn-primary",
				style: {
				    width: "100px"
				},
				children: "Place Bet",
				onClick: function() {
				    this.props.stepChangeHandler(3, undefined);
				}.bind(this)
			    })
			]
		    })
		})
	    ]
	});
    }
});

