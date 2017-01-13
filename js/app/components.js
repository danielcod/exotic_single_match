/*
  blank option must have option '', then be converted to undefined
  if you set value=undefined, will use label/child text as value
*/

var SimpleSelect=React.createClass({
    getInitialState: function() {
	return {
	    options: this.props.options,
	    value: this.props.value,
	}
    },
    componentWillReceiveProps: function(nextProps) {
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
    },
    formatValue: function(value) {
	return (value!='') ? value : undefined;
    },
    render: function() {
	return React.DOM.div({
	    className: "form-group",
	    children: [
		React.DOM.label({
		    children: this.props.label
		}),
		React.DOM.select({
		    className: "form-control",
		    value: this.state.value,
		    style: (this.state.value==undefined) ? {
			border: "3px solid #F88"
		    } : {},
		    onChange: function(event) {
			var value=this.formatValue(event.target.value);
			var state=this.state
			state.value=value;
			this.setState(state);
			this.props.changeHandler(this.props.name, value);
		    }.bind(this),
		    children: [
			React.DOM.option({
			    value: '', // NB
			    disabled: this.state.value!=undefined,
			    children: "Select"
			}),
			this.state.options.map(function(option) {
			    return React.DOM.option({
				value: option.value,
				children: option.label || option.value
			    })
			})
		    ]
		})
	    ]
	});		
    }
});
