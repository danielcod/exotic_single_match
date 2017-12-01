import React from 'react'
import {bindAll, isEmpty, isEqual} from 'lodash'
import Accordion from 'react-bootstrap/lib/Accordion'
import Panel from 'react-bootstrap/lib/Panel'
import StakeTable from '../../../organisms/StakeTable'
import MyPaginator from '../../../molecules/MyPaginator'
import AccaLegTable from '../../../organisms/AccaLegTable'
import {getLegsFromBet} from '../../../utils'
import {formatBTTSText, formatTotalGoalsText, formatPrice} from '../../../utils'
import * as products from '../../../products'
import * as UTILS from '../../../utils'
import * as DU from '../../../date_utils'
import * as constant from '../../../constant'
import classnames from 'classnames'


export default class MyBetList extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            panelExpanded: false,
            activeFaqKey: "",
            activeOpenKey: "",
            activeSettledKey: "",
            currentPage: 0
        }
        bindAll(this, ['getHeader', 'getBetDetail', 'formatDynamicTextForMatchResult', 'formatGoalTextForMatchResult',
            'formatTextForGoalscorners', 'formatTextForPlaycards', 'formatTextForCorners', 'formatTextForTeamcard',
            '_setSelectedItem', '_setExpandedState', '_setCollapsedState'])
    }

    getHeader(bet, expanded) {
        return (
            <div>
                <table className="table table-condensed table-striped"
                       style={{marginTop: '0px', marginBottom: "0px"}}>
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
                        <td className="bet-fixture">
                             <span>{bet.fixture}</span>
                        </td>
                        <td className="bet-status">
                             <span className={bet.bet_won ? "glyphicon glyphicon-ok" : "glyphicon glyphicon-remove"}></span>
                        </td>
                        <td className="bet-legs">
                            <span className={"leg leg-" + bet.total_legs + " label bold"}>
                                    {"Any " + bet.winners_required + "+ of " + bet.total_legs}
                            </span>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        )
    }

    getFaqHeader(faq, expanded) {
        return (
            <div>
                <table className="table table-condensed table-striped">
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

    getCurrentTimeFormatter(betDate) {
        let dt = new Date(betDate)
        let monthNames = [
            "January", "February", "March",
            "April", "May", "June", "July",
            "August", "September", "October",
            "November", "December"
        ]
        let month = monthNames[dt.getMonth()]
        let day = dt.getDate().toString()
        let hour = dt.getHours().toString()
        let minutes = dt.getMinutes() > 10 ? dt.getMinutes().toString() : "0" + dt.getMinutes().toString()
        let mid = dt.getHours() >= 12 ? "pm" : "am"
        return <span
            className="bet-saved-date">{hour + ":" + minutes + " " + mid + " " + day}<sup>{DU.DateUtils.formatDaySuffix(dt)}</sup>{" " + month}</span>
    }

    formatDynamicTextForMatchResult(selectedItem, value, fixture) {
        const comands = fixture.split(' vs ')
        let firstTeam, secondTeam
        [firstTeam, secondTeam] = fixture.split(' vs ')
        const [resultTimeId, winnComandId] = selectedItem
        let textValue = '', comand = '', selectedTime = '', scores = ''
        const [minCountGoals, maxCountGoals] = value
        switch (winnComandId) {
            case constant.SELCTED_FIRST:
                comand = firstTeam + ' ' + constant.TO_WINN
                break
            case constant.SELCTED_THREE:
                comand = secondTeam + ' ' + constant.TO_WINN
                break
            case constant.SELCTED_TWO:
                comand = constant.MATCH_IS_DRAW
                break
        }
        switch (resultTimeId) {
            case constant.SELCTED_FIRST:
                selectedTime = '' //' (' + constant.FULL_MATCH + ')'
                break
            case constant.SELCTED_TWO:
                selectedTime = ' (' + constant.BOTH_HALVES + ')'
                break
            case constant.SELCTED_THREE:
                selectedTime = ' (' + constant.EITHER_HALF + ')'
                break
        }
        const goalText = this.formatGoalTextForMatchResult(winnComandId, value)
        if (minCountGoals === maxCountGoals) {
            if (maxCountGoals !== 5) {
                scores = winnComandId != constant.SELCTED_TWO ? '​ by​ exactly ' + maxCountGoals + goalText : ''
            } else {
                scores = winnComandId != constant.SELCTED_TWO ? '​ by ' + maxCountGoals + goalText : ''
            }
        }
        else {
            const countGoals = maxCountGoals != constant.SELCTED_SIX ? minCountGoals + ' - ' + maxCountGoals : minCountGoals + '+ '
            scores = winnComandId != constant.SELCTED_TWO ? 'by ' + countGoals + goalText : ''
        }
        if (minCountGoals === constant.SELCTED_TWO && maxCountGoals === constant.SELCTED_SIX) scores = ''
        textValue = comand + ' ' + ' ' + scores + selectedTime
        return textValue
    }

    formatGoalTextForMatchResult(winnComandId, value) {
        const [minCountGoals, maxCountGoals] = value
        if (minCountGoals !== maxCountGoals) {
            return ' goals'
        }
        if (minCountGoals === 1) {
            return ' goal'
        } else if (minCountGoals === 5) {
            return '+ goals'
        }
        return ''
    }

    formatTextForGoalscorners(selectedItem, matchName, selectedTeam) {
        const [homeTeam, awayTeam] = matchName.split(' vs ')
        const comandName = selectedTeam === constant.HOME ? homeTeam : awayTeam
        switch (selectedItem) {
            case constant.SELCTED_TWO:
                return constant.ANYTIME_GOAL
            case constant.SELCTED_THREE:
                return constant.FIRST_MATCH + ' ' + constant.GOAL
            case constant.SELCTED_FOUR:
                return constant.FIRST + ' ' + comandName + ' ' + constant.GOAL
            case constant.SELCTED_FIVE:
                return constant.THREE_PLUS_GOALS
        }
    }

    formatTextForPlaycards(selectedItem, matchName, selectedTeam) {
        const [homeTeam, awayTeam] = matchName.split(' vs ')
        const comandName = selectedTeam === constant.HOME ? homeTeam : awayTeam
        switch (selectedItem) {
            case constant.SELCTED_TWO:
                return constant.ANY_CARD
            case constant.SELCTED_THREE:
                return constant.FIRST_MATCH + ' ' + constant.CARD
            case constant.SELCTED_FOUR:
                return constant.FIRST + ' ' + comandName + ' ' + constant.CARD
            case constant.SELCTED_FIVE:
                return constant.SENT_OFF
        }
    }

    formatTextForCorners(selectedBetTab, toogleValue, selectedTab, fixture) {
        let textValue = ''
        if (selectedBetTab === constant.SELCTED_FIRST || selectedBetTab === constant.SELCTED_TWO) {
            const comands = fixture.split(' vs ')
            textValue = comands[selectedBetTab] + ' ' + selectedTab + ' ' + toogleValue + ' corners'
        } else {
            textValue = products.cornersComponents[selectedBetTab] + ' ' + selectedTab + ' ' + toogleValue + ' corners'
        }
        return textValue
    }

    formatTextForTeamcard(selectedBetTab, toogleValue, selectedTab, fixture) {
        let textValue = ''
        if (selectedBetTab === constant.SELCTED_FIRST || selectedBetTab === constant.SELCTED_TWO) {
            const comands = fixture.split(' vs ')
            textValue = comands[selectedBetTab] + ' ' + selectedTab + ' ' + toogleValue + ' booking points'
        } else if (selectedBetTab === constant.SELCTED_FOUR) {
            textValue = constant.MATCH_TOTAL + ' ' + selectedTab + ' ' + toogleValue + ' booking points'
        } else {
            textValue = products.cornersComponents[selectedBetTab] + ' ' + selectedTab + ' ' + toogleValue + ' booking points'
        }
        return textValue
    }

    getBetDetail(bet) {
        const betSelection = bet.bet_selections
        const winningLegs = bet.winning_legs
        const losingLegs = bet.losing_legs
        let showBets = []
        //console.log("************************************ Selection ************************************")
        /******************************************
         *             MATCH RESULT               *
         ******************************************/
        const matchSelection = [
            {selection: "home_ft", id: constant.SELCTED_FIRST, key: constant.SELCTED_FIRST, price: 0},
            {selection: "draw_ft", id: constant.SELCTED_FIRST, key: constant.SELCTED_TWO, price: 0},
            {selection: "away_ft", id: constant.SELCTED_FIRST, key: constant.SELCTED_THREE, price: 0},
            {selection: "home_bh", id: constant.SELCTED_TWO, key: constant.SELCTED_FIRST, price: 0},
            {selection: "draw_bh", id: constant.SELCTED_TWO, key: constant.SELCTED_TWO, price: 0},
            {selection: "away_bh", id: constant.SELCTED_TWO, key: constant.SELCTED_THREE, price: 0},
            {selection: "home_eh", id: constant.SELCTED_THREE, key: constant.SELCTED_FIRST, price: 0},
            {selection: "draw_eh", id: constant.SELCTED_THREE, key: constant.SELCTED_TWO, price: 0},
            {selection: "away_eh", id: constant.SELCTED_THREE, key: constant.SELCTED_THREE, price: 0},
        ]
        let matchResult = matchSelection.filter(function (item) {
            return betSelection.hasOwnProperty(item.selection) && betSelection[item.selection] === 1
        })[0]
        if (!isEmpty(matchResult)) {
            //console.log("********** MATCH RESULT **********")
            matchResult.price = bet.leg_prices[matchResult.selection]
            let value
            if (betSelection.hasOwnProperty("lower_goals_bound") && betSelection.hasOwnProperty("upper_goals_bound")) {
                value = [parseInt(betSelection["lower_goals_bound"]), parseInt(betSelection["upper_goals_bound"])]
            } else {
                value = [0, 0]
            }
            let selectedItem = [matchResult.id, matchResult.key]
            let win
            if (winningLegs.indexOf(matchResult.selection) !== -1) {
                win = true
            } else if (losingLegs.indexOf(matchResult.selection) !== -1) {
                win = false
            }
            showBets.push({
                name: constant.MATCH_RESULT,
                description: this.formatDynamicTextForMatchResult(selectedItem, value, bet.fixture),
                price: formatPrice(matchResult.price),
                win: win
            })
            //console.log(matchResult)
        }
        /******************************************
         *                GOALS                   *
         ******************************************/
        const bttsSelection = [
            {
                selection: "btts_ft",
                id: constant.SELCTED_FIRST,
                key: constant.SELCTED_FIRST,
                price: 0,
                value: 1
            },
            {
                selection: "btts_ft",
                id: constant.SELCTED_FIRST,
                key: constant.SELCTED_TWO,
                price: 0,
                value: -1
            },
            {
                selection: "btts_bh",
                id: constant.SELCTED_TWO,
                key: constant.SELCTED_FIRST,
                price: 0,
                value: 1
            },
            {
                selection: "btts_bh",
                id: constant.SELCTED_TWO,
                key: constant.SELCTED_TWO,
                price: 0,
                value: -1
            },
            {
                selection: "btts_eh",
                id: constant.SELCTED_THREE,
                key: constant.SELCTED_FIRST,
                price: 0,
                value: 1
            },
            {
                selection: "btts_eh",
                id: constant.SELCTED_THREE,
                key: constant.SELCTED_TWO,
                price: 0,
                value: -1
            },
        ]
        const bttsResult = bttsSelection.filter(function (item) {
            return betSelection.hasOwnProperty(item.selection) && betSelection[item.selection] === item.value
        })[0]
        if (!isEmpty(bttsResult)) {
            //console.log("********** GOALS **********")
            if (bttsResult.value === 1) {
                bttsResult.price = bet.leg_prices[bttsResult.selection]['Yes']
            } else if (bttsResult.value === -1) {
                bttsResult.price = bet.leg_prices[bttsResult.selection]['No']
            }
            let win
            if (winningLegs.indexOf(bttsResult.selection) !== -1) {
                win = true
            } else if (losingLegs.indexOf(bttsResult.selection) !== -1) {
                win = false
            }
            showBets.push({
                name: constant.GOALS,
                description: formatBTTSText(bttsResult.id, bttsResult.key),
                price: formatPrice(bttsResult.price),
                win: win
            })
            //console.log(bttsResult)
        }
        if (betSelection.hasOwnProperty("total_goals_bound")) {
            let sliderValue, selectedTab, totalPrice
            //console.log("*** GOALS - total_goals_bound ***")
            if (betSelection['total_goals_bound'] > 0) {
                selectedTab = "OVER"
                sliderValue = Math.ceil(Math.abs(betSelection['total_goals_bound']))
                totalPrice = bet.leg_prices['total_goals_bound']['over'][Math.abs(betSelection['total_goals_bound'])]
            } else {
                selectedTab = "UNDER"
                sliderValue = Math.ceil(Math.abs(betSelection['total_goals_bound']))
                totalPrice = bet.leg_prices['total_goals_bound']['under'][Math.abs(betSelection['total_goals_bound'])]
            }
            let win
            if (winningLegs.indexOf("total_goals_bound") !== -1) {
                win = true
            } else if (losingLegs.indexOf("total_goals_bound") !== -1) {
                win = false
            }
            showBets.push({
                name: constant.GOALS,
                description: formatTotalGoalsText(sliderValue, selectedTab),
                price: formatPrice(totalPrice),
                win: win
            })
        }
        /******************************************
         *             GOALSCORERS                *
         ******************************************/
        const goalAwaySelection = [
            {key: constant.SELCTED_TWO, selection: "away_ags_p_ft"},
            {key: constant.SELCTED_THREE, selection: "match_away_fgs_p_ft"},
            {key: constant.SELCTED_FOUR, selection: "away_fgs_p_ft"},
            {key: constant.SELCTED_FIVE, selection: "away_threegs_p_ft"}
        ]
        let goalAwayResult = goalAwaySelection.filter(function (item) {
            return betSelection.hasOwnProperty(item.selection)
        })
        if (!isEmpty(goalAwayResult)) {
            //console.log("********** GOALSCORERS - Away **********")
            let correctGoalAwayResult = []
            goalAwayResult.forEach(function (item) {
                betSelection[item.selection].forEach(function (player) {
                    correctGoalAwayResult.push(
                        {
                            playerId: player,
                            name: bet.leg_prices[item.selection][player]['name'],
                            team: bet.leg_prices[item.selection][player]['team'],
                            selectedTeam: "away",
                            key: item.key,
                            price: bet.leg_prices[item.selection][player]['price'],
                            selection: item.selection
                        }
                    )
                })
            })
            correctGoalAwayResult.forEach(function (item) {
                let win
                if (winningLegs.indexOf(item.selection + ": " + item.playerId) !== -1) {
                    win = true
                } else if (losingLegs.indexOf(item.selection + ": " + item.playerId) !== -1) {
                    win = false
                }
                showBets.push({
                    name: constant.GOAL_SCORERS,
                    description: item.name + ' - ' + this.formatTextForGoalscorners(item.key, bet.fixture, item.selectedTeam),
                    price: formatPrice(item.price),
                    win: win
                })
            }.bind(this))
            //console.log(correctGoalAwayResult)
        }
        const goalHomeSelection = [
            {key: constant.SELCTED_TWO, selection: "home_ags_p_ft"},
            {key: constant.SELCTED_THREE, selection: "match_home_p_fgs_ft"},
            {key: constant.SELCTED_FOUR, selection: "home_fgs_p_ft"},
            {key: constant.SELCTED_FIVE, selection: "home_threegs_p_ft"}
        ]
        let goalHomeResult = goalHomeSelection.filter(function (item) {
            return betSelection.hasOwnProperty(item.selection)
        })
        if (!isEmpty(goalHomeResult)) {
            //console.log("********** GOALSCORERS - Home **********")
            let correctGoalHomeResult = []
            goalHomeResult.forEach(function (item) {
                betSelection[item.selection].forEach(function (player) {
                    correctGoalHomeResult.push(
                        {
                            playerId: player,
                            name: bet.leg_prices[item.selection][player]['name'],
                            team: bet.leg_prices[item.selection][player]['team'],
                            selectedTeam: "home",
                            key: item.key,
                            price: bet.leg_prices[item.selection][player]['price'],
                            selection: item.selection
                        }
                    )
                })
            })
            correctGoalHomeResult.forEach(function (item) {
                let win
                if (winningLegs.indexOf(item.selection + ": " + item.playerId) !== -1) {
                    win = true
                } else if (losingLegs.indexOf(item.selection + ": " + item.playerId) !== -1) {
                    win = false
                }
                showBets.push({
                    name: constant.GOAL_SCORERS,
                    description: item.name + ' - ' + this.formatTextForGoalscorners(item.key, bet.fixture, item.selectedTeam),
                    price: formatPrice(item.price),
                    win: win
                })
            }.bind(this))
            //console.log(correctGoalHomeResult)
        }
        /******************************************
         *               PLAYCARD                 *
         ******************************************/
        const playAwaySelection = [
            {key: constant.SELCTED_TWO, selection: "away_acard_p_ft"},
            {key: constant.SELCTED_THREE, selection: "match_away_p_fcard_ft"},
            {key: constant.SELCTED_FOUR, selection: "away_fcard_p_ft"},
            {key: constant.SELCTED_FIVE, selection: "away_ared_p_ft"}
        ]
        let playAwayResult = playAwaySelection.filter(function (item) {
            return betSelection.hasOwnProperty(item.selection)
        })
        if (!isEmpty(playAwayResult)) {
            //console.log("********** PLAYCARD - Away **********")
            let correctPlayAwayResult = []
            playAwayResult.forEach(function (item) {
                betSelection[item.selection].forEach(function (player) {
                    correctPlayAwayResult.push(
                        {
                            playerId: player,
                            name: bet.leg_prices[item.selection][player]['name'],
                            team: bet.leg_prices[item.selection][player]['team'],
                            selectedTeam: "away",
                            key: item.key,
                            price: bet.leg_prices[item.selection][player]['price'],
                            selection: item.selection
                        }
                    )
                })
            })
            correctPlayAwayResult.forEach(function (item) {
                let win
                if (winningLegs.indexOf(item.selection + ": " + item.playerId) !== -1) {
                    win = true
                } else if (losingLegs.indexOf(item.selection + ": " + item.playerId) !== -1) {
                    win = false
                }
                showBets.push({
                    name: constant.GOAL_SCORERS,
                    description: item.name + ' - ' + this.formatTextForPlaycards(item.key, bet.fixture, item.selectedTeam),
                    price: formatPrice(item.price),
                    win: win
                })
            }.bind(this))
            //console.log(correctPlayAwayResult)
        }
        const playHomeSelection = [
            {key: constant.SELCTED_TWO, selection: "home_acard_p_ft"},
            {key: constant.SELCTED_THREE, selection: "match_home_p_fcard_ft"},
            {key: constant.SELCTED_FOUR, selection: "home_fcard_p_ft"},
            {key: constant.SELCTED_FIVE, selection: "home_ared_p_ft"}
        ]
        let playHomeResult = playHomeSelection.filter(function (item) {
            return betSelection.hasOwnProperty(item.selection)
        })
        if (!isEmpty(playHomeResult)) {
            //console.log("********** PLAYCARD - Home **********")
            let correctPlayHomeResult = []
            playHomeResult.forEach(function (item) {
                betSelection[item.selection].forEach(function (player) {
                    correctPlayHomeResult.push(
                        {
                            playerId: player,
                            name: bet.leg_prices[item.selection][player]['name'],
                            team: bet.leg_prices[item.selection][player]['team'],
                            selectedTeam: "home",
                            key: item.key,
                            price: bet.leg_prices[item.selection][player]['price'],
                            selection: item.selection
                        }
                    )
                })
            })
            correctPlayHomeResult.forEach(function (item) {
                let win
                if (winningLegs.indexOf(item.selection + ": " + item.playerId) !== -1) {
                    win = true
                } else if (losingLegs.indexOf(item.selection + ": " + item.playerId) !== -1) {
                    win = false
                }
                showBets.push({
                    name: constant.GOAL_SCORERS,
                    description: item.name + ' - ' + this.formatTextForPlaycards(item.key, bet.fixture, item.selectedTeam),
                    price: formatPrice(item.price),
                    win: win
                })
            }.bind(this))
            //console.log(correctPlayHomeResult)
        }
        /******************************************
         *                CORNERS                 *
         ******************************************/
        const cornersSelection = [
            {
                id: constant.SELCTED_FIRST,
                toogleValue: 0,
                price: 0,
                selection: 'home_corners_ft'
            },
            {
                id: constant.SELCTED_TWO,
                toogleValue: 0,
                price: 0,
                selection: 'away_corners_ft'
            },
            {
                id: constant.SELCTED_THREE,
                toogleValue: 0,
                price: 0,
                selection: 'both_corners_ft'
            },
            {
                id: constant.SELCTED_FOUR,
                toogleValue: 0,
                price: 0,
                selection: 'total_corners_ft'
            }
        ]
        const cornersResult = cornersSelection.filter(function (item) {
            return betSelection.hasOwnProperty(item.selection)
        })[0]
        if (!isEmpty(cornersResult)) {
            let toogleVaule, selectedTab
            //console.log("******** CORNERS *********")
            toogleVaule = betSelection[cornersResult.selection]
            if (toogleVaule > 0) {
                selectedTab = "over"
            } else {
                selectedTab = "under"
            }
            cornersResult.toogleValue = Math.abs(toogleVaule)
            cornersResult.price = bet.leg_prices[cornersResult.selection][selectedTab][cornersResult.toogleValue]
            let win
            if (winningLegs.indexOf(cornersResult.selection) !== -1) {
                win = true
            } else if (losingLegs.indexOf(cornersResult.selection) !== -1) {
                win = false
            }
            showBets.push({
                name: constant.CORNERS,
                description: this.formatTextForCorners(cornersResult.id, cornersResult.toogleValue, selectedTab, bet.fixture),
                price: formatPrice(cornersResult.price),
                win: win
            })
            //console.log(cornersResult)
        }
        /******************************************
         *            TEAMS CARDS                 *
         ******************************************/
        const teamcardSelection = [
            {
                id: constant.SELCTED_FIRST,
                toogleValue: 0,
                price: 0,
                selection: 'home_bp_ft'
            },
            {
                id: constant.SELCTED_TWO,
                toogleValue: 0,
                price: 0,
                selection: 'away_bp_ft'
            },
            {
                id: constant.SELCTED_THREE,
                toogleValue: 0,
                price: 0,
                selection: 'both_bp_ft'
            },
            {
                id: constant.SELCTED_FOUR,
                toogleValue: 0,
                price: 0,
                selection: 'total_bp_ft'
            }
        ]
        const teamcardResult = teamcardSelection.filter(function (item) {
            return betSelection.hasOwnProperty(item.selection)
        })[0]
        if (!isEmpty(teamcardResult)) {
            let toogleVaule, selectedTab
            //console.log("********  TEAMS CARDS *********")
            toogleVaule = betSelection[teamcardResult.selection]
            if (toogleVaule > 0) {
                selectedTab = "over"
            } else {
                selectedTab = "under"
            }
            teamcardResult.toogleValue = Math.abs(toogleVaule)
            teamcardResult.price = bet.leg_prices[teamcardResult.selection][selectedTab][teamcardResult.toogleValue]
            let win
            if (winningLegs.indexOf(teamcardResult.selection) !== -1) {
                win = true
            } else if (losingLegs.indexOf(teamcardResult.selection) !== -1) {
                win = false
            }
            showBets.push({
                name: constant.TEAM_CARDS,
                description: this.formatTextForTeamcard(teamcardResult.id, teamcardResult.toogleValue, selectedTab, bet.fixture),
                price: formatPrice(teamcardResult.price),
                win: win
            })
            //console.log(teamcardResult)
        }
        //console.log("------- SHOWBETS ---------")
        //console.log(showBets)

        return (
            <div className="bet-confirm-container">
                <div className="form-group">
                    <h3 className="bet-placed-product">
                        EXOTIC ACCUMULATOR
                    </h3>
                </div>
                <div className="form-group">
                    <div className="bet-legs">
                        <StakeTable
                            bets={showBets}
                            status={bet.bet_settled}
                        />
                    </div>
                </div>
                <div className="form-group">
                    <h3 className="bet-placed-price">
                        €{bet.stake} @ <span>{formatPrice(bet.price)}</span>
                    </h3>
                </div>
                <div className="form-group">
                    <div className="bet-placed-result">
                        <span>To Return € {formatPrice(bet.stake * bet.price)}</span>
                        <span>Result = {bet.bet_won ? "Bet won" : "Bet lost"}</span>
                    </div>
                </div>
                <div className="form-group">
                    <a className="site-url" href="http://www.DummyURL.com">www.DummyURL.com</a>
                    {this.getCurrentTimeFormatter(bet.kickoff)}
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
        const {selectedTab, clickedFaq} = this.props
        if (clickedFaq) {
            this.setState({activeFaqKey: activeKey})
        } else {
            switch (selectedTab) {
                case "open":
                    this.setState({activeOpenKey: activeKey})
                    break;
                case "settled":
                    this.setState({activeSettledKey: activeKey})
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
        const {bets, selectedTab, faqs, clickedFaq} = this.props
        return (
            <div id="my-bet-list">
                <div id="my-bet-table">
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
                    <div style={(selectedTab === 'settled' && !clickedFaq) ? {display: "block"} : {display: "none"}}>
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
            </div>
        )
    }
}