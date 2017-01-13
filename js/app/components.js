/*
  blank option must have option '', then be converted to undefined
  if you set value=undefined, will use label/child text as value
*/

var SimpleSelect=React.createClass({
    getInitialState: function() {
	return {
	    options: this.props.options,
	    value: this.props.value,
	    id: this.props.id
	}
    },
    componentWillReceiveProps: function(nextProps) {
	var filterValues=function(struct) {
	    return struct.map(function(item) {
		return item.value;
	    }).join(";");
	};
	var state=this.state;
	var updated=false;
	// update options
	var optionsKey=filterValues(this.state.options);
	var newOptionsKey=filterValues(nextProps.options);
	if (optionsKey!=newOptionsKey) {
	    state.options=nextProps.options;
	    updated=true;
	}
	// update value
	if (this.state.value!=nextProps.value) {
	    state.value=nextProps.value;
	    updated=true;
	}
	// check id/reset
	if (this.state.id!=nextProps.id) {
	    console.log(this.props.name+" reset");
	}
	// update
	if (updated) {
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
		    style: (this.state.value==undefined) ? {
			border: "3px solid #F88"
		    } : {},
		    onChange: function(event) {
			var formatValue=function(value) {
			    return (value!='') ? value : undefined;
			}			    
			var value=formatValue(event.target.value);
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
