import React from 'react';
import {bindAll} from 'lodash';
import Accordion from 'react-bootstrap/lib/Accordion';
import Panel from 'react-bootstrap/lib/Panel';
import AccaLegTable from '../../../organisms/AccaLegTable';
import * as DU from '../../../date_utils';

export default class MyBetList extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            panelExpanded: false,
            activeFaqKey: "",
            activeOpenKey: "",
            activeSettledKey: ""
        };
        bindAll(this, ['getHeader', 'getBetDetail', 'placedBetHeaderTextFormatter', 'placedBetTextFormatter',
            'placedBetGoalFormatter', 'getLegsFromBet', 'formatCurrentPrice', '_setSelectedItem',
            '_setExpandedState', '_setCollapsedState', 'getFaqHeader', 'getFaqDetail']);
    }

    getHeader(bet, expanded) {
        return (
            <div>
                {
                    expanded === true ?
                        <span className="glyphicon glyphicon-triangle-top glyph-background">
                            <span className="inner"></span>
                        </span>
                        :
                        <span className="glyphicon glyphicon-triangle-bottom glyph-background">
                            <span className="inner"></span>
                        </span>
                }
                {
                    (() => {
                        switch (bet.betType) {
                            case 'Winners': {
                                return (
                                    [
                                        <span>{this.placedBetHeaderTextFormatter(bet)}</span>,
                                        <span className="label winners pull-right">To Win</span>
                                    ]
                                )
                            }
                            case 'Losers': {
                                return (
                                    [
                                        <span>{this.placedBetHeaderTextFormatter(bet)}</span>,
                                        <span className="label losers pull-right">To Lose</span>
                                    ]
                                )
                            }
                            case 'Draws': {
                                return (
                                    [
                                        <span>{this.placedBetHeaderTextFormatter(bet)}</span>,
                                        <span className="label draws pull-right">To Draw</span>
                                    ]
                                )
                            }
                        }
                    })()
                }
            </div>
        )
    }

    getFaqHeader(faq, expanded) {
        return (
            <div>
                <table>
                    <tbody>
                    <tr>
                        <td>
                            {
                                expanded === true ?
                                    <span className="glyphicon glyphicon-triangle-top glyph-background">
                                        <span className="inner"></span>
                                    </span>
                                    :
                                    <span className="glyphicon glyphicon-triangle-bottom glyph-background">
                                        <span className="inner"></span>
                                    </span>

                            }
                        </td>
                        <td>
                            <span>{faq.title}</span>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        )
    }

    placedBetHeaderTextFormatter(bet) {
        var formatString;
        if (bet.betCondition.nLegs === bet.betCondition.legs) {
            formatString = "All " + bet.betCondition.nLegs + " to " + (bet.betCondition.nGoals <= 1 ? "just " : "");
        } else {
            formatString = bet.betCondition.nLegs + "+ of " + bet.betCondition.legs + " to " + (bet.betCondition.nGoals <= 1 ? "just " : "");
        }
        switch (bet.betType) {
            case "Winners": {
                formatString = formatString + "win" + (bet.betCondition.nGoals > 1 ? " by " + bet.betCondition.nGoals + "+ goals" : "");
                break;
            }
            case "Losers": {
                formatString = formatString + "lose" + (bet.betCondition.nGoals > 1 ? " by " + bet.betCondition.nGoals + "+ goals" : "");
                break;
            }
            case "Draws": {
                formatString = formatString + "draw" + (bet.betCondition.nGoals > 0 ? " with " + bet.betCondition.nGoals + "+ goals" : "");
                break;
            }
        }
        return formatString;
    }

    placedBetTextFormatter(bet) {
        var formatString;
        if (bet.betCondition.nLegs === bet.betCondition.legs) {
            formatString = "All " + bet.betCondition.nLegs + " teams to " + (bet.betCondition.nGoals <= 1 ? "just " : "");
        } else {
            formatString = "Any " + bet.betCondition.nLegs + "+ of " + bet.betCondition.legs + " teams to " + (bet.betCondition.nGoals <= 1 ? "just " : "");
        }
        switch (bet.betType) {
            case "Winners": {
                formatString += "win";
                break;
            }
            case "Losers": {
                formatString += "lose";
                break;
            }
            case "Draws": {
                formatString += "draw";
                break;
            }
        }
        return formatString;
    }

    placedBetGoalFormatter(bet) {
        switch (bet.betType) {
            case "Winners":
                return bet.betCondition.nGoals > 1 ? "By " + bet.betCondition.nGoals + "+ goals" : "";
            case "Losers":
                return bet.betCondition.nGoals > 1 ? "By " + bet.betCondition.nGoals + "+ goals" : "";
            case "Draws":
                return bet.betCondition.nGoals > 0 ? "With " + bet.betCondition.nGoals + "+ goals per team" : "";
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
                    name: bet.betLegs[index].name
                },
                selection: bet.betLegs[index].selection,
                price: bet.betLegs[index].price
            };
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
        return <span
            className="bet-saved-date">{hour + ":" + minutes + " " + mid + " " + day}<sup>{DU.DateUtils.formatDaySuffix(dt)}</sup>{" " + month}</span>
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
                        <span>{this.placedBetTextFormatter(bet)}</span>
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
                        <span>To win € {this.formatCurrentPrice(bet.betStake * bet.betPrice)}</span>
                        <span>Result = {bet.betResult}</span>
                    </div>
                </div>
                <div className="form-group">
                    <a className="site-url" href="http://www.DummyURL.com">www.DummyURL.com</a>
                    {this.getCurrentTimeFormatter(bet.betTime)}
                </div>
            </div>
        )
    }

    getFaqDetail(faq) {
        return (
            <div className="faq-container">
                <div className="form-group">
                    {faq.content}
                </div>
            </div>
        )
    }

    _setSelectedItem(activeKey) {
        const {selectedTab, clickedFaq} = this.props;
        if (clickedFaq) {
            this.setState({activeFaqKey: activeKey});
        } else {
            switch (selectedTab) {
                case "open":
                    this.setState({activeOpenKey: activeKey});
                    break;
                case "settled":
                    this.setState({activeSettledKey: activeKey});
                    break;
            }
        }
    }

    _setExpandedState() {
        this.setState({
            panelExpanded: true
        })
    }

    _setCollapsedState() {
        this.setState({
            panelExpanded: false
        })
    }

    render() {
        const {bets, selectedTab, faqs, clickedFaq} = this.props;
        return (
            <div id="my-bet-list">
                <div style={(selectedTab === 'open' && !clickedFaq) ? {display: "block"} : {display: "none"}}>
                    <Accordion>
                        {
                            bets.map((bet, key) => {
                                return (
                                    <Panel
                                        key={key + '_' + selectedTab}
                                        eventKey={key + '_' + selectedTab}
                                        header={(key + '_' + selectedTab) === this.state.activeOpenKey && this.state.panelExpanded === true ? this.getHeader(bet, true) : this.getHeader(bet, false)}
                                        onSelect={this._setSelectedItem}
                                        onEntering={this._setExpandedState}
                                        onExit={this._setCollapsedState}>
                                        {this.getBetDetail(bet)}
                                    </Panel>
                                )
                            })
                        }
                    </Accordion>
                </div>
                <div style={(selectedTab == 'settled' && !clickedFaq) ? {display: "block"} : {display: "none"}}>
                    <Accordion>
                        {
                            bets.map((bet, key) => {
                                return (
                                    <Panel
                                        key={key + '_' + selectedTab}
                                        eventKey={key + '_' + selectedTab}
                                        header={(key + '_' + selectedTab) === this.state.activeSettledKey && this.state.panelExpanded === true ? this.getHeader(bet, true) : this.getHeader(bet, false)}
                                        onSelect={this._setSelectedItem}
                                        onEntering={this._setExpandedState}
                                        onExit={this._setCollapsedState}>
                                        {this.getBetDetail(bet)}
                                    </Panel>
                                )
                            })
                        }
                    </Accordion>
                </div>
                <div style={clickedFaq ? {display: "block"} : {display: "none"}}>
                    <Accordion>
                        {
                            faqs.map((faq, key) => {
                                return (
                                    <Panel
                                        key={key + '_faq'}
                                        eventKey={key + '_faq'}
                                        header={(key + '_faq') === this.state.activeFaqKey && this.state.panelExpanded === true ? this.getFaqHeader(faq, true) : this.getFaqHeader(faq, false)}
                                        onSelect={this._setSelectedItem}
                                        onEntering={this._setExpandedState}
                                        onExit={this._setCollapsedState}>
                                        {this.getFaqDetail(faq)}
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