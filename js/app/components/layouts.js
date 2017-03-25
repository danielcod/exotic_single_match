

var GridLayout=React.createClass({
    initItem: function(item, colwidth) {
	return React.DOM.div({
	    className: "col-xs-"+colwidth,
	    children: item
	});
    },
    initRow: function(row) {
	var colwidth=12/row.length;
	return React.DOM.div({
	    className: "row",
	    children: Array.isArray(row) ? row.map(function(item) {		
		return this.initItem(item, colwidth)
	    }.bind(this)) : this.initItem(row, 12)
	});
    },
    render: function() {
	return React.DOM.div({
	    children: this.props.rows.map(function(row) {
		return this.initRow(row);
	    }.bind(this))
	})
    }
});

var InlineList=React.createClass({
    render: function() {
	return React.DOM.ul({
	    className: "list-inline",
	    children: this.props.items.map(function(item) {
		return React.DOM.li({
		    style: {
			width: "100px"
		    },
		    children: item
		});
	    })
	});
    }
});
