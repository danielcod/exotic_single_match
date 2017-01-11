/*
  weird things happen if you use value=undefined; code will send label as value rather than an undefined value; so set value='' and then convert at changeHandler level
*/

var BlankSelectOption={label: "Select",
		       value: ""};

/*
  NB there's difference here between 'target_value' and 'visible value'
  the two may not be the same because target_value may not be present in options
  if target_value isn't part of options then the select will automatically show the first option, which in this case is structured to be the blank option
*/

var AjaxSelect=React.createClass({
    getInitialState: function() {
	return {options: [BlankSelectOption],
		target_value: this.props.value,
		visible_value: undefined};
    },
    filterVisibleValue: function(struct) {
	var items=struct.filter(function(item) {
	    return item.value==this.state.target_value;
	}.bind(this));
	return (items.length > 0) ? this.state.target_value : undefined;
    },
    loadSuccess: function(struct) {
	var state=this.state;
	state["options"]=[BlankSelectOption].concat(struct);
	state["visible_value"]=this.filterVisibleValue(struct);	
	this.setState(state);
	this.props.changeHandler(this.props.name, this.state.visible_value);
    },
    loadError: function(xhr, ajaxOptions, thrownError) {
	console.log(xhr.responseText);
    },
    loadComponent: function(url) {
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
		React.DOM.select({
		    className: "form-control",
		    value: this.state.target_value,
		    style: (this.state.visible_value==undefined) ? {border: "3px solid #F88"} : {},
		    onChange: function(event) {
			var value=(event.target.value!='') ? event.target.value : undefined; // NB conversion of blank string to undefined
			this.setState({
			    target_value: value,
			    visible_value: value
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

var SingleTeamsForm=React.createClass({
    getInitialState: function() {
	return {
	    params: {}
	};
    },
    isComplete: function(params) {
	return ((params.league!=undefined) &&
		(params.team!=undefined) &&
		(params.expiry!=undefined));
    },
    changeHandler: function(name, value) {
	var params=this.state.params;
	params[name]=value;
	if (name=="league") {
	    params.team=undefined; // NB
	};
	this.setState({
	    params: params
	});
	if (this.isComplete(params)) {
	    console.log(JSON.stringify(params));
	};
    },
    initTeamsUrl: function(params) {
	return (params.league!=undefined) ? "/site/teams?league="+params.league : undefined;
    },
    render: function() {	
	return React.DOM.div({
	    children: [
		React.createElement(
		    AjaxSelect, {
			name: "league",
			url: '/site/leagues',
			value: this.props.league,
			changeHandler: this.changeHandler
		    }),
		React.createElement(
		    AjaxSelect, {
			name: 'team',
			url: this.initTeamsUrl(this.state.params),
			value: this.props.team,
			changeHandler: this.changeHandler
		    }),
		React.createElement(
		    AjaxSelect, {
			name: "expiry",
			url: '/site/expiries',
			value: this.props.expiry,
			changeHandler: this.changeHandler
		    })
	    ]
	});
    }
});

var MiniLeaguesForm=React.createClass({
    render: function() {
	return React.DOM.div({
	    className: "text-center",
	    children: React.DOM.h3({
		children: "[Mini Leagues form goes here]"
	    })
	});
    }
});

var ProductMapping={
    "single_teams": SingleTeamsForm,
    "mini_leagues": MiniLeaguesForm
};

var ProductSelect=React.createClass({
    getInitialState: function() {
	return {
	    value: this.props.value
	}
    },
    render: function() {
	return React.DOM.div({
	    className: "form-group",
	    children: [
		React.DOM.select({
		    className: "form-control",
		    value: this.state.value,
		    onChange: function(event) {
			var value=event.target.value;
			this.setState({
			    value: value
			});
			this.props.changeHandler(value);
		    }.bind(this),
		    children: this.props.options.map(function(option) {
			return React.DOM.option({
			    value: option.name,
			    children: option.label || option.name
			})
		    })
		})
	    ]
	});
    }	
});

var DesignForm=React.createClass({
    getInitialState: function() {
	return {
	    products: [],
	    product: undefined
	};
    },
    loadSuccess: function(struct) {
	var state=this.state;
	for (var key in struct) {
	    state[key]=struct[key];
	}
	this.setState(state);
    },
    loadError: function(xhr, ajaxOptions, thrownError) {
	console.log(xhr.responseText);
    },
    loadComponent: function(url) {
	$.ajax({
	    url: url,
	    type: "GET",
	    dataType: "json",
	    success: this.loadSuccess,
	    error: this.loadError
	});
    },
    componentDidMount: function() {
	var url="/site/design/init?product_id="+this.props.product_id;
	this.loadComponent(url);
    },
    productChangeHandler: function(value) {
	var state=this.state;
	state["product"]={
	    type: value,
	    query: {}
	};
	this.setState(state);
    },
    render: function() {
	return React.DOM.div({
	    children: (this.state.product!=undefined) ? [
		React.createElement(ProductSelect, {
		    options: this.state.products,
		    value: this.state.product.type,
		    changeHandler: this.productChangeHandler
		}),
		React.createElement(ProductMapping[this.state.product.type], this.state.product.query)
	    ] : []
	});
    }
});

var Main=function() {
    var productId=$("input[name='product_id']").val();
    var page=React.createElement(DesignForm, {
	product_id: productId
    });
    var container=$("div[id='design']")[0];
    ReactDOM.render(page, container);    
};
