import React from 'react'

export default class MyPaginator extends React.PureComponent {
    constructor(props) {
        super(props)
    }

    initPaginatorItems(tableData, nTableRows) {
        let n = Math.floor(tableData.length / nTableRows)
        if (0 != tableData.length % nTableRows) {
            n += 1
        }
        if (n > 6) n = 6
        let items = []
        for (let i = 0; i < n; i++) {
            let item = {
                value: i,
                label: i + 1
            }
            items.push(item)
        }
        return items
    }

    render() {
        return (
            <div className="text-center paginator">
                <ul className="pagination">
                    {
                        this.initPaginatorItems(this.props.data, this.props.product.rows).map(function (item, key) {
                            return (
                                <li key={key} className={item.value == this.props.currentPage ? "active" : ""}
                                    onClick={this.props.clickHandler.bind(null, item)}
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