import React from 'react'
import {formatPrice} from '../../../utils'
import * as DU from '../../../date_utils'

export default class AccaCurateLegRow extends React.PureComponent {
    render() {
        const {curate, clickHandler} = this.props
        return (
            <div id="exotic-acca-item">
                <div className="leg-name">
                    <span className="bold">
                        {curate.fixture}
                    </span>
                </div>
                <table className="table table-condensed table-striped"
                       style={{marginTop: '0px', marginBottom: "0px"}}>
                    <tbody>
                        <tr className="leg-row">
                            <td className="leg-row-descr">
                                <span className="desc" style={{marginTop: "5px"}}>
                                    {curate.as_string}
                                </span>
                                <span className={"leg leg-" + curate.legs + " label bold"}>
                                    {"Any " + (curate.price_to_show + 1) + (curate.price_to_show + 1 < curate.legs ? "+ of " : " of ") + curate.legs}
                                </span>
                                <span className="playtime bold">
                                    {DU.DateUtils.formatHour(new Date(curate.kickoff))}
                                </span>
                                <span className="league bold">
                                    {curate.league}
                                </span>
                            </td>
                            <td className="leg-row-price">
                                <span>
                                    {formatPrice(curate['exotic_prices'][curate.price_to_show])}
                                </span>
                            </td>
                            <td onClick={clickHandler.bind(null, curate)}>
                                <a className="btn btn-secondary">
                                    <i className="glyphicon glyphicon-pencil"></i>
                                </a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}