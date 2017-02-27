var SeasonMatchBetForm=React.createClass({
    productType: "season_match_bet",
    initOptionsHandler: function(name) {
	return function(struct) {
	    var state=this.state;
	    state.options[name]=struct;
	    this.setState(state);	
	}.bind(this);
    },
    priceHandler: function(struct) {
	$("span[id='price']").text(struct["price"]);
    },
    getInitialState: function() {
	return {
	    options: {
		league: [],
		team: [],
		versus: [],
		expiry: []
	    },
	    params: deepCopy(this.props.params)
	};
    },
    fetchLeagues: function() {
	var handler=this.initOptionsHandler("league");
	this.props.exoticsApi.fetchLeagues(handler);
    },
    fetchTeams: function(params) {
	if (params.league!=undefined) {
	    var handler=this.initOptionsHandler("team");
	    this.props.exoticsApi.fetchTeams(params.league, handler);
	}
    },
    fetchVersus: function(params) {
	if (params.league!=undefined) {
	    var handler=this.initOptionsHandler("versus");
	    var key="smb_versus/"+params.league;
	    this.props.exoticsApi.fetchBlob(key, handler);
	}
    },
    filterVersus: function(teams, teamname) {
	return teams.filter(function(team) {
	    return (team.team==teamname) && (team.versus!=teamname);
	})
    },
    formatVersus: function(teams) {
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
    isComplete: function(params) {
	return ((params.league!=undefined) &&
		(params.team!=undefined) &&
		(params.versus!=undefined) &&
		(params.team!=params.versus) &&
		(params.expiry!=undefined));
    },
    updatePrice: function(params) {
	if (this.isComplete(params)) {
	    $("span[id='price']").text("[updating ..]");
	    var struct={
		"type": this.productType,
		"params": params
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
	this.fetchTeams(this.state.params);
	this.fetchVersus(this.state.params);
	this.fetchExpiries();
	this.updatePrice(this.state.params); 
    },
    componentDidMount: function() {
	this.initialise();
    },
    hasVersus: function(teamname, versusname) {
	var versus=this.state.options.versus.filter(function(versus) {
	    return (versus.team==teamname) && (versus.versus==versusname);
	});
	return versus.length!=0;
    },
    changeHandler: function(name, value) {
	if (this.state.params[name]!=value) {
	    var state=this.state;
	    state.params[name]=value;
	    if (name=="league") {
		state.options.team=[];
		state.params.team=undefined;
		this.fetchTeams(state.params);
		state.options.versus=[];
		state.params.versus=undefined;
		this.fetchVersus(state.params);
	    } else if (name=="team") {
		if (!this.hasVersus(value, this.state.params.versus)) {
		    state.params.versus=undefined;
		}
            }
	    this.setState(state);
	    this.updatePrice(this.state.params);
	}
    },
    highlighter: function() {
	return ((this.state.params.team!=undefined) &&
		(this.state.params.versus!=undefined) &&
		(this.state.params.team==this.state.params.versus))
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
				options: this.state.options.league,
				value: this.state.params.league,
				changeHandler: this.changeHandler,
				blankStyle: this.props.blankStyle
			    }),
			React.createElement(
			    MySelect, {
				label: "Versus",
				name: "versus",
				options: this.formatVersus(this.filterVersus(this.state.options.versus, this.state.params.team)),
				value: this.state.params.versus,
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
				options: this.state.options.team,
				value: this.state.params.team,
				changeHandler: this.changeHandler,
				blankStyle: this.props.blankStyle,
				highlighter: this.highlighter
			    }),
			React.createElement(
			    MySelect, {
				label: "At",
				name: "expiry",
				options: this.state.options.expiry,
				value: this.state.params.expiry,
				changeHandler: this.changeHandler,
				blankStyle: this.props.blankStyle
			    })
		    ]
		})
	    ]
	})
    }
});

