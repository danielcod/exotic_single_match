var SingleTeamsForm=React.createClass({
    deepCopy: function(struct) {
	return JSON.parse(JSON.stringify(struct));
    },
    getInitialState: function() {
	return {
	    options: {
		league: [],
		team: [],
		payoff: [],
		expiry: []
	    },
	    params: this.deepCopy(this.props.params),
	    id: Math.round(1e10*Math.random()),
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
    isComplete: function(params) {
	return ((params.league!=undefined) &&
		(params.team!=undefined) &&
		(params.payoff!=undefined) &&
		(params.expiry!=undefined));
    },
    updatePrice: function(params) {
	/*
	if (this.isComplete(params)) {
	    console.log(JSON.stringify(params));
	}
	*/
	console.log(JSON.stringify(params));
    },
    componentDidMount: function() {
	this.loadOptions("league", "/api/leagues");
	if (this.props.params.league!=undefined) {
	    this.loadOptions("team", this.teamsUrl(this.props.params));
	}
	if (this.props.params.team!=undefined) {
	    this.loadOptions("payoff", this.payoffsUrl(this.props.params));
	}
	this.loadOptions("expiry", "/api/expiries");
	this.updatePrice(this.state.params);
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
	    this.updatePrice(this.state.params);
	}
    },
    reset: function() {
	var state=this.state;
	state.params=this.deepCopy(this.props.params);
	state.id=Math.round(1e10*Math.random());
	this.setState(state);
	if (this.props.params.league!=undefined) {
	    this.loadOptions("team", this.teamsUrl(this.props.params));
	}
	if (this.props.params.team!=undefined) {
	    this.loadOptions("payoff", this.payoffsUrl(this.props.params));
	}
	this.updatePrice(this.state.params);
    },
    render: function() {
	return React.DOM.div({
	    children: [
		React.createElement(
		    SimpleSelect, {
			label: "League",
			name: "league",
			options: this.state.options.league,
			value: this.props.params.league,
			changeHandler: this.changeHandler,
			id: this.state.id
		    }),
		React.createElement(
		    SimpleSelect, {
			label: "Team",
			name: "team",
			options: this.state.options.team,
			value: this.props.params.team,
			changeHandler: this.changeHandler,
			id: this.state.id
		    }),
		React.createElement(
		    SimpleSelect, {
			label: "Payoff",
			name: "payoff",
			options: this.state.options.payoff,
			value: this.props.params.payoff,
			changeHandler: this.changeHandler,
			id: this.state.id
		    }),
		React.createElement(
		    SimpleSelect, {
			label: "Expiry",
			name: "expiry",
			options: this.state.options.expiry,
			value: this.props.params.expiry,
			changeHandler: this.changeHandler,
			id: this.state.id
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

