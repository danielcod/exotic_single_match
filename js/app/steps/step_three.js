var PlaceBetPanel=React.createClass({
    getInitialState: function() {
	return {
	    confirmMessage: undefined,
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
		(this.state.params!=undefined) ? [
		    React.DOM.h2({			
			className: "heading text-center",
			children: [
			    this.state.params.description.selection,
			    React.DOM.small({
				className: "text-center",			
				children: this.state.params.description.market
			    })
			]
		    }),
		    React.DOM.div({
			className: "row",
			children: React.DOM.div({
			    className: "col-xs-12",
			    children: React.DOM.div({
				className: "form-group",
				children: React.DOM.h3({
				    className: "current-price text-center",
				    style: {
					margin: "0 0 10px"
				    },
				    children: [
					"Your price: ",
					React.DOM.span({
					    children: this.state.params.price
					})					
				    ]				    
				})
			    })
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
		    children: [
			React.DOM.button({
			    className: "btn btn-secondary",
			    style: {
				width: "100px",
				"margin-right": "3px"
			    },
			    children: "Cancel",
			    onClick: function() {
				this.props.stepChangeHandler(0, undefined);
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
			className: "btn-group",
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

