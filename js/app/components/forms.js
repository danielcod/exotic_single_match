/*
  blank option must have option '', then be converted to undefined
  if you set value=undefined, will use label/child text as value
*/

var MySelect=React.createClass({
    getInitialState: function() {
	return {
	    options: this.props.options,
	    value: this.props.value
	}
    },
    componentWillReceiveProps: function(nextProps) {
	// options
	if (JSON.stringify(this.state.options)!=
	    JSON.stringify(nextProps.options)) {
	    var state=this.state;
	    state.options=nextProps.options;
	    var selectedItems=state.options.filter(function(option) {
		return option.value==this.state.value;
	    }.bind(this));
	    if (selectedItems.length==0) {
		state.value=undefined;
	    }
	    this.setState(state);
	}
	// value
	if (this.state.value!=nextProps.value) {
	    var state=this.state;
	    state.value=nextProps.value;
	    this.setState(state);
	}
    },
    renderSelect: function() {
	return React.DOM.select({
	    className: this.props.className || "form-control",
	    value: this.state.value,
	    style: (this.state.value==undefined) ? this.props.blankStyle : {},
	    onChange: function(event) {
		var value=event.target.value;
		var state=this.state
		state.value=value;
		this.setState(state);
		this.props.changeHandler(this.props.name, value);
	    }.bind(this),
	    children: [
		(this.props.defaultLabel!=undefined) ? React.DOM.option({
		    value: undefined, 
		    selected: this.state.value==undefined,
		    children: this.props.defaultLabel
		}) : undefined,
		this.state.options.map(function(option) {
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

var MyNumberInput=React.createClass({
    getInitialState: function() {
	return {
	    value: this.props.value
	};
    },
    render: function() {
	return React.DOM.input({
	    type: "number",
	    min: this.props.min,
	    max: this.props.max,
	    value: this.state.value,
	    className: "form-control text-center",
	    onChange: function(event) {
		var rawValue=event.target.value;
		if ((rawValue!='') &&
		    (rawValue!=undefined) &&
		    (rawValue!=NaN)) {
		    var parsedValue=parseInt(rawValue);
		    var state=this.state;
		    state.value=parsedValue;
		    this.setState(state);
		    this.props.changeHandler(parsedValue);
		}
	    }.bind(this)
	});
    }
});
