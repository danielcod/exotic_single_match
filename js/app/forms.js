var MySelect=React.createClass({
    render: function() {
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
    }
});

var MyLabelledSelect=React.createClass({
    render: function() {
	return React.DOM.div({
	    className: "form-group",
	    children: [
		React.DOM.label({
		    children: this.props.label
		}),
		React.createElement(MySelect, this.props)
	    ]
	});		
    }
});

