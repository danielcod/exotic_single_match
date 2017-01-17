var BrowseBetsRow=React.createClass({
    render: function() {
	return React.DOM.tr({
	    onClick: function() {
		this.props.clickHandler(this.props.bet);
	    }.bind(this),
	    style: ((this.props.selectedBet!=undefined) &&
		    (this.props.bet.id==this.props.selectedBet.id)) ? {
		"background-color": "#8FA"
	    } : {},
	    children: [
		React.DOM.td({
		    children: this.props.bet.description
		}),
		React.DOM.td({
		    className: "text-center",			    
		    children: this.props.bet.price
		})
	    ]
	});
    }
});

var BrowseBetsTable=React.createClass({
    getInitialState: function() {
	return {
	    selectedBet: undefined,
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
    handleClicked: function(bet) {
	var state=this.state;
	state.selectedBet=bet;
	this.setState(state);
	this.props.clickHandler(bet);
    },	
    render: function() {
	return React.DOM.table({
	    className: "table table-condensed table-bordered table-striped",
	    children: React.DOM.tbody({
		children: this.state.bets.map(function(bet) {
		    return React.createElement(BrowseBetsRow, {
			bet: bet,
			selectedBet: this.state.selectedBet,
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
	    selectedBet: undefined
	};
    },
    handleClicked: function(bet) {
	var state=this.state;
	state.selectedBet=bet;
	this.setState(state);
	console.log(JSON.stringify(bet));
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
