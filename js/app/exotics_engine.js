var SimpleSelect=React.createClass({
    getInitialState: function() {
	return {options: [],
		value: "ENG.2"};
    },
    loadSuccess: function(struct) {
	this.setState({options: struct});
    },
    loadError: function(xhr, ajaxOptions, thrownError) {
	console.log(xhr.responseText);
    },
    componentDidMount: function() {
	$.ajax({
	    url: this.props.url,
	    type: "GET",
	    dataType: "json",
	    success: this.loadSuccess,
	    error: this.loadError
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
