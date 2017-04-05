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
	    item: this.props.item
	};
    },
    fetchMatches: function() {
	var handler=this.initOptionsHandler("match");
	this.props.exoticsApi.fetchBlob("matches", handler);
    },
    sortMatches: function(item0, item1) {
	var value0=item0.match+"/"+item0.kickoff;
	var value1=item1.match+"/"+item1.kickoff;
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
	    // return match.match+" ("+match.league+") ["+match.kickoff+"]";
	    return match.match+" ("+match.league+")";
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
