var PlaceBetPanel=React.createClass({
    render: function() {
	return React.DOM.div({
	    children: [
		React.createElement(ProcessSteps, {
		    steps: ProcessStepLabels,
		    currentStep: 2
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
				    width: "120px"
				},
				children: "Cancel",
				onClick: function() {
				    this.props.stepChangeHandler(0);
				}.bind(this)
			    }),
			    React.DOM.button({
				className: "btn btn-primary",
				style: {
				    width: "120px"
				},
				children: "Place Bet",
				onClick: function() {
				    this.props.stepChangeHandler(0);
				}.bind(this)
			    })
			]
		    })
		})
	    ]
	});
    }
});

