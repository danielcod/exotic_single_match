var MiniLeagueRow=React.createClass({
    render: function() {
	return React.DOM.tr({
	    children: [
		React.DOM.td({
		    style: {
			"margin-top": "0px",
			"margin-bottom": "0px",
			"padding-top": "12px",
			"padding-bottom": "0px"
		    },
		    children: React.createElement(
			MySelect, {
			    name: "league",
			    options: [
				{
				    value: "ENG.1",
				},
				{
				    value: "ENG.2",
				},
				{
				    value: "ENG.3"
				}
			    ],
			    value: "ENG.1",
			    changeHandler: function(name, value) {
				console.log(name+"="+value);
			    }
			}
		    )
		}),		
		React.DOM.td({
		    style: {
			"margin-top": "0px",
			"margin-bottom": "0px",
			"padding-top": "12px",
			"padding-bottom": "0px"
		    },
		    children: React.createElement(
			MySelect, {
			    name: "team",
			    options: [
				{
				    value: "Arsenal",
				},
				{
				    value: "Liverpool",
				},
				{
				    value: "Man City"
				}
			    ],
			    value: "Liverpool",
			    changeHandler: function(name, value) {
				console.log(name+"="+value);
			    }
			}
		    )
		}),
		React.DOM.td({
		    style: {
			"margin-top": "0px",
			"margin-bottom": "0px",
			"padding-top": "0px",
			"padding-bottom": "0px"
		    },
		    children: React.DOM.a({
			className: "btn btn-secondary",
			children: React.DOM.i({
			    className: "glyphicon glyphicon-remove"
			})
		    })
		})
	    ]
	})				    
    }
});

var MiniLeagueTable=React.createClass({
    render: function() {	
	return React.DOM.table({
	    className: "table",
	    style: {
		margin: "0px",
		padding: "0px"
	    },
	    children: [
		React.DOM.thead({
		    children: React.DOM.tr({
			children: [
			    React.DOM.th({
				children: "League"
			    }),
			    React.DOM.th({
				children: "Team"
			    }),
			    React.DOM.th({
				children: []
			    })
			]
		    })
		}),		
		React.DOM.tbody({
		    children: [
			React.createElement(MiniLeagueRow, {}),
			React.createElement(MiniLeagueRow, {})
		    ]
		})
	    ]
	})
    }
});

var MiniLeagueForm=React.createClass({
    render: function() {	
	return React.DOM.div({
	    children: [
		React.DOM.div({		    
		    className: "row",
		    children: React.DOM.div({
			className: "col-xs-12",
			children: React.DOM.a({
			    className: "btn btn-sm btn-primary pull-right",
			    children: "Add Team"
			})
		    })
		}),
		React.DOM.div({
		    className: "row",
		    children: React.DOM.div({
			className: "col-xs-12",
			children: React.createElement(MiniLeagueTable, {})
		    })
		})
	    ]
	});
    }
});
