import React from 'react'
import DateTimeCell from '../../atoms/DateTimeCell';
import * as constant from '../../constant';
import classnames from 'classnames'
import * as s from './index.css'

export default class StakeTable extends React.PureComponent {
    render() {
        const {bets, match, status} = this.props
        return (
            <table className="table table-condensed table-striped  text-center"
                   style={{marginTop: '0px', marginBottom: "0px"}}>
                <tbody>
                {
                    bets.map(function (bet, key) {
                        const imgSrc = 'img/' + bet.name + '-light.png';
                        return (
                            <tr key={key} className="leg-row">
                                <td className={classnames(s['tb-rd'], "leg-row-date")}>
                                    <div className={s['title-img']} title={bet.name}>
                                        <img src={imgSrc}/>
                                    </div>
                                </td>
                                <td className={classnames(s['tb-rd'], "leg-row-descr")}>
                                    {bet.description}
                                </td>
                                {
                                    bet.win !== undefined ?
                                        bet.win ?
                                            <td className={classnames(s['tb-rd'])}>
                                                <span className="glyphicon glyphicon-ok"></span>
                                            </td>
                                            :
                                            <td className={classnames(s['tb-rd'])}>
                                                <span className="glyphicon glyphicon-remove"></span>
                                            </td>
                                        :
                                        null
                                }
                                <td className={classnames(s['tb-rd'])}>
                                    <span>{status !== null && status === true ? bet.price : "?"}</span>
                                </td>
                            </tr>
                        )
                    })
                }
                </tbody>
            </table>
        )
    }
}