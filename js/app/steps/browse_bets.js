var BrowseBetsPanel=React.createClass({
    render: function() {
	return React.DOM.div({
	    children: [
		React.createElement(AppProcessSteps, {
		    steps: AppProcessStepLabels,
		    currentStep: 0
		}),
		React.DOM.div({
		    className: "text-center",
		    children: React.DOM.div({
			className: "btn-group",
			style: {
			    "margin-top": "20px"
			},
			children: React.DOM.button({
			    className: "btn btn-primary",
			    style: {
				width: "100px"
			    },
			    children: "Next",
			    onClick: function() {
				this.props.stepChangeHandler(1);
			    }.bind(this)
			})
		    })
		})
	    ]
	});
    }
});
