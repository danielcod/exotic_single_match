import React from 'react'
import AccaProductLegRow from '../AccaProductLegRow'

export default class AccaProductLegTable extends React.PureComponent {
    render() {
        const {curates, clickHandler} = this.props
        return (
            <div id="exotic-acca-items">
                {
                    curates.map(function (curate, key) {
                        return (
                            <AccaProductLegRow
                                key={key}
                                clickHandler={clickHandler}
                                curate={curate}/>
                        )
                    })
                }
            </div>
        )
    }
}