import React from 'react';

export default class MyPaginator extends React.PureComponent{
   constructor(props){
       super(props);
   }
    initPaginatorItems(tableData, nTableRows) {
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
    }

    render() {
        return (
            <div className= "text-center">
                <ul className = "pagination">
                    {
                        this.initPaginatorItems(this.props.data, this.props.product.rows).map(function(item, key) {
                            return (
                                <li key={key} className = {item.value==this.props.currentPage ? "active" : ""}
                                    onClick= {this.props.clickHandler.bind(null, item)}
                                >
                                    <a>
                                        {item.label}
                                    </a>
                                </li>
                            )
                        }.bind(this))
                    }
                </ul>
            </div>
        )
    }   
}