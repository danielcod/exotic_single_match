var SelectorRow=React.createClass({
    getInitialState: function() {
	return {
	    item: this.props.item
	};
    },
    changeHandler: function(struct) {
	var state=this.state;
	for (var attr in struct) {
	    if (struct[attr]!=state.item[attr]) {
		state.item[attr]=struct[attr]
	    }
	}
	this.setState(state);
	this.props.changeHandler(this.props.item.id, struct);
    },
    deleteHandler: function() {
	this.props.deleteHandler(this.props.item.id);
    },
    componentWillReceiveProps: function(nextProps) {
	if (JSON.stringify(this.state.item)!=
	    JSON.stringify(nextProps.item)) {
	    var state=this.state;
	    state.item=nextProps.item;
	    this.setState(state);
	}
    },
    render: function() {
	return React.DOM.tr({
	    children: [
		React.DOM.td({
		    style: {
			"margin-left": "0px",
			"padding-left": "0px"
		    },
		    children: React.createElement(this.props.selectorClass, {
			exoticsApi: this.props.exoticsApi,
			item: this.state.item,
			changeHandler: this.changeHandler,
			blankStyle: this.props.blankStyle,
			defaultOption: this.props.defaultOption
		    })
		}),		
		React.DOM.td({
		    style: {
			"margin-right": "0px",
			"padding-right": "0px"
		    },
		    children: React.DOM.a({
			className: "btn btn-secondary",
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

var SelectorTable=React.createClass({
    uuid: function() {
	return Math.round(Math.random()*1e16);
    },
    initItems: function(items) {
	if (items.length==0) {
	    items.push({});
	}
	for (var i=0; i < items.length; i++) {
	    var item=items[i];
	    item.id=this.uuid();
	}
	return items;
    },
    getInitialState: function() {
	return {
	    items: this.initItems(this.props.items)
	}
    },
    addHandler: function() { 
	var state=this.state;
	var items=state.items;
	items.push({
	    id: this.uuid()
	});
	state.items=items;
	this.setState(state);
	this.props.changeHandler(state.items);
    },
    changeHandler: function(id, struct) {
	var state=this.state;
	for (var i=0; i < state.items.length; i++) {
	    var item=state.items[i];
	    if (item.id==id) {
		for (attr in struct) {
		    item[attr]=struct[attr];
		}
	    }
	}
	this.setState(state);
	this.props.changeHandler(state.items);
    },
    deleteHandler: function(id) {
	if (this.state.items.length > 1) {
	    var state=this.state;
	    var items=state.items.filter(function(item) {
		return item.id!=id;
	    });
	    state.items=items;
	    this.setState(state);
	    this.props.changeHandler(state.items);
	}
    },    
    render: function() {
	return React.DOM.div({
	    className: "form-group",
	    children: [
		React.DOM.label({
		    children: this.props.label
		}),
		React.DOM.table({
		    className: "table",
		    style: {
			"margin-top": "0px",
			"margin-bottom": "0px"
		    },
		    children: React.DOM.tbody({
			children: this.state.items.map(function(item) {
			    return React.createElement(SelectorRow, {
				selectorClass: this.props.selectorClass,
				item: item,
				exoticsApi: this.props.exoticsApi,
				blankStyle: this.props.blankStyle,
				defaultOption: this.props.defaultOption,
				changeHandler: this.changeHandler,
				deleteHandler: this.deleteHandler
			    });
			}.bind(this))
		    })
		}),
		React.DOM.div({
		    className: "text-center",
		    children: React.DOM.a({
			className: "btn btn-secondary",
			style: {
			    "margin-top": "10px"
			},
			onClick: function() {
			    this.addHandler();
			}.bind(this),
			children: this.props.addLabel
		    })
		})
	    ]
	});		
    }
});

