var SingleTeamOutrightForm=React.createClass({
    initOptionsHandler: function(name) {
	return function(struct) {
	    var state=this.state;
	    state.options[name]=struct;
	    this.setState(state);	
	}.bind(this);
    },
    getInitialState: function() {
	return {
	    options: {
		payoff: []
	    },
	    bet: this.props.bet
	};
    },
    fetchPayoffs: function() {
	var handler=this.initOptionsHandler("payoff");
	this.props.exoticsApi.fetchBlob("products/outright_payoffs", handler);
    },
    filterPayoffs: function(payoffs, teamname) {
	return payoffs.filter(function(payoff) {
	    return payoff.team==teamname;
	})
    },
    formatPayoffOptions: function(payoffs) {
	return payoffs.map(function(payoff) {
	    return {
		value: payoff.payoff
	    }
	});
    },
    hasPayoff: function(teamname, payoffname) {
	var payoffs=this.state.options.payoff.filter(function(payoff) {
	    return (payoff.team==teamname) && (payoff.payoff==payoffname);
	});
	return payoffs.length!=0;
    },
    teamChangeHandler: function(struct) {
	if ((this.state.bet.league!=struct.league) ||
	    (this.state.bet.team!=struct.team)) {
	    var state=this.state;
	    state.bet.league=struct.league;
	    state.bet.team=struct.team;
	    if (!this.hasPayoff(struct.team, this.state.bet.payoff)) {
		state.bet.payoff=undefined;
	    }
	    this.setState(state);
	    this.updatePrice(this.state.bet);
	}
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
	return ((bet.league!=undefined) &&
		(bet.team!=undefined) &&
		(bet.payoff!=undefined) &&
		(bet.expiry!=undefined));
    },
    updatePrice: function(bet) {
	if (this.isComplete(bet)) {
	    this.props.updatePriceHandler(bet)
	} else {
	    this.props.resetPriceHandler();
	}
    },
    componentDidMount: function() {
	this.fetchPayoffs();
	this.updatePrice(this.state.bet); 
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
		    label: "Team",
		    defaultOption: {
			label: "Select"
		    }
		}),
		[
		    React.createElement(MySelect, {
                        label: "Position",
                        name: "payoff",
                        options: this.formatPayoffOptions(this.filterPayoffs(this.state.options.payoff, this.state.bet.team)),
                        value: this.state.bet.payoff,
                        changeHandler: this.changeHandler,
                        blankStyle: this.props.blankStyle,
			defaultOption: {
			    label: "Select"
			}
                    }),
		    React.createElement(ExpirySelector, {
                        exoticsApi: this.props.exoticsApi,
                        expiry: this.state.bet.expiry,
                        changeHandler: this.changeHandler,
                        blankStyle: this.props.blankStyle,
			defaultOption: {
			    label: "Select"
			}
                    })
		]
	    ]
	})
    }
});
