var SingleTeamsPage=React.createClass({
    render: function() {	
	return React.DOM.div({
	    className: "text-center",
	    style: {
		"margin-bottom": "30px"
	    },
	    children: React.DOM.h3({
		children: React.DOM.span({
		    className: "label label-primary",
		    children: "Hello World!"
		})
	    })
	});
    }
});

var Main=function() {
    var page=React.createElement(SingleTeamsPage, {})
    var container=$("div[id='form']")[0];
    ReactDOM.render(page, container);    
};
