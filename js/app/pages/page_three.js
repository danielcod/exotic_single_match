var PlaceBetPanel=React.createClass({
    getInitialState: function() {
	return {
	    confirmMessage: undefined,
	    bet: this.props.bet,
	    size: 2
	};
    },
    formatPrice: function(probability) {
	return (1/Math.min(0.99, Math.max(0.01, probability))).toFixed(2);
    },
    showBetHandler: function(struct) {
	var state=this.state;
	state.bet.probability=struct.probability;
	state.bet.description=struct.description;
	this.setState(state);
    },
    componentDidMount: function() {
	this.props.exoticsApi.fetchPrice(this.props.bet, this.showBetHandler);
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
		(this.state.bet!=undefined) ? [
		    React.DOM.h2({			
			className: "heading text-center",
			children: [
			    this.state.bet.description.selection,
			    React.DOM.small({
				className: "text-center",
				dangerouslySetInnerHTML: {
				    "__html": this.state.bet.description.market
				}
			    })
			]
		    }),
		    (this.state.confirmMessage==undefined) ? React.DOM.div({
			className: "form-group",
			children: React.DOM.h3({
			    className: "current-price text-center",
			    style: {
				margin: "0 0 10px"
			    },
			    children: [
				"Your price: ",
				React.DOM.span({
				    children: this.formatPrice(this.state.bet.probability)
				})					
			    ]				    
			})
		    }) : React.DOM.div({
			className: "form-group",
			children: React.DOM.h3({
			    className: "current-price text-center",
			    style: {
				margin: "0 0 10px"
			    },
			    children: [
				React.DOM.span({
				    style: {
					color: "#FFF"
				    },
				    children: "£"+this.state.size+" @ "
				}),
				React.DOM.span({
				    children: this.formatPrice(this.state.bet.probability)
				})
			    ]
			})
		    })
		] : undefined,
		(this.state.confirmMessage==undefined) ? React.DOM.form({
		    className: "form-horizontal",
		    children: React.DOM.div({
			className: "form-group",
			children: [
			    React.DOM.label({
				className: "col-xs-12 text-center control-label",
				children: "Your size"
			    }),
			    React.DOM.div({
				className: "col-xs-8 col-xs-offset-2",
				children: React.createElement(MyNumberInput, {
				    min: 2,
				    max: 1000,
				    value: this.state.size,
				    changeHandler: this.sizeChangeHandler
				})			 
			    })
			]			     
		    })
		}) : undefined,
		(this.state.confirmMessage!=undefined) ? React.DOM.div({
		    className: "alert alert-success",
		    children: [
			React.DOM.i({
			    className: "glyphicon glyphicon-ok"
			}),
			this.state.confirmMessage
		    ]
		}) : undefined,
		(this.state.confirmMessage==undefined) ? React.DOM.div({
		    className: "text-center",
		    style: {
			margin: "5px 0 20px"
		    },		    
		    children: [
			React.DOM.button({
			    className: "btn btn-secondary",
			    style: {
				width: "100px",
				"margin-right": "3px"
			    },
			    children: "Cancel",
			    onClick: function() {
				this.props.stepChangeHandler(1, this.state.bet);
			    }.bind(this)
			}),
			React.DOM.button({
			    className: "btn btn-primary",
			    style: {
				width: "100px",
				"margin-left": "3px"
			    },
			    children: "Place Bet",
			    onClick: function() {
				var state=this.state;
				state.confirmMessage="Your bet has been placed!";
				this.setState(state);
			    }.bind(this)
			})
		    ]
		}) : React.DOM.div({
		    className: "text-center",
		    children: React.DOM.div({
			className: "text-center",
			style: {
			    margin: "5px 0 20px"
			},			
			children: React.DOM.button({
			    className: "btn btn-primary",
			    children: "Bet Again",
			    onClick: function() {
				var state=this.state;
				state.confirmMessage=undefined; // NB
				this.setState(state);
				this.props.stepChangeHandler(0, undefined);
			    }.bind(this)
			})
		    })
		})
	    ]
	});
    }
});

