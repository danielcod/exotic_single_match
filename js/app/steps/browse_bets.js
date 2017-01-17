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
	    selectedId: undefined,
	    bets: []
	};
    },
    loadSuccess: function(struct) {
	var state=this.state;
	state.bets=struct;
	this.setState(state);
    },
    loadError: function(xhr, ajaxOptions, thrownError) {
	console.log(xhr.responseText);
    },
    loadComponent: function(url) {
	$.ajax({
	    url: url,
	    type: "GET",
	    dataType: "json",
	    success: this.loadSuccess,
	    error: this.loadError
	});
    },
    componentDidMount: function() {
	this.loadComponent("/app/products/list");
    },
    handleClicked: function(id) {
	var state=this.state;
	state.selectedId=id;
	this.setState(state);
	this.props.clickHandler(id);
    },	
    render: function() {
	return React.DOM.table({
	    className: "table table-condensed table-bordered table-striped",
	    children: React.DOM.tbody({
		children: this.state.bets.map(function(bet) {
		    return React.createElement(BrowseBetsRow, {
			description: bet.description,
			price: bet.price,
			id: bet.id,
			selectedId: this.state.selectedId,
			clickHandler: this.handleClicked
		    });
		}.bind(this))
	    })
	});
    }
});

var BrowseBetsPanel=React.createClass({
    getInitialState: function() {
	return {
	    selectedId: undefined
	};
    },
    handleClicked: function(id) {
	var state=this.state;
	state.selectedId=id;
	this.setState(state);
	console.log("id="+id); // TEMP	
    },
    render: function() {
	return React.DOM.div({
	    children: [
		React.createElement(ProcessSteps, {
		    steps: ProcessStepLabels,
		    currentStep: 0
		}),		
		React.DOM.p({
		    className: "text-center",
		    style: {
			color: "#888"
		    },
		    children: React.DOM.i({
			children: "Select a product that looks interesting, and click 'Next' to either edit it or to place a bet"
		    })
		}),
		React.createElement(BrowseBetsTable, {
		    clickHandler: this.handleClicked
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