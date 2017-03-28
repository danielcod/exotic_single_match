// selectors which have objects for core values behave badly when embedded in table unless those objects are copied by value and not by reference

var ProductSelector=React.createClass({
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
		product: []
	    },
	    product: this.props.product
	};
    },
    fetchProducts: function() {
	var handler=this.initOptionsHandler("product");
	this.props.exoticsApi.fetchProducts(handler);
    },
    sortProducts: function(item0, item1) {
	if (item0.type < item1.type) {
	    return -1;
	} else if (item0.type > item1.type) {
	    return 1;
	} else {
	    return 0;
	}
    },
    formatProductLabel: function(product) {
	if (product==undefined) {
	    return undefined;
	} else {
	    return product.label;
	}
    },
    formatProductValue: function(product) {
	if (product==undefined) {
	    return undefined;
	} else {
	    return product.type;
	}
    },
    formatProductOptions: function(products) {
	return products.sort(this.sortProducts).map(function(product) {
	    return {
		label: this.formatProductLabel(product),
		value: this.formatProductValue(product)
	    }
	}.bind(this));
    },
    changeHandler: function(name, value) {
	if (this.state[name]!=value) {
	    var state=this.state;
	    state[name]=value;
	    this.setState(state);
	    this.props.changeHandler(name, value);
	}
    },
    initialise: function() {
	this.fetchProducts();
    },
    componentDidMount: function() {
	this.initialise();
    },
    render: function() {
	return React.createElement(MySelect, {
	    changeHandler: this.changeHandler,
	    options: this.formatProductOptions(this.state.options.product),
	    value: this.formatProductValue(this.state.product),
	    // pass thru attributes
	    blankStyle: this.props.blankStyle,
	    className: this.props.className,
	    defaultOption: this.props.defaultOption,
	    label: this.props.label,
	    name: this.props.name || "product"
	});
    }
});

var TeamSelector=React.createClass({
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
		team: [],
	    },
	    item: JSON.parse(JSON.stringify(this.props.item)) // *** NB ***
	};
    },
    fetchTeams: function() {
	var handler=this.initOptionsHandler("team");
	this.props.exoticsApi.fetchBlob("teams", handler);
    },
    sortTeams: function(item0, item1) {
	if (item0.team < item1.team) {
	    return -1;
	} else if (item0.team > item1.team) {
	    return 1;
	} else {
	    return 0;
	}
    },
    formatTeamLabel: function(team) {
	if ((team.league==undefined) ||
	    (team.team==undefined)) {
	    return undefined;
	} else {
	    return team.team+" ("+team.league+")";
	}
    },
    formatTeamValue: function(team) {
	if ((team.league==undefined) ||
	    (team.team==undefined)) {
	    return undefined;
	} else {
	    return team.league+"/"+team.team;
	}
    },    
    formatTeamOptions: function(teams) {
	return teams.sort(this.sortTeams).map(function(team) {
	    return {
		label: this.formatTeamLabel(team),
		value: this.formatTeamValue(team)
	    }
	}.bind(this));
    },
    changeHandler: function(name, value) {
	var tokens=value.split("/");
	var leaguename=tokens[0];
	var teamname=tokens[1];
	var state=this.state;
	state.item.league=leaguename;
	state.item.team=teamname;
	this.setState(state);
	this.props.changeHandler(state.item);
    },
    componentWillReceiveProps: function(nextProps) {
	if (JSON.stringify(this.state.item)!=
	    JSON.stringify(nextProps.item)) {
	    var state=this.state;
	    state.item=nextProps.item;
	    this.setState(state);
	}
    },
    initialise: function() {
	this.fetchTeams();
    },
    componentDidMount: function() {
	this.initialise();
    },
    render: function() {
	return React.createElement(MySelect, {
	    changeHandler: this.changeHandler,
	    options: this.formatTeamOptions(this.state.options.team),
	    value: this.formatTeamValue(this.state.item),
	    // pass thru attributes
	    blankStyle: this.props.blankStyle,
	    className: this.props.className,
	    defaultOption: this.props.defaultOption,
	    label: this.props.label,
	    name: this.props.name || "team"
	});
    }
});

var MatchTeamSelector=React.createClass({
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
		team: [],
	    },
	    item: JSON.parse(JSON.stringify(this.props.item)) // *** NB ***
	};
    },
    fetchTeams: function() {
	var handler=this.initOptionsHandler("team");
	this.props.exoticsApi.fetchBlob("match_teams", handler);
    },
    sortTeams: function(item0, item1) {
	var value0=item0.team+"/"+item0.date;
	var value1=item1.team+"/"+item1.date;
	if (value0 < value1) {
	    return -1;
	} else if (value0 > value1) {
	    return 1;
	} else {
	    return 0;
	}
    },
    formatTeamLabel: function(team) {
	if ((team.league==undefined) ||
	    (team.team==undefined)) {
	    return undefined;
	} else {
	    return team.team+" (vs "+team.versus+" :: "+team.league+") ["+team.date+"]";
	}
    },
    formatTeamValue: function(team) {
	if ((team.league==undefined) ||
	    (team.team==undefined)) {
	    return undefined;
	} else {
	    return team.league+"/"+team.team;
	}
    },    
    formatTeamOptions: function(teams) {
	return teams.sort(this.sortTeams).map(function(team) {
	    return {
		label: this.formatTeamLabel(team),
		value: this.formatTeamValue(team)
	    }
	}.bind(this));
    },
    changeHandler: function(name, value) {
	var tokens=value.split("/");
	var leaguename=tokens[0];
	var teamname=tokens[1];
	var state=this.state;
	state.item.league=leaguename;
	state.item.team=teamname;
	this.setState(state);
	this.props.changeHandler(state.item);
    },
    componentWillReceiveProps: function(nextProps) {
	if (JSON.stringify(this.state.item)!=
	    JSON.stringify(nextProps.item)) {
	    var state=this.state;
	    state.item=nextProps.item;
	    this.setState(state);
	}
    },
    initialise: function() {
	this.fetchTeams();
    },
    componentDidMount: function() {
	this.initialise();
    },
    render: function() {
	return React.createElement(MySelect, {
	    changeHandler: this.changeHandler,
	    options: this.formatTeamOptions(this.state.options.team),
	    value: this.formatTeamValue(this.state.item),
	    // pass thru attributes
	    blankStyle: this.props.blankStyle,
	    className: this.props.className,
	    defaultOption: this.props.defaultOption,
	    label: this.props.label,
	    name: this.props.name || "team"
	});
    }
});

var MatchSelector=React.createClass({
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
		match: [],
	    },
	    item: JSON.parse(JSON.stringify(this.props.item)) // *** NB ***
	};
    },
    fetchMatches: function() {
	var handler=this.initOptionsHandler("match");
	this.props.exoticsApi.fetchBlob("matches", handler);
    },
    sortMatches: function(item0, item1) {
	var value0=item0.match+"/"+item0.date;
	var value1=item1.match+"/"+item1.date;
	if (value0 < value1) {
	    return -1;
	} else if (value0 > value1) {
	    return 1;
	} else {
	    return 0;
	}
    },
    formatMatchLabel: function(match) {
	if ((match.league==undefined) ||
	    (match.match==undefined)) {
	    return undefined;
	} else {
	    return match.match+" ("+match.league+") ["+match.date+"]";
	}
    },
    formatMatchValue: function(match) {
	if ((match.league==undefined) ||
	    (match.match==undefined)) {
	    return undefined;
	} else {
	    return match.league+"/"+match.match;
	}
    },    
    formatMatchOptions: function(matches) {
	return matches.sort(this.sortMatches).map(function(match) {
	    return {
		label: this.formatMatchLabel(match),
		value: this.formatMatchValue(match)
	    }
	}.bind(this));
    },
    changeHandler: function(name, value) {
	var tokens=value.split("/");
	var leaguename=tokens[0];
	var matchname=tokens[1];
	var state=this.state;
	state.item.league=leaguename;
	state.item.match=matchname;
	this.setState(state);
	this.props.changeHandler(state.item);
    },
    componentWillReceiveProps: function(nextProps) {
	if (JSON.stringify(this.state.item)!=
	    JSON.stringify(nextProps.item)) {
	    var state=this.state;
	    state.item=nextProps.item;
	    this.setState(state);
	}
    },
    initialise: function() {
	this.fetchMatches();
    },
    componentDidMount: function() {
	this.initialise();
    },
    render: function() {
	return React.createElement(MySelect, {
	    changeHandler: this.changeHandler,
	    options: this.formatMatchOptions(this.state.options.match),
	    value: this.formatMatchValue(this.state.item),
	    // pass thru attributes
	    blankStyle: this.props.blankStyle,
	    className: this.props.className,
	    defaultOption: this.props.defaultOption,
	    label: this.props.label,
	    name: this.props.name || "match"
	});
    }
});

var ExpirySelector=React.createClass({
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
		expiry: []
	    },
	    expiry: this.props.expiry
	};
    },
    fetchExpiries: function() {
	var handler=this.initOptionsHandler("expiry");
	this.props.exoticsApi.fetchExpiries(handler);
    },
    formatExpiryOptions: function(expiries) {
	return expiries; // expiries come with label, value fields
    },
    changeHandler: function(name, value) {
	if (this.state[name]!=value) {
	    var state=this.state;
	    state[name]=value;
	    this.setState(state);
	    this.props.changeHandler(name, value);
	}
    },
    initialise: function() {
	this.fetchExpiries();
    },
    componentDidMount: function() {
	this.initialise();
    },
    render: function() {
	return React.createElement(MySelect, {
	    changeHandler: this.changeHandler,
	    options: this.formatExpiryOptions(this.state.options.expiry),
	    value: this.state.expiry,
	    // pass thru attributes
	    blankStyle: this.props.blankStyle,
	    className: this.props.className,
	    defaultOption: this.props.defaultOption,
	    label: this.props.label || "At",
	    name: this.props.name || "expiry"
	});
    }
});
