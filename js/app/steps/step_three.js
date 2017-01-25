var PlaceBetPanel=React.createClass({
    getInitialState: function() {
	return {
	    selectedProduct: undefined,
	    size: 2
	};
    },
    showProductHandler: function(struct) {
	var state=this.state;
	state.selectedProduct=deepCopy(struct);
	this.setState(state);
    },
    componentDidMount: function() {
	this.props.exoticsApi.showProduct(this.props.selectedProduct.type, this.props.selectedProduct.id, this.showProductHandler);
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
		React.DOM.p({
		    className: "text-center",
		    style: {
			color: "#888"
		    },
		    children: React.DOM.i({
			children: "Check your bet details and price; enter your size and place your bet!"
		    })
		}),
		(this.state.selectedProduct!=undefined) ? React.DOM.h3({
		    className: "text-center",
		    style: {
			color: "#888",
			"margin-top": "20px"
		    },
		    children: React.DOM.i({
			children: React.DOM.b({
			    children: "Your bet: "+this.state.selectedProduct.params.description
			})
		    })
		}) : undefined,
		(this.state.selectedProduct!=undefined) ? React.DOM.h3({
		    className: "text-center",
		    style: {
			color: "#888",
			"margin-top": "20px"
		    },
		    children: React.DOM.i({
			children: React.DOM.b({
			    children: "Your price: "+this.state.selectedProduct.params.price
			})
		    })
		}) : undefined,
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
				className: "btn btn-primary",
				style: {
				    width: "100px"
				},
				children: "Place Bet",
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

