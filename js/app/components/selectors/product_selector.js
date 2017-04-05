var ProductSelector=React.createClass({
    initOptionsHandler: function(name) {
	return function(struct) {
	    var state=this.state;
	    state.options[name]=struct;
	    this.setState(state);	
	}.bind(this);
    },
    getInitialState: function() {
	return {
	    options: {
		product: []
	    },
	    product: this.props.product
	};
    },
    fetchProducts: function() {
	var handler=this.initOptionsHandler("product");
	this.props.exoticsApi.fetchProducts(handler);
    },
    sortProducts: function(item0, item1) {
	if (item0.type < item1.type) {
	    return -1;
	} else if (item0.type > item1.type) {
	    return 1;
	} else {
	    return 0;
	}
    },
    formatProductLabel: function(product) {
	if (product==undefined) {
	    return undefined;
	} else {
	    return product.label;
	}
    },
    formatProductValue: function(product) {
	if (product==undefined) {
	    return undefined;
	} else {
	    return product.type;
	}
    },
    formatProductOptions: function(products) {
	return products.sort(this.sortProducts).map(function(product) {
	    return {
		label: this.formatProductLabel(product),
		value: this.formatProductValue(product)
	    }
	}.bind(this));
    },
    changeHandler: function(name, value) {
	if (this.state[name]!=value) {
	    var state=this.state;
	    state[name]=value;
	    this.setState(state);
	    this.props.changeHandler(name, value);
	}
    },
    initialise: function() {
	this.fetchProducts();
    },
    componentDidMount: function() {
	this.initialise();
    },
    render: function() {
	return React.createElement(MySelect, {
	    changeHandler: this.changeHandler,
	    options: this.formatProductOptions(this.state.options.product),
	    value: this.formatProductValue(this.state.product),
	    // pass thru attributes
	    blankStyle: this.props.blankStyle,
	    className: this.props.className,
	    defaultOption: this.props.defaultOption,
	    label: this.props.label,
	    name: this.props.name || "product"
	});
    }
});
