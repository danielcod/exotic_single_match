var ConditionSelector=React.createClass({
    getInitialState: function() {
	return {
	    options: {
		condition: [
		    {
			label: "More Than",
			value: ">"
		    },
		    {
			label: "At Least",
			value: ">="
		    },
		    {
			label: "Exactly",
			value: "="
		    },
		    {
			label: "Less Than",
			value: "<"
		    },
		    {
			label: "At Most",
			value: "<="
		    }
		]
	    },
	    condition: this.props.condition
	};
    },    
    changeHandler: function(name, value) {
	if (this.state[name]!=value) {
	    var state=this.state;
	    state[name]=value;
	    this.setState(state);
	    this.props.changeHandler(name, value);
	}
    },
    render: function() {
	return React.createElement(MySelect, {
	    changeHandler: this.changeHandler,
	    options: this.state.options.condition,
	    value: this.state.condition,
	    // pass thru attributes
	    blankStyle: this.props.blankStyle,
	    className: this.props.className,
	    defaultOption: this.props.defaultOption,	    
	    label: this.props.label || "Condition",
	    name: this.props.name || "condition"
	});
    }
});
