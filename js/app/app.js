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
		React.createElement(AccaProductPanel, {
		    exoticsApi: this.props.exoticsApi,
		    products: [
			{
			    label: "Exotic Acca Winner",
			    name: "exotic_acca_winner",
			    description:  "An Exotic Acca Winner is like a traditional acca; but not all teams have to win for it to payout, so you don't have to select all the favourites; and you can add a goals condition to improve the price!",
			    legsPanel: MatchTeamPanel,
			    betGoalsSlider: {
				label: "To Win By At Least",
				tickLabeller: function(minval, maxval) {
				    var labels=[];
				    for (var i=minval; i <= maxval; i++) {
					if (i==minval) {
					    labels.push("(Just Win)");
					} else {
					    labels.push(i+"+ Goals");
					}
				    }
				    return labels;
				},
				minVal: 1,
				maxVal: 4,
			    },
			    betLegsToggle: {
				label: "How many legs need to win ?",
				textFormatter: function(val, maxval) {
				    return  val+((val < maxval) ? "+" : "")+" (of "+maxval+")";
				},			    
				minVal: 1
			    }
			},
			{
			    label: "Exotic Acca Loser",
			    name: "exotic_acca_loser",
			    description:  "An Exotic Acca Loser is like an Exotic Acca Winner, but in reverse! This time you're picking a set of teams you expect to lose, and not all teams have to lose for you to win.",
			    legsPanel: MatchTeamPanel,
			    betGoalsSlider: {
				label: "To Lose By At Least",
				tickLabeller: function(minval, maxval) {
				    var labels=[];
				    for (var i=minval; i <= maxval; i++) {
					if (i==minval) {
					    labels.push("(Just Lose)");
					} else {
					    labels.push(i+"+ Goals");
					}
				    }
				    return labels;
				},
				minVal: 1,
				maxVal: 4,
			    },
			    betLegsToggle: {
				label: "How many legs need to lose ?",
				textFormatter: function(val, maxval) {
				    return  val+((val < maxval) ? "+" : "")+" (of "+maxval+")";
				},			    
				minVal: 1
			    }
			},
			{
			    label: "Exotic Acca Draws",
			    name: "exotic_acca_draws",
			    description:  "An Exotic Acca Draws bet allows you to bet on the number of draws in an Acca; once again, not all of them have to come in and you can improve the price by specifying the number of goals in each game",
			    legsPanel: MatchPanel,
			    betGoalsSlider: {
				label: "To Draw With At Least",
				tickLabeller: function(minval, maxval) {
				    var labels=[];
				    for (var i=minval; i <= maxval; i++) {
					if (i==minval) {
					    labels.push("(Just Draw)");
					} else {
					    labels.push(i+"+ Goals");
					}
				    }
				    return labels;
				},
				minVal: 0,
				maxVal: 3,
			    },
			    betLegsToggle: {
				label: "How many legs need to draw ?",
				textFormatter: function(val, maxval) {
				    return  val+((val < maxval) ? "+" : "")+" (of "+maxval+")";
				},			    
				minVal: 1
			    }
			}
		    ],
		    legsPaginator: {
			rows: 8
		    },
		    betLegsPaginator: {
			rows: 8
		    }
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
