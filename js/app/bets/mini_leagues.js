var MiniLeagueForm=React.createClass({
    changeHandler: function(items) {
	console.log(JSON.stringify(items));
    },
    render: function() {	
	return React.DOM.div({
	    children: [
		React.DOM.div({
		    className: "row",
		    children: React.DOM.div({
			className: "col-xs-12",
			children: React.createElement(TeamSelectorTable, {
			    items: [
				{
				    league: "ENG.1",
				    team: "Liverpool"
				},
				{
				    league: "SPA.1",
				    team: "Barcelona"
				}
			    ],
			    exoticsApi: this.props.exoticsApi,
			    blankStyle: this.props.blankStyle,
			    changeHandler: this.changeHandler
			})
		    })					    
		})
	    ]
	});
    }
});
