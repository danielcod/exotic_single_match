var MiniLeagueForm=React.createClass({
    initOptionsHandler: function(name) {
	return function(struct) {
	    var state=this.state;
	    state.options[name]=struct;
	    this.setState(state);	
	}.bind(this);
    },
    initBet: function(bet) {
	if (bet.versus==undefined) {
	    bet.versus=[];
	}
	return bet;
    },
    getInitialState: function() {
	return {
	    options: {
		payoff: [
		    {
			value: "Top"
		    },
		    {
			value: "Bottom"
		    }
		]
	    },
	    bet: this.initBet(this.props.bet)
	};
    },
    teamChangeHandler: function(struct) {
	if ((this.state.bet.league!=struct.league) ||
	    (this.state.bet.team!=struct.team)) {
	    var state=this.state;
	    state.bet.league=struct.league;
	    state.bet.team=struct.team;
	    this.setState(state);
	    this.updatePrice(this.state.bet);
	}
    },
    versusChangeHandler: function(items) {
	var state=this.state;
	state.bet.versus=items.map(function(item) {
	    return {
		league: item.league,
		team: item.team
	    };
	});
	this.setState(state);
	this.updatePrice(this.state.bet);
    },
    changeHandler: function(name, value) {
	if (this.state.bet[name]!=value) {
	    var state=this.state;
	    state.bet[name]=value;
	    this.setState(state);
	    this.updatePrice(this.state.bet);
	}
    },
    isComplete: function(bet) {
	// check scalar fields
	if ((bet.league==undefined) ||
	    (bet.team==undefined) ||
	    (bet.payoff==undefined) ||
	    (bet.expiry==undefined)) {
	    return false;
	}
	// check min versus length
	if (bet.versus.length==0) {
	    return false;
	}
	// check undefined versus fields
	for (var i=0; i < bet.versus.length; i++) {
	    var item=bet.versus[i];
	    if ((item.league==undefined) ||
		(item.team==undefined)) {
		return false;
	    }
	}
	// check unique team names
	var teamnames=[bet.team];	
	for (var i=0; i < bet.versus.length; i++) {
	    var item=bet.versus[i];
	    if (teamnames.indexOf(item.team)==-1) {
		teamnames.push(item.team);
	    }
	}
	if (teamnames.length!=(bet.versus.length+1)) {
	    return false
	}
	return true;
    },
    updatePrice: function(bet) {
	if (this.isComplete(bet)) {
	    this.props.updatePriceHandler("mini_league", bet)
	} else {
	    this.props.resetPriceHandler();
	}
    },
    initialise: function() {
	this.updatePrice(this.state.bet); 
    },
    componentDidMount: function() {
	this.initialise();
    },
    render: function() {
	return React.createElement(GridLayout, {
	    rows: [
		React.createElement(TeamSelector, {
		    exoticsApi: this.props.exoticsApi,
		    item: {
			league: this.state.bet.league,
			team: this.state.bet.team
		    },
		    changeHandler: this.teamChangeHandler,
		    blankStyle: this.props.blankStyle,
		    detached: true
		}),
		[
		    React.createElement(MySelect, {
			label: "Position",
			name: "payoff",
			options: this.state.options.payoff,
			value: this.state.bet.payoff,
			changeHandler: this.changeHandler,
			blankStyle: this.props.blankStyle
		    }),
		    React.createElement(ExpirySelector, {
			exoticsApi: this.props.exoticsApi,
			expiry: this.state.bet.expiry,
			changeHandler: this.changeHandler,
			blankStyle: this.props.blankStyle
		    })
		],
		React.DOM.div({
		    className: "text-center",
		    children: React.DOM.label({
			style: {
			    "margin-top": "12px"
			},
			children: "Versus"
		    })
		}),
		React.createElement(TeamSelectorTable, {
		    items: this.state.bet.versus,
		    exoticsApi: this.props.exoticsApi,
		    blankStyle: this.props.blankStyle,
		    changeHandler: this.versusChangeHandler
		})
	    ]
	})
    }
});



