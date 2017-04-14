var ResultSelector=React.createClass({
    getInitialState: function() {
	return {
	    options: {
		result: [
		    {
			label: "To Win",
			value: "win"
		    },
		    {
			label: "To Draw",
			value: "draw"
		    },
		    {
			label: "To Lose",
			value: "lose"
		    }
		]
	    },
	    result: this.props.result
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
	    options: this.state.options.result,
	    value: this.state.result,
	    // pass thru attributes
	    blankStyle: this.props.blankStyle,
	    className: this.props.className,
	    defaultOption: this.props.defaultOption,	    
	    label: this.props.label || "Result",
	    name: this.props.name || "result"
	});
    }
});
