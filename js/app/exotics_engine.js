var SimpleSelect=React.createClass({
    getInitialState: function() {
	return {options: [],
		value: undefined};
    },
    filterSelectedValue: function(struct) {
	if (struct.length==0) {
	    return undefined;
	} else {
	    var selectedItems=struct.filter(function(item) {
		return item["selected"]==true;
	    });
	    if (selectedItems.length==0) {
		return struct[0].value;
	    } else {
		return selectedItems[0].value;
	    }
	}
    },
    loadSuccess: function(struct) {
	var value=this.filterSelectedValue(struct);
	this.setState({options: struct,
		       value: value});
	this.props.changeHandler(this.props.name, value);
    },
    loadError: function(xhr, ajaxOptions, thrownError) {
	console.log(xhr.responseText);
    },
    loadComponent: function(url) {
	this.setState({options: [],
		       value: undefined});
	this.props.changeHandler(this.props.name, undefined);
	$.ajax({
	    url: url,
	    type: "GET",
	    dataType: "json",
	    success: this.loadSuccess,
	    error: this.loadError
	});
    },
    componentDidMount: function() {
	if (this.props.url!=undefined) {
	    this.loadComponent(this.props.url);
	}
    },
    componentWillReceiveProps: function(nextProps) {	
	if ((nextProps.url!=undefined) && 
	    (this.props.url!=nextProps.url)) {
	    this.loadComponent(nextProps.url);
	}
    },
    render: function() {
	return React.DOM.div({
	    className: "form-group",
	    children: [
		React.DOM.label({
		    children: this.props.label
		}),
		React.DOM.select({
		    className: "form-control",
		    value: this.state.value,
		    onChange: function(event) {
			var value=event.target.value;
			this.setState({
			    value: value
			});
			this.props.changeHandler(this.props.name, value);
		    }.bind(this),
		    children: this.state.options.map(function(option) {
			return React.DOM.option({
			    value: option.value,
			    children: option.label || option.value
			})
		    })
		})
	    ]
	});
    }
});

var SingleTeamsPage=React.createClass({
    getInitialState: function() {
	return {params: {}};
    },
    isComplete: function(params) {
	return ((params.league!=undefined) &&
		(params.team!=undefined) &&
		(params.payoff!=undefined) &&
		(params.expiry!=undefined));
    },
    updatePrice: function(params) {
	var struct={"product": "single_teams",
		    "query": params};
	$.ajax({
	    type: "POST",
	    url: "/api/pricing",
	    data: JSON.stringify(struct),
	    contentType: "application/json",
	    dataType: "json",
	    success: function(struct) {
		console.log(JSON.stringify(struct));
	    }
	});
    },
    changeHandler: function(name, value) {
	var params=this.state.params;
	params[name]=value;
	this.setState({
	    params: params
	});
	if (this.isComplete(params)) {
	    this.updatePrice(params);
	};
    },
    initTeamsUrl: function(params) {
	if (params.league==undefined) {
	    return undefined;
	} else {
	    return "/api/teams?league="+params["league"];
	}
    },
    initPayoffsUrl: function(params) {
	if (params.league==undefined) {
	    return undefined;
	} else {
	    return "/site/single_teams/payoff?league="+params["league"];
	}
    },
    render: function() {	
	return React.DOM.div({
	    className: "row",
	    children: [
		React.DOM.div({
		    className: "col-xs-3",
		}),
		React.DOM.div({
		    className: "col-xs-6",
		    children: [			
			React.createElement(
			    SimpleSelect, {
				label: "League",
				name: 'league',
				url: '/api/leagues',
				changeHandler: this.changeHandler
			    }),
			React.createElement(
			    SimpleSelect, {
				label: "Team",
				name: 'team',
				url: this.initTeamsUrl(this.state.params),
				changeHandler: this.changeHandler
			    }),
			React.createElement(
			    SimpleSelect, {
				label: "Payoff",
				name: 'payoff',
				url: this.initPayoffsUrl(this.state.params),
				changeHandler: this.changeHandler
			    }),
			React.createElement(
			    SimpleSelect, {
				label: "Expiry",
				name: 'expiry',
				url: '/api/expiries',
				changeHandler: this.changeHandler
			    }),
		    ]
		}),
		React.DOM.div({
		    className: "col-xs-3",
		})
	    ]
	});
    }
});

var Main=function() {
    var page=React.createElement(SingleTeamsPage, {})
    var container=$("div[id='form']")[0];
    ReactDOM.render(page, container);    
};
