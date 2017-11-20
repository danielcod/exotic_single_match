import React from 'react'
import AccaProductLegRow from '../AccaProductLegRow'

export default class AccaProductLegTable extends React.PureComponent {
    render() {
        const {curates, clickHandler} = this.props
        return (
            <table className="table table-condensed table-striped"
                   style={{marginTop: '0px', marginBottom: "0px"}}>
                <tbody>
                {
                    curates.map(function (curate, key) {
                        return (
                            <AccaProductLegRow
                            key={key}
                            clickHandler={clickHandler}
                            curate={curate}/>)
                    })
                }
                </tbody>
            </table>
        )
    }
}