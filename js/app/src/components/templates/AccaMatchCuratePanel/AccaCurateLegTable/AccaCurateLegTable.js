import React from 'react'
import AccaCurateLegRow from '../AccaCurateLegRow'

export default class AccaCurateLegTable extends React.PureComponent {
    render() {
        const {curates, clickHandler} = this.props
        return (
            <div id="exotic-acca-items">
                {
                    curates.map(function (curate, key) {
                        return (
                            <AccaCurateLegRow
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