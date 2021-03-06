import React from 'react';
import BetRow from '../../molecules/BetRow';
import * as products from '../../products';
import {formatObjectYourBet} from '../../utils';

export default class MatchBetsTable extends React.PureComponent {
    render() {
        const {accaProductPanelState, bets, clickHandler, match} = this.props;
        return (
            <table className="table table-condensed table-striped  text-center"
                   style={{marginTop: '0px', marginBottom: "0px"}}>
                <tbody>
                {
                    bets.map(function (bet, key) {
                        return (<BetRow
                            key={key}
                            clickHandler={clickHandler}
                            accaProductPanelState={accaProductPanelState}
                            matchBets={true}
                            leg={bet}/>)
                    })
                }
                </tbody>
            </table>
        )
    }
}