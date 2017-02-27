var SeasonMatchBetForm=React.createClass({
    productType: "season_match_bet",
    // initOptionsHandler converted to accept arrays as teams handler will need to update both team and versus fields
    initOptionsHandler: function(names) {
	return function(struct) {
	    var state=this.state;
	    for (var i=0; i < names.length; i++) {
		var name=names[i];
		state.options[name]=struct;
	    }
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
	var handler=this.initOptionsHandler(["league"]);
	this.props.exoticsApi.fetchLeagues(handler);
    },
    fetchTeams: function(params) {
	if (params.league!=undefined) {
	    var handler=this.initOptionsHandler(["team"]);
	    this.props.exoticsApi.fetchTeams(params.league, handler);
	}
    },
    fetchVersus: function(params) {
	if (params.league!=undefined) {
	    var handler=this.initOptionsHandler(["versus"]);
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
	var handler=this.initOptionsHandler(["expiry"]);
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
	this.fetchTeams(this.props.params);
	this.fetchVersus(this.props.params);
	this.fetchExpiries();
	this.updatePrice(this.props.params); 
    },
    componentDidMount: function() {
	this.initialise();
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
	    };
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
				value: this.props.params.league,
				changeHandler: this.changeHandler,
				blankStyle: this.props.blankStyle
			    }),
			React.createElement(
			    MySelect, {
				label: "Versus",
				name: "versus",
				options: this.formatVersus(this.filterVersus(this.state.options.versus, this.state.params.team)),
				value: this.props.params.versus,
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
				value: this.props.params.team,
				changeHandler: this.changeHandler,
				blankStyle: this.props.blankStyle,
				highlighter: this.highlighter
			    }),
			React.createElement(
			    MySelect, {
				label: "At",
				name: "expiry",
				options: this.state.options.expiry,
				value: this.props.params.expiry,
				changeHandler: this.changeHandler,
				blankStyle: this.props.blankStyle
			    })
		    ]
		})
	    ]
	})
    }
});

