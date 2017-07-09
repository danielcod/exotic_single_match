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
		    product: {
			name: "exotic_acca_winner",
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
