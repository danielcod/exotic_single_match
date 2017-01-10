var SimpleSelect=React.createClass({
    getInitialState: function() {
	return {options: [],
		value: "ENG.2"};
    },
    ajaxSuccess: function(struct) {
	this.setState({options: struct});
    },
    ajaxError: function(xhr, ajaxOptions, thrownError) {
	console.log("ajax error :-(");
    },
    componentDidMount: function() {
	$.ajax({
	    url: this.props.url,
	    type: "GET",
	    dataType: "json",
	    success: this.ajaxSuccess,
	    error: this.ajaxError
	});
    },	
    render: function() {
	return React.DOM.select({
	    className: "form-control",
	    value: this.state.value,
	    onChange: function(event) {
		var value=event.target.value;
		this.setState({
		    value: value
		});
		this.props.changeHandler(this.props.name, value);
	    }.bind(this),
	    children: this.state.options.map(function(option) {
		return React.DOM.option({
		    children: option.name
		})
	    })
	});
    }
});

var Main=function() {
    var select=React.createElement(SimpleSelect,
				   {name: 'league',
				    url: '/api/leagues',
				    changeHandler: function(name, value) {
					console.log(name+"="+value);
				    }});
    var container=$("div[id='form']")[0];
    ReactDOM.render(select, container);    
};
