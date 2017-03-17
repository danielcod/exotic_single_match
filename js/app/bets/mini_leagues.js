var MiniLeagueForm=React.createClass({
    changeHandler: function(items) {
	console.log(JSON.stringify(items));
    },
    /*
    isComplete: function(bet) {
	// check min length
	if (bet.versus.length < 2) {
	    return false;
	}
	// check undefined fields
	for (var i=0; i < bet.versus.length; i++) {
	    var item=bet.versus[i];
	    if ((item.league==undefined) ||
		(item.team==undefined)) {
		return false;
	    }
	}
	// check unique team names
	var teamnames=[];
	for (var i=0; i < bet.versus.length; i++) {
	    var item=bet.versus[i];
	    if (teamnames.indexOf(item.team)==-1) {
		teamnames.push(item.team);
	    }
	}
	if (teamnames.length!=bet.versus.length) {
	    return false
	}
	return true;
    },
    priceHandler: function(struct) {
	$("span[id='price']").text(struct["price"]);
    },
    updatePrice: function(bet) {
	if (this.isComplete(bet)) {
	    $("span[id='price']").text("[updating ..]");
	    var struct={
		"type": "mini_league",
		"bet": bet
	    };
	    this.props.exoticsApi.fetchPrice(struct, this.priceHandler);
	    this.props.changeHandler(struct);
	} else {
	    $("span[id='price']").text("[..]");
	    this.props.changeHandler(undefined);
	}
    },
    initialise: function() {
	this.updatePrice(this.state.bet); 
    },
    componentDidMount: function() {
	this.initialise();
    },
    */
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
