import React from 'react';
import DateTimeCell from '../../atoms/DateTimeCell';
import classnames from 'classnames'
import * as s from './index.css';

export default class StakeTable extends React.PureComponent {
    render() {
        const {bets, match} = this.props;        
        return (
            <table className="table table-condensed table-striped  text-center"
                   style={{marginTop: '0px', marginBottom: "0px"}}>
                <tbody>
                {
                    bets.map(function (bet, key) {                                                                      
                            return (
                                 <tr key={key} className="leg-row">
                                    <td className={classnames(s['tb-rd'], "leg-row-date")}>
                                        <DateTimeCell
                                            value={bet.match.kickoff}
                                            type="datetime"/>
                                    </td>
                                    <td className={classnames(s['tb-rd'], "leg-row-descr")} >
                                        {bet.description}
                                    </td>
                                    <td className={classnames(s['tb-rd'])}>
                                        <span>?</span>
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