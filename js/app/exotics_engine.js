var SingleTeamsForm=React.createClass({
    getInitialState: function() {
	return {options: []};
    },
    ajaxSuccess: function(struct) {
	this.setState({options: struct});
    },
    ajaxError: function(xhr, ajaxOptions, thrownError) {
	console.log("ajax error :-(");
    },
    componentDidMount: function() {
	$.ajax({
	    url: "/api/leagues",
	    type: "GET",
	    dataType: "json",
	    success: this.ajaxSuccess,
	    error: this.ajaxError
	});
    },	
    render: function() {
	return React.DOM.select({
	    className: "form-control",
	    children: this.state.options.map(function(option) {
		return React.DOM.option({
		    children: option.name
		})
	    })
	});
    }
});

var Main=function() {
    var form=React.createElement(SingleTeamsForm, {message: 'Hello World from React!'});
    var container=$("div[id='form']")[0];
    ReactDOM.render(form, container);    
};
