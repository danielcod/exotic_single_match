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
        bindAll(this, ['getHeader', 'getBetDetail', 'getLegsFromBet', 'formatCurrentPrice',
            '_setSelectedItem', '_setExpandedState', '_setCollapsedState']);
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
                        switch (bet.type) {
                            case 'winners': {
                                return (
                                    [
                                        <span>{this.placedBetHeaderTextFormatter(bet)}</span>,
                                        <span className="label winners pull-right">To Win</span>
                                    ]
                                )
                            }
                            case 'losers': {
                                return (
                                    [
                                        <span>{this.placedBetHeaderTextFormatter(bet)}</span>,
                                        <span className="label losers pull-right">To Lose</span>
                                    ]
                                )
                            }
                            case 'draws': {
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

    getBetName(bet) {
        switch (bet.type) {
            case "winners": {
                return "EXOTIC WINNERS ACCA";
            }
            case "losers": {
                return "EXOTIC LOSERS ACCA";
            }
            case "draws": {
                return "EXOTIC DRAWS ACCA";
            }
        }
    }

    getHomeaway(bet, index) {
        var teamNames = bet.legs[index].match.split(" vs ");
        if (teamNames[0] === bet.legs[index].selection) {
            return "home";
        } else {
            return "away";
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

    getLegsFromBet(bet) {
        var legs = [];
        for (var index in bet.legs) {
            var leg = {
                description: bet.legs[index].match,
                match: {
                    kickoff: "",
                    league: bet.legs[index].league,
                    name: bet.legs[index].match
                },
                selection: {
                    homeAway: this.getHomeaway(bet, index)
                }
            };
            legs.push(leg);
        }
        return legs;
    }

    getBetDetail(bet) {
        return (
            <div className="bet-confirm-container">
                <div className="form-group">
                    <h3 className="bet-placed-product">
                        {this.getBetName(bet)}
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
                            price={false}
                        />
                    </div>
                </div>
                <div className="form-group">
                    <h3 className="bet-placed-price">
                        €{bet.size} @ <span>{bet.price}</span>
                    </h3>
                </div>
                <div className="form-group">
                    <div className="bet-placed-result">
                        <span>To Return € {this.formatCurrentPrice(bet.size * bet.price)}</span>
                        <span>Result = {bet.betResult}</span>
                    </div>
                </div>
                <div className="form-group">
                    <a className="site-url" href="http://www.DummyURL.com">www.DummyURL.com</a>
                    {this.getCurrentTimeFormatter(bet.timestamp)}
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

    placedBetHeaderTextFormatter(bet) {
        var formatString;
        if (bet.n_legs === bet.legs.length) {
            formatString = "All " + bet.n_legs + " to " + (bet.n_goals <= 1 ? "just " : "");
        } else {
            formatString = bet.n_legs + "+ of " + bet.legs.length + " to " + (bet.n_goals <= 1 ? "just " : "");
        }
        switch (bet.type) {
            case "winners": {
                formatString = formatString + "win" + (bet.n_goals > 1 ? " by " + bet.n_goals + "+ goals" : "");
                break;
            }
            case "losers": {
                formatString = formatString + "lose" + (bet.n_goals > 1 ? " by " + bet.n_goals + "+ goals" : "");
                break;
            }
            case "draws": {
                formatString = formatString + "draw" + (bet.n_goals > 0 ? " with " + bet.n_goals + "+ goals" : "");
                break;
            }
        }
        return formatString;
    }

    placedBetTextFormatter(bet) {
        var formatString;
        if (bet.n_legs === bet.legs.length) {
            formatString = "All " + bet.n_legs + " teams to " + (bet.n_goals <= 1 ? "just " : "");
        } else {
            formatString = "Any " + bet.n_legs + "+ of " + bet.legs.length + " teams to " + (bet.n_goals <= 1 ? "just " : "");
        }
        switch (bet.type) {
            case "winners": {
                formatString += "win";
                break;
            }
            case "losers": {
                formatString += "lose";
                break;
            }
            case "draws": {
                formatString += "draw";
                break;
            }
        }
        return formatString;
    }

    placedBetGoalFormatter(bet) {
        switch (bet.type) {
            case "winners":
                return bet.n_goals > 1 ? "By " + bet.n_goals + "+ goals" : "";
            case "losers":
                return bet.n_goals > 1 ? "By " + bet.n_goals + "+ goals" : "";
            case "draws":
                return bet.n_goals > 0 ? "With " + bet.n_goals + "+ goals per team" : "";
        }
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