var ProductMapping={
    "single_teams": SingleTeamsForm
};

var BlankStyle={
    border: "3px solid #F88"
};

var ProductSelect=React.createClass({
    getInitialState: function() {
	return {
	    value: this.props.value
	}
    },
    render: function() {
	return React.DOM.div({
	    className: "form-group",
	    children: [
		React.DOM.label({
		    children: "Product Type"
		}),
		React.DOM.select({
		    className: "form-control",
		    value: this.state.value,
		    onChange: function(event) {
			var value=event.target.value;
			var state=this.state
			state.value=value;
			this.setState(state);
			this.props.changeHandler(value);
		    }.bind(this),
		    children: this.props.options.map(function(option) {
			return React.DOM.option({
			    value: option.name,
			    children: option.label || option.name
			})
		    })
		})
	    ]
	});
    }	
});

var ProductForm=React.createClass({
    getInitialState: function() {
	return {
	    products: [],
	    selectedProduct: undefined,
	    currentProduct: undefined
	};
    },
    deepCopy: function(struct) {
	return JSON.parse(JSON.stringify(struct));
    },
    loadSuccess: function(struct) {
	var state=this.state;
	state.products=this.deepCopy(struct.products);
	state.selectedProduct=this.deepCopy(struct.product);
	state.currentProduct=this.deepCopy(struct.product);
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
	var url="/site/stage_two/init?product_id="+this.props.product_id;
	this.loadComponent(url);
    },
    productChangeHandler: function(value) {
	var state=this.state;
	if (state.selectedProduct.type==value) {
	    state.currentProduct=state.selectedProduct;
	} else {
	    state.currentProduct={
		type: value,
		query: {}
	    };
	}
	this.setState(state);
    },
    render: function() {
	return React.DOM.div({
	    children: (this.state.currentProduct!=undefined) ? [
		React.createElement(ProductSelect, {
		    options: this.state.products,
		    value: this.state.currentProduct.type,
		    changeHandler: this.productChangeHandler
		}),
		React.DOM.p({
		    className: "text-center",
		    style: {
			color: "#888"
		    },
		    children: React.DOM.i({
			children: this.state.products.filter(function(product) {
			    return product.name==this.state.currentProduct.type
			}.bind(this))[0]["description"]
		    })
		}),
		React.createElement(ProductMapping[this.state.currentProduct.type], {
		    params: this.state.currentProduct.query,
		    blankStyle: BlankStyle
		})
	    ] : []
	});
    }
});

var Main=function() {
    var productId=$("input[name='product_id']").val();
    var productForm=React.createElement(ProductForm, {
	product_id: productId
    });
    var parent=$("div[id='products']")[0];
    ReactDOM.render(productForm, parent);    
};
