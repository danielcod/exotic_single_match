var SimpleSelect=React.createClass({
    getInitialState: function() {
	return {options: [],
		value: undefined};
    },
    loadSuccess: function(struct) {
	var selectedValue=struct.filter(function(item) {
	    return item["selected"]==true;
	})[0]["name"];
	this.setState({options: struct,
		       value: selectedValue});
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
	return React.DOM.select({
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
	});
    }
});

var SingleTeamsPage=React.createClass({
    changeHandler: function(name, value) {
	console.log(name+"="+value);
    },
    render: function() {
	return React.DOM.div({
	    children: React.createElement(
		SimpleSelect, {
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
