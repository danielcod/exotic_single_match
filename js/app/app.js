var App=React.createClass({
    render: function() {
	return React.DOM.div({
	    children: [
		React.DOM.div({
		    className: "header clearfix",
		    children: React.DOM.h1({
			children: "Team Exotics"
		    })
		}),
		React.createElement(EditBetPanel, {
		    exoticsApi: this.props.exoticsApi
		}),
		React.DOM.footer({
		    className: "footer",
		    children: [
			"Powered by",
			React.DOM.img({
			    className: "img-responsive",
			    src: "img/iosport.png",
			    alt: "ioSport"			    
			})
		    ]
		})
	    ]
	})
    }
});

var ajaxErrHandler=function(xhr, ajaxOptions, thrownError) {
    console.log(xhr.responseText);    
};

var Main=function() {
    var app=React.createElement(App, {
	exoticsApi: new ExoticsAPI(ajaxErrHandler, false)
    });
    var parent=$("div[id='app']")[0];
    ReactDOM.render(app, parent);
};
