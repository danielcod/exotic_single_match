var MySelect=React.createClass({
    getInitialState: function() {
	return {
	    value: this.props.value
	}
    },
    renderSelect: function() {
	return React.DOM.select({
	    className: "form-control",
	    value: this.state.value,
	    style: (this.state.value==undefined) ? this.props.blankStyle : {},
	    onChange: function(event) {
		var value=(event.target.value!="") ? event.target.value : undefined;
		var state=this.state;
		state.value=value;
		this.setState(state);
		this.props.changeHandler(this.props.name, value);
	    }.bind(this),
	    children: [
		this.props.options.map(function(option) {
		    return React.DOM.option({
			value: option.value,
			selected: option.value==this.state.value,
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

