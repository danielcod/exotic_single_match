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
		((this.state.params!=undefined) &&
		 (this.state.confirmMessage==undefined)) ? [
		     React.DOM.h3({			
			 className: "text-center",
			 children: React.DOM.b({
			     children: this.state.params.description.selection
			 })
		     }),		    
		     React.DOM.h3({
			 className: "text-center",			
			 children: this.state.params.description.market
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
		     }),
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
		     })	    
		 ] : undefined,
		(this.state.confirmMessage!=undefined) ? React.DOM.h3({
		    className: "text-center",
		    children: React.DOM.i({
			children: React.DOM.b({
			    children: this.state.confirmMessage
			})
		    })    
		}) : undefined,
		(this.state.confirmMessage==undefined) ? React.DOM.div({
		    className: "text-center",
		    children: React.DOM.div({
			className: "btn-group",
			children: [
			    React.DOM.button({
				className: "btn btn-secondary",
				children: "Cancel",
				onClick: function() {
				    this.props.stepChangeHandler(0, undefined);
				}.bind(this)
			    }),
			    React.DOM.button({
				className: "btn btn-primary",
				children: "Place Bet",
				onClick: function() {
				    var state=this.state;
				    state.confirmMessage="Your bet has been placed!";
				    this.setState(state);
				}.bind(this)
			    })
			]
		    })
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

