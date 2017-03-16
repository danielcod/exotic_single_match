var SeasonMatchBetForm=React.createClass({
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
		league: [],
		team: [],
		versus: [],
		expiry: []
	    },
	    product: deepCopy(this.props.product)
	};
    },
    fetchLeagues: function() {
	var handler=this.initOptionsHandler("league");
	this.props.exoticsApi.fetchLeagues(handler);
    },
    formatLeagueOptions: function(leagues) {
	return leagues.map(function(league) {
	    return {
		value: league.name
	    }
	});
    },
    fetchTeams: function(product) {
	if (product.league!=undefined) {
	    var handler=this.initOptionsHandler("team");
	    this.props.exoticsApi.fetchTeams(product.league, handler);
	}
    },
    formatTeamOptions: function(teams) {
	return teams.map(function(team) {
	    return {
		value: team.name
	    }
	});
    },
    fetchVersus: function(product) {
	if (product.league!=undefined) {
	    var handler=this.initOptionsHandler("versus");
	    var key="smb_versus/"+product.league;
	    this.props.exoticsApi.fetchBlob(key, handler);
	}
    },
    filterVersus: function(teams, teamname) {
	return teams.filter(function(team) {
	    return (team.team==teamname) && (team.versus!=teamname);
	})
    },
    formatVersusOptions: function(teams) {
	return teams.map(function(team) {
	    return {
		value: team.versus
	    }
	});
    },
    fetchExpiries: function() {
	var handler=this.initOptionsHandler("expiry");
	this.props.exoticsApi.fetchExpiries(handler);
    },
    formatExpiryOptions: function(expiries) {
	return expiries; // expiries come with label, value fields
    },
    hasVersus: function(teamname, versusname) {
	var versus=this.state.options.versus.filter(function(versus) {
	    return (versus.team==teamname) && (versus.versus==versusname);
	});
	return versus.length!=0;
    },
    changeHandler: function(name, value) {
	if (this.state.product[name]!=value) {
	    var state=this.state;
	    state.product[name]=value;
	    if (name=="league") {
		state.options.team=[];
		state.product.team=undefined;
		this.fetchTeams(state.product);
		state.options.versus=[];
		state.product.versus=undefined;
		this.fetchVersus(state.product);
	    } else if (name=="team") {
		if (!this.hasVersus(value, this.state.product.versus)) {
		    state.product.versus=undefined;
		}
            }
	    this.setState(state);
	    this.updatePrice(this.state.product);
	}
    },
    isComplete: function(product) {
	return ((product.league!=undefined) &&
		(product.team!=undefined) &&
		(product.versus!=undefined) &&
		(product.team!=product.versus) &&
		(product.expiry!=undefined));
    },
    priceHandler: function(struct) {
	$("span[id='price']").text(struct["price"]);
    },
    updatePrice: function(product) {
	if (this.isComplete(product)) {
	    $("span[id='price']").text("[updating ..]");
	    var struct={
		"type": "season_match_bet",
		"product": product
	    };
	    this.props.exoticsApi.fetchPrice(struct, this.priceHandler);
	    this.props.changeHandler(struct);
	} else {
	    $("span[id='price']").text("[..]");
	    this.props.changeHandler(undefined);
	}
    },
    initialise: function() {
	this.fetchLeagues();
	this.fetchTeams(this.state.product);
	this.fetchVersus(this.state.product);
	this.fetchExpiries();
	this.updatePrice(this.state.product); 
    },
    componentDidMount: function() {
	this.initialise();
    },
    highlighter: function() {
	return ((this.state.product.team!=undefined) &&
		(this.state.product.versus!=undefined) &&
		(this.state.product.team==this.state.product.versus))
    },
    render: function() {
	return React.DOM.div({
	    className: "row",
	    children: [
		React.DOM.div({
		    className: "col-xs-6",
		    children: [
			React.createElement(
			    MySelect, {
				label: "League",
				name: "league",
				options: this.formatLeagueOptions(this.state.options.league),
				value: this.state.product.league,
				changeHandler: this.changeHandler,
				blankStyle: this.props.blankStyle
			    }),
			React.createElement(
			    MySelect, {
				label: "Versus",
				name: "versus",
				options: this.formatVersusOptions(this.filterVersus(this.state.options.versus, this.state.product.team)),
				value: this.state.product.versus,
				changeHandler: this.changeHandler,
				blankStyle: this.props.blankStyle,
				highlighter: this.highlighter
			    })
		    ]
		}),
		React.DOM.div({
		    className: "col-xs-6",
		    children: [
			React.createElement(
			    MySelect, {
				label: "Your Team",
				name: "team",
				options: this.formatTeamOptions(this.state.options.team),
				value: this.state.product.team,
				changeHandler: this.changeHandler,
				blankStyle: this.props.blankStyle,
				highlighter: this.highlighter
			    }),
			React.createElement(
			    MySelect, {
				label: "At",
				name: "expiry",
				options: this.formatExpiryOptions(this.state.options.expiry),
				value: this.state.product.expiry,
				changeHandler: this.changeHandler,
				blankStyle: this.props.blankStyle
			    })
		    ]
		})
	    ]
	})
    }
});

