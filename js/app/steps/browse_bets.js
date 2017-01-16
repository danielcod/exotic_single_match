var BrowseBetsRow=React.createClass({
    render: function() {
	return React.DOM.tr({
	    onClick: function() {
		this.props.clickHandler(this.props.id);
	    }.bind(this),
	    style: (this.props.id==this.props.selectedId) ? {
		"background-color": "#88F"
	    } : {},
	    children: [
		React.DOM.td({
		    children: this.props.description
		}),
		React.DOM.td({
		    className: "text-center",			    
		    children: this.props.price
		})
	    ]
	});
    }
});

var BrowseBetsTable=React.createClass({
    getInitialState: function() {
	return {
	    selectedId: undefined
	};
    },
    handleClicked: function(id) {
	var state=this.state;
	state.selectedId=id;
	this.setState(state);
    },
    render: function() {
	return React.DOM.table({
	    className: "table table-condensed table-bordered table-striped",
	    children: React.DOM.tbody({
		children: [
		    React.createElement(BrowseBetsRow, {
			description: "Hello World",
			price: "1.234",
			id: "foobar",
			selectedId: this.state.selectedId,
			clickHandler: this.handleClicked
		    }),
		    React.createElement(BrowseBetsRow, {
			description: "How Now Brown Cow",
			price: "5.678",
			id: "poobar",
			selectedId: this.state.selectedId,
			clickHandler: this.handleClicked			
		    })
		]
	    })
	})
    }
});

var BrowseBetsPanel=React.createClass({
    render: function() {
	return React.DOM.div({
	    children: [
		React.createElement(ProcessSteps, {
		    steps: ProcessStepLabels,
		    currentStep: 0
		}),
		React.createElement(BrowseBetsTable, {
		}),
		React.DOM.div({
		    className: "text-center",
		    children: React.DOM.div({
			className: "btn-group",
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
