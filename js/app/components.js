/*
  blank option must have option '', then be converted to undefined
  if you set value=undefined, will use label/child text as value
*/

var SimpleSelect=React.createClass({
    getInitialState: function() {
	return {
	    options: this.props.options,
	    value: this.props.value,
	    debug: this.props.debug || false
	}
    },
    componentWillReceiveProps: function(nextProps) {
	// options
	if (JSON.stringify(this.state.options)!=
	    JSON.stringify(nextProps.options)) {
	    if (this.state.debug) {
		console.log("resetting "+this.props.name+" options from "+JSON.stringify(this.state.options)+" to "+JSON.stringify(nextProps.options));
	    }
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
	// value reset
	if (this.props.id!=nextProps.id) {
	    if (this.state.debug) {
		console.log("changing "+this.props.name+" value from "+this.state.value+" to "+this.props.value);
	    }
	    var state=this.state;
	    state.value=this.props.value;
	    this.setState(state);
	}
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
		    style: (this.state.value==undefined) ? this.props.blankStyle : {},
		    onChange: function(event) {
			var value=event.target.value;
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
