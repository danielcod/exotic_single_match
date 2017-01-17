var PlaceBetPanel=React.createClass({
    deepCopy: function(struct) {
	return JSON.parse(JSON.stringify(struct));
    },
    getInitialState: function() {
	return {
	    selectedProduct: undefined
	};
    },
    loadSuccess: function(struct) {
	var state=this.state;
	state.selectedProduct=this.deepCopy(struct);
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
	this.loadComponent("/app/products/show?type="+this.props.selectedProduct.type+"&id="+this.props.selectedProduct.id);
    },
    render: function() {
	return React.DOM.div({
	    children: [
		React.createElement(ProcessSteps, {
		    steps: ProcessStepLabels,
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
			React.DOM.input({
			    className: "form-control"
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
				className: "btn btn-secondary",
				style: {
				    width: "100px"
				},
				children: "Re- edit",
				onClick: function() {
				    this.props.stepChangeHandler(1, this.props.selectedProduct);
				}.bind(this)
			    }),
			    React.DOM.button({
				className: "btn btn-primary",
				style: {
				    width: "100px"
				},
				children: "Place Bet",
				onClick: function() {
				    this.props.stepChangeHandler(3, undefined);
				}.bind(this)
			    })
			]
		    })
		})
	    ]
	});
    }
});

