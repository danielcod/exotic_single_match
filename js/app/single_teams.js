var SingleTeamsForm=React.createClass({
    getInitialState: function() {
	return {
	    options: {
		league: [],
		team: [],
		payoff: [],
		expiry: []
	    },
	    params: this.props.params,
	    cache: {}
	};
    },
    updateCache: function(url, struct) {
	var state=this.state;
	state.cache[url]=struct;
	this.setState(state);
    },
    loadSuccess: function(name, struct) {
	var state=this.state;
	state.options[name]=struct;
	this.setState(state);	
    },
    loadError: function(xhr, ajaxOptions, thrownError) {
	console.log(xhr.responseText);
    },
    loadOptions: function(name, url) {
	if (this.state.cache[url]!=undefined) {
	    this.loadSuccess(name, this.state.cache[url]);
	} else {
	    $.ajax({
		url: url,
		type: "GET",
		dataType: "json",
		success: function(struct) {
		    this.updateCache(url, struct);
		    this.loadSuccess(name, struct);
		}.bind(this),
		error: this.Error
	    });
	}
    },
    teamsUrl: function(params) {
	return "/api/teams?league="+params.league;
    },
    payoffsUrl: function(params) {
	return "/api/products/payoffs?product=single_teams&league="+params.league;
    },
    componentDidMount: function() {
	this.loadOptions("league", "/api/leagues");
	if (this.state.params.league!=undefined) {
	    this.loadOptions("team", this.teamsUrl(this.state.params));
	}
	if (this.state.params.team!=undefined) {
	    this.loadOptions("payoff", this.payoffsUrl(this.state.params));
	}
	this.loadOptions("expiry", "/api/expiries");
    },
    changeHandler: function(name, value) {
	if (this.state.params[name]!=value) {
	    var state=this.state;
	    state.params[name]=value;
	    if (name=="league") {
		// team
		state.options.team=[];
		state.params.team=undefined;
		this.loadOptions("team", this.teamsUrl(state.params));
		// payoff
		state.options.payoff=[];
		state.params.payoff=undefined;
		this.loadOptions("payoff", this.payoffsUrl(state.params));
	    };
	    this.setState(state);
	    console.log(JSON.stringify(this.state.params)); // TEMP
	}
    },
    reset: function() {
	var state=this.state
	state.params=this.props.params;
	this.setState(state);
    },
    render: function() {
	return React.DOM.div({
	    children: [
		React.createElement(
		    SimpleSelect, {
			label: "League",
			name: "league",
			options: this.state.options.league,
			value: this.state.params.league,
			changeHandler: this.changeHandler
		    }),
		React.createElement(
		    SimpleSelect, {
			label: "Team",
			name: "team",
			options: this.state.options.team,
			value: this.state.params.team,
			changeHandler: this.changeHandler
		    }),
		React.createElement(
		    SimpleSelect, {
			label: "Payoff",
			name: "payoff",
			options: this.state.options.payoff,
			value: this.state.params.payoff,
			changeHandler: this.changeHandler
		    }),
		React.createElement(
		    SimpleSelect, {
			label: "Expiry",
			name: "expiry",
			options: this.state.options.expiry,
			value: this.state.params.expiry,
			changeHandler: this.changeHandler
		    }),
		React.DOM.div({
		    className: "text-right",
		    children: React.DOM.button({
			className: "btn btn-danger",
			onClick: this.reset,
			children: "Reset"
		    })
		})
	    ]
	})
    }
});

