var Hello=React.createClass({
    render: function() {
	return React.DOM.span({
	    className: "label label-primary",
	    children: this.props.message
	});
    }
});

var Main=function() {
    var hello=React.createElement(Hello, {message: 'Hello World from React!'});
    var container=$("div[id='form']")[0];
    ReactDOM.render(hello, container);    
};
