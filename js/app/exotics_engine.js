var SingleTeamsForm=React.createClass({
    componentDidMount: function() {
	console.log("mounted");
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
