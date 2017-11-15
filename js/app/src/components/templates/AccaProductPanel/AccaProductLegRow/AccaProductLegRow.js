import React from 'react'
import {formatPrice} from '../../../utils'

export default class AccaProductLegRow extends React.PureComponent {
    render() {
        const {curate, clickHandler} = this.props
        return (
            <tr className="leg-row">
                <td className="leg-row-descr">
                    <div>
                        <span className="bold">
                            {curate.fixture}
                        </span>
                    </div>
                    <span className="desc" style={{marginTop: "5px"}}>
                        {curate.as_string}
                    </span>
                    <span className="goal label">
                        {"Any " + curate.price_to_show + "+ of " + curate.legs}
                    </span>
                </td>
                <td className="leg-row-price">
                    <span>
                        {formatPrice(curate[curate.price_to_show].price)}
                    </span>
                </td>
                <td onClick={clickHandler.bind(null, curate)}>
                    <a className="btn btn-secondary">
                        <i className="glyphicon glyphicon-pencil"></i>
                    </a>
                </td>
            </tr>
        )
    }
}