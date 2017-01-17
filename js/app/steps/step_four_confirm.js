var BetConfirmationPanel=React.createClass({
    render: function() {
	return React.DOM.div({
	    children: [
		React.createElement(ProcessSteps, {
		    steps: ProcessStepLabels,
		    currentStep: 3
		}),
		React.DOM.h3({
		    className: "text-center",
		    style: {
			color: "#888",
			"margin-top": "20px"
		    },
		    children: React.DOM.i({
			children: React.DOM.b({
			    children: "Your bet has been placed!"
			})
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
				className: "btn btn-primary",
				style: {
				    width: "100px"
				},
				children: "Return",
				onClick: function() {
				    this.props.stepChangeHandler(0, undefined);
				}.bind(this)
			    })
			]
		    })
		})
	    ]
	});
    }
});

