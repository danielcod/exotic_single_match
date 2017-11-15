import React from 'react'
import {bindAll} from 'lodash'
import AccaProductLegTable from '../AccaProductLegTable'
import MyPaginator from '../../../molecules/MyPaginator'

export default class AccaProductPanelList extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            currentPage: 0
        }
        bindAll(this, ['handlePaginatorClicked', 'applyPaginatorWindow'])
    }

    handlePaginatorClicked(item) {
        this.setState({currentPage: item.value})
    }

    applyPaginatorWindow(items) {
        var rows = this.props.legsPaginator.rows
        var i = this.state.currentPage * rows
        var j = (this.state.currentPage + 1) * rows
        return items.slice(i, j)
    }

    render() {
        const {curates, clickHandler} = this.props
        return (
            <div id="exotic-acca-list">
                <div id="exotic-acca-table">
                    <AccaProductLegTable
                        clickHandler={clickHandler}
                        curates={this.applyPaginatorWindow(curates)}
                    />
                </div>
                {
                    curates.length > this.props.legsPaginator.rows ?
                        <MyPaginator
                            clickHandler={this.handlePaginatorClicked}
                            currentPage={this.state.currentPage}
                            product={this.props.legsPaginator}
                            data={curates}
                        />
                        : null
                }
            </div>
        )
    }
}