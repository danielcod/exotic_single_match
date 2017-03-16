var MiniLeagueRow=React.createClass({
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
		team: []
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
    changeHandler: function(name, value) {
	if (this.state.product[name]!=value) {
	    var state=this.state;
	    state.product[name]=value;
	    if (name=="league") {
		state.options.team=[];
		state.product.team=undefined;
		this.fetchTeams(state.product);
	    }
	    this.setState(state);
	    this.props.changeHandler(this.props.product.id, name, value);
	}
    },
    addHandler: function() {
	this.props.addHandler(this.props.product.id);
    },
    deleteHandler: function() {
	if (!this.props.product.disabled) {
	    this.props.deleteHandler(this.props.product.id);
	}
    },
    componentWillReceiveProps: function(nextProps) {
	if (JSON.stringify(this.state.product)!=
	    JSON.stringify(nextProps.product)) {
	    var state=this.state;
	    state.product=deepCopy(nextProps.product);
	    this.fetchTeams(state.product);
	    this.setState(state);
	}
    },
    initialise: function() {
	this.fetchLeagues();
	this.fetchTeams(this.state.product);
    },
    componentDidMount: function() {
	this.initialise();
    },    
    render: function() {
	return React.DOM.tr({
	    children: [
		React.DOM.td({
		    style: {
			"margin-top": "0px",
			"margin-bottom": "0px",
			"padding-top": "0px",
			"padding-bottom": "0px"
		    },
		    children: React.DOM.a({
			className: "btn btn-secondary",
			children: React.DOM.i({
			    className: "glyphicon glyphicon-plus-sign"
			}),
			onClick: this.addHandler
		    })
		}),
		React.DOM.td({
		    style: {
			"margin-top": "0px",
			"margin-bottom": "0px",
			"padding-top": "12px",
			"padding-bottom": "0px"
		    },
		    children: React.createElement(
			MySelect, {
			    name: "league",
			    options: this.formatLeagueOptions(this.state.options.league),
			    value: this.state.product.league,
			    changeHandler: this.changeHandler,
			    blankStyle: this.props.blankStyle
			}
		    )
		}),		
		React.DOM.td({
		    style: {
			"margin-top": "0px",
			"margin-bottom": "0px",
			"padding-top": "12px",
			"padding-bottom": "0px"
		    },
		    children: React.createElement(
			MySelect, {
			    name: "team",
			    options: this.formatTeamOptions(this.state.options.team),
			    value: this.state.product.team,
			    changeHandler: this.changeHandler,
			    blankStyle: this.props.blankStyle
			}
		    )
		}),
		React.DOM.td({
		    style: {
			"margin-top": "0px",
			"margin-bottom": "0px",
			"padding-top": "0px",
			"padding-bottom": "0px"
		    },
		    children: React.DOM.a({
			className: "btn btn-"+(this.props.product.disabled ? "default" : "secondary"),
			children: React.DOM.i({
			    className: "glyphicon glyphicon-remove"
			}),
			onClick: this.deleteHandler
		    })
		})
	    ]
	})				    
    }
});

var MiniLeagueForm=React.createClass({
    itemUuid: function() {
	return Math.round(Math.random()*1e16);
    },
    initParams: function(product) {
	if (product.versus==undefined) {
	    product.versus=[{}, {}]; // two rows by default
	}
	for (var i=0; i < product.versus.length; i++) {
	    var item=product.versus[i];
	    item.id=this.itemUuid();
	    item.disabled=(i==0);
	}
	return product;
    },
    getInitialState: function() {
	return {
	    product: this.initParams(deepCopy(this.props.product))
	}
    },
    addHandler: function(id) { // id currently not used
	var state=this.state;
	state.product.versus.push({
	    id: this.itemUuid(),
	    disabled: false
	});
	this.setState(state);
	this.updatePrice(state.product);
    },
    changeHandler: function(id, name, value) {
	var state=this.state;
	var updated=false;
	for (var i=0; i < state.product.versus.length; i++) {
	    var item=state.product.versus[i];
	    if (item.id==id) {		
		if (item[name]!=value) {
		    item[name]=value;
		    if (name=="league") {
			item.team=undefined; // NB reset team
		    }
		    updated=true;
		}
	    }
	}
	if (updated) {
	    this.setState(state);
	    this.updatePrice(state.product);
	}
    },
    deleteHandler: function(id) {
	var state=this.state;
	var versus=state.product.versus.filter(function(item) {
	    return item.id!=id;
	});
	state.product.versus=versus;
	this.setState(state);
	this.updatePrice(state.product);
    },
    isComplete: function(product) {
	// check min length
	if (product.versus.length < 2) {
	    return false;
	}
	// check undefined fields
	for (var i=0; i < product.versus.length; i++) {
	    var item=product.versus[i];
	    if ((item.league==undefined) ||
		(item.team==undefined)) {
		return false;
	    }
	}
	// check unique team names
	var teamnames=[];
	for (var i=0; i < product.versus.length; i++) {
	    var item=product.versus[i];
	    if (teamnames.indexOf(item.team)==-1) {
		teamnames.push(item.team);
	    }
	}
	if (teamnames.length!=product.versus.length) {
	    return false
	}
	return true;
    },
    priceHandler: function(struct) {
	$("span[id='price']").text(struct["price"]);
    },
    updatePrice: function(product) {
	if (this.isComplete(product)) {
	    $("span[id='price']").text("[updating ..]");
	    var struct={
		"type": "mini_league",
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
	this.updatePrice(this.state.product); 
    },
    componentDidMount: function() {
	this.initialise();
    },
    render: function() {	
	return React.DOM.div({
	    children: [
		React.DOM.div({
		    className: "row",
		    children: React.DOM.div({
			className: "col-xs-12",
			children: React.DOM.table({
			    className: "table",
			    style: {
				margin: "0px",
				padding: "0px"
			    },
			    children: [
				React.DOM.thead({
				    children: React.DOM.tr({
					children: [
					    React.DOM.th({
						children: []
					    }),
					    React.DOM.th({
						className: "text-center",
						colSpan: 2,
						children: "Versus"
					    }),
					    React.DOM.th({
						children: []
					    })
					]
				    })
				}),		
				React.DOM.tbody({
				    children: this.state.product.versus.map(function(product) {
					return React.createElement(MiniLeagueRow, {
					    product: product,
					    exoticsApi: this.props.exoticsApi,
					    blankStyle: this.props.blankStyle,
					    changeHandler: this.changeHandler,
					    deleteHandler: this.deleteHandler,
					    addHandler: this.addHandler
					});
				    }.bind(this))
				})
			    ]
			})
		    })					    
		})
	    ]
	});
    }
});
