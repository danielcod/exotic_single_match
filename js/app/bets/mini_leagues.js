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
	    bet: this.initBet(deepCopy(this.props.bet))
	};
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
	if ((bet.league==undefined) ||
	    (bet.team==undefined) ||
	    (bet.payoff==undefined) ||
	    (bet.expiry==undefined)) {
	    return false;
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
	return React.DOM.div({
	    children: [
		React.createElement(LeagueTeamSelectorRow, {
		    exoticsApi: this.props.exoticsApi,
		    league: this.state.bet.league,
		    team: this.state.bet.team,
		    changeHandler: this.changeHandler,
		    blankStyle: this.props.blankStyle
		}),
		React.DOM.div({
		    className: "row",
		    children: [
			React.DOM.div({
			    className: "col-xs-6",
			    children: React.createElement(
				MySelect, {
				    label: "Position",
				    name: "payoff",
				    options: this.state.options.payoff,
				    value: this.state.bet.payoff,
				    changeHandler: this.changeHandler,
				    blankStyle: this.props.blankStyle
				})
			}),
			React.DOM.div({
			    className: "col-xs-6",
			    children: React.createElement(ExpirySelector, {
				exoticsApi: this.props.exoticsApi,
				expiry: this.state.bet.expiry,
				changeHandler: this.changeHandler,
				blankStyle: this.props.blankStyle
			    })
			})
		    ]
		}),
		React.DOM.div({
		    className: "row",
		    children: React.DOM.div({
			className: "col-xs-12",
			children: [
			    React.DOM.div({
				className: "text-center",
				children: React.DOM.label({
				    style: {
					"margin-top": "12px"
				    },
				    children: "Versus"
				})
			    }),
			    React.createElement(LeagueTeamSelectorTable, {
				items: this.state.bet.versus,
				exoticsApi: this.props.exoticsApi,
				blankStyle: this.props.blankStyle,
				changeHandler: this.versusChangeHandler
			    })
			]
		    })
		})
	    ]
	})
    }
});



