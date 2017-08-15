import React from 'react';
import {bindAll} from 'lodash';
import Accordion from 'react-bootstrap/lib/Accordion';
import Panel from 'react-bootstrap/lib/Panel';
import AccaLegTable from '../../../organisms/AccaLegTable';

export default class MyBetList extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            panelExpanded: false
        };
        bindAll(this, ['getHeader', 'getBetDetail', 'placedBetGoalFormatter', 'getLegsFromBet', 'formatCurrentPrice', '_toggleExpand']);
    }

    componentWillReceiveProps(newProps) {
        if (this.props.bets != newProps.bets) {
            this.setState({
                panelExpanded: false
            });
        }
    }

    getHeader(bet) {
        var header = bet.betType + ": " + bet.betCondition.nLegs + "+ of " + bet.betCondition.legs;
        switch (bet.betType) {
            case 'Winners': {
                bet.betCondition.nGoals > 1 ? header = header + " to win by " + bet.betCondition.nGoals + " goals" : header = header + " to just win";
                break;
            }
            case 'Pick Losers': {
                bet.betCondition.nGoals > 1 ? header = header + " to lose by " + bet.betCondition.nGoals + " goals" : header = header + " to just lose";
                break;
            }
            case 'Draws': {
                bet.betCondition.nGoals > 1 ? header = header + " to draw by " + bet.betCondition.nGoals + " goals" : header = header + " to just draw";
                break;
            }
        }
        return header;
    }

    placedBetGoalFormatter(bet) {
        switch (bet.betType) {
            case "Winners":
                return bet.betCondition.nGoals > 1 ? "To win by " + bet.betCondition.nGoals + "+ goals" : "To just win";
            case "Pick Losers":
                return bet.betCondition.nGoals > 1 ? "To lose by " + bet.betCondition.nGoals + "+ goals" : "To just lose";
            case "Draws":
                return bet.betCondition.nGoals > 1 ? "To draw by " + bet.betCondition.nGoals + "+ goals" : "To just draw";
        }
    }

    getLegsFromBet(bet) {
        var legs = new Array();
        for (var index in bet.betLegs) {
            var leg = {
                description: bet.betLegs[index].name,
                match: {
                    kickoff: bet.betLegs[index].kickoff,
                    league: bet.betLeague,
                },
                price: bet.betLegs[index].price
            }
            legs.push(leg);
        }
        return legs;
    }

    formatPrice(value) {
        let result = 0;
        if (value < 2) {
            // return value.toFixed(3);
            result = value.toFixed(2);
        } else if (value < 10) {
            result = value.toFixed(2);
        } else if (value < 100) {
            result = value.toFixed(1);
        } else {
            result = Math.floor(value);
        }
        return result;
    }

    formatCurrentPrice(price) {
        if (price == undefined) {
            return "[...]";
        } else {
            return this.formatPrice(price);
        }
    }

    getCurrentTimeFormatter(betDate) {
        var dt = new Date(betDate);
        var monthNames = [
            "January", "February", "March",
            "April", "May", "June", "July",
            "August", "September", "October",
            "November", "December"
        ];
        var month = monthNames[dt.getMonth()];
        var day = dt.getDate().toString();
        var hour = dt.getHours().toString();
        var minutes = dt.getMinutes() > 10 ? dt.getMinutes().toString() : "0" + dt.getMinutes().toString();
        var mid = dt.getHours() >= 12 ? "pm" : "am";
        return <span className="bet-saved-date">{hour + ":" + minutes + " " + mid + " " + day}<sup>Th</sup>{" " + month}</span>
    }

    getBetDetail(bet) {
        return (
            <div className="bet-confirm-container">
                <div className="form-group">
                    <h3 className="bet-placed-product">
                        {bet.betName + " - " + bet.betType}
                    </h3>
                </div>
                <div className="form-group">
                    <div className="bet-goal">
                        <span>{bet.betType + ": " + bet.betCondition.nLegs + "+ of " + bet.betCondition.legs}</span>
                        <span>{this.placedBetGoalFormatter(bet)}</span>
                    </div>
                </div>
                <div className="form-group">
                    <div className="bet-legs">
                        <AccaLegTable
                            clickHandler={null}
                            legs={this.getLegsFromBet(bet)}
                            accaProductPanelState={"result"}
                        />
                    </div>
                </div>
                <div className="form-group">
                    <h3 className="bet-placed-price">
                        €{bet.betStake} @ <span>{bet.betPrice}</span>
                    </h3>
                </div>
                <div className="form-group">
                    <div className="bet-placed-result">
                        <span>To win € {this.formatCurrentPrice(bet.betStake * (bet.betPrice - 1))}</span>
                        <span>Result = {bet.betResult}</span>
                    </div>
                </div>
                <div className="form-group">
                    <a className="site-url" href="http://www.URLtoinset.com">www.URLtoinset.com</a>
                    {this.getCurrentTimeFormatter(bet.betTime)}
                </div>
            </div>
        )
    }

    _toggleExpand() {
        this.setState({
            panelExpanded: !this.state.panelExpanded
        })
    }

    render() {
        const {bets, selectedTab} = this.props;
        return (
            <div id="my-bet-list">
                <div style={ selectedTab == 'settled' ? {display: "none"} : null}>
                    <Accordion>
                        {
                            bets.map((bet, key) => {
                                return (
                                    <Panel key={key + '_' + selectedTab}
                                           eventKey={key + '_' + selectedTab}
                                           header={this.getHeader(bet)}
                                           expanded={this.state.panelExpanded}
                                           onSelect={this._toggleExpand}>
                                        {this.getBetDetail(bet)}
                                    </Panel>
                                )
                            })
                        }
                    </Accordion>
                </div>
                <div style={ selectedTab == 'open' ? {display: "none"} : null}>
                    <Accordion>
                        {
                            bets.map((bet, key) => {
                                return (
                                    <Panel key={key}
                                           eventKey={key}
                                           header={this.getHeader(bet)}
                                           expanded={this.state.panelExpanded}
                                           onSelect={this._toggleExpand}>
                                        {this.getBetDetail(bet)}
                                    </Panel>
                                )
                            })
                        }
                    </Accordion>
                </div>
            </div>
        )
    }
}