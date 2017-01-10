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
		console.log(value);
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
    var form=React.createElement(SimpleSelect, {url: '/api/leagues'});
    var container=$("div[id='form']")[0];
    ReactDOM.render(form, container);    
};
