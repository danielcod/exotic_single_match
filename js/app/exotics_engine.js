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
    componentDidMount: function() {
	$.ajax({
	    url: this.props.url,
	    type: "GET",
	    dataType: "json",
	    success: this.loadSuccess,
	    error: this.loadError
	});
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
    changeHandler: function(name, value) {
	var params=this.state.params;
	params[name]=value;
	this.setState({
	    params: params
	});
	console.log(JSON.stringify(params));
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
