var MyPaginator=React.createClass({
    getInitialState: function() {
	return {};
    },
    initPaginatorItems: function(tableData, nTableRows) {
	var n=Math.floor(tableData.length/nTableRows);
	if (0 != tableData.length % nTableRows) {
	    n+=1;
	}
	var items=[];
	for (var i=0; i < n; i++) {
	    var item={
		value: i,
		label: i+1
	    }
	    items.push(item);
	}
	return items;
    },
    render: function() {
	return React.DOM.div({
	    className: "text-center",
	    children: React.DOM.ul({
		className: "pagination",
		children: this.initPaginatorItems(this.props.data, this.props.product.rows).map(function(item) {
		    return React.DOM.li({
			className: (item.value==this.props.currentPage) ? "active" : "",
			onClick: this.props.clickHandler.bind(null, item),
			children: React.DOM.a({
			    children: item.label
			})
		    })
		}.bind(this))
	    })
	});
    }
});
