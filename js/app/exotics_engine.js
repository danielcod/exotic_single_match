var SimpleSelect=React.createClass({
    getInitialState: function() {
	return {options: [],
		value: undefined};
    },
    loadSuccess: function(struct) {
	var value=struct.filter(function(item) {
	    return item["selected"]==true;
	})[0]["name"];
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
			    children: option.name
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
	    children: React.createElement(
		SimpleSelect, {
		    label: "League",
		    name: 'league',
		    url: '/api/leagues',
		    changeHandler: this.changeHandler
		})
	});
    }
});

var Main=function() {
    var page=React.createElement(SingleTeamsPage, {})
    var container=$("div[id='form']")[0];
    ReactDOM.render(page, container);    
};
