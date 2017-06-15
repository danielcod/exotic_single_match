var MySelect=React.createClass({
    renderSelect: function() {
	return React.DOM.select({
	    className: "form-control",
	    onChange: function(event) {
		this.props.changeHandler(this.props.name, event.target.value);
	    }.bind(this),
	    children: [
		this.props.options.map(function(option) {
		    return React.DOM.option({
			value: option.value,
			children: option.label || option.value
		    })
		}.bind(this))
	    ]
	});
    },
    renderForm: function() {
	return React.DOM.div({
	    className: "form-group",
	    children: [
		React.DOM.label({
		    children: this.props.label
		}),
		this.renderSelect()
	    ]
	});		
    },
    render: function() {
	return (this.props.label!=undefined) ? this.renderForm() : this.renderSelect();
    }
});

