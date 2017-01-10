var SingleTeamsForm=React.createClass({
    ajaxError: function(xhr, ajaxOptions, thrownError) {	    
	console.log("ajax error :-(");
    },
    ajaxSuccess: function(struct) {
	console.log(JSON.stringify(struct));
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
	return React.DOM.span({
	    className: "label label-primary",
	    children: this.props.message
	});
    }
});

var Main=function() {
    var form=React.createElement(SingleTeamsForm, {message: 'Hello World from React!'});
    var container=$("div[id='form']")[0];
    ReactDOM.render(form, container);    
};
