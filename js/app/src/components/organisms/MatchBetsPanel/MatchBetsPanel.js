import React from 'react'
import MatchBetsTable from '../../organisms/MatchBetsTable'
import {bindAll, isEmpty} from 'lodash'
import {formatCurrentPrice, formatObjectYourBet} from '../../utils'
import CornersToogle from '../../molecules/CornersToggle'
import MyPaginator from '../../molecules/MyPaginator'
import * as constant from '../../constant'
import classNames from 'classnames'
import s from './index.css'

export default class MatchBetsPanel extends React.PureComponent {
    constructor(props) {
        super(props)
        bindAll(this, ['handlePaginatorClicked', 'handleStakeChanged',
            'decrementValue', 'incrementValue', 'updatePrice'])
        this.state = {
            currentPage: 0,
            openedStakePanel: false,
            stake: 0,
            stakeValidation: true,
            price: undefined,
            countBetsInStake: 1,
            textBetsInStake: '',
            showBets: [],
            btnDisabled: false
        }
    }

    componentWillMount() {
        this.changeState(this.props)
    }

    componentWillReceiveProps(nextProps) {
        this.changeState(nextProps)
    }

    changeState(props) {
        const {match, bets} = props
        let showBets = []
        let {textBetsInStake, countBetsInStake} = this.state
        bets.map(bet => {
            if (bet.match.fixture !== match.fixture) return
            showBets.push(bet)
        })
        showBets = formatObjectYourBet(showBets, match)
        if (showBets.length > 1) {
            countBetsInStake = Math.ceil((showBets.length / 2) + 1)
        }
        if (props.countBetsInStake > 0) {
            countBetsInStake = props.countBetsInStake
        }
        if (countBetsInStake > showBets.length) {
            countBetsInStake = showBets.length
        }
        textBetsInStake = this.formatToogleText(countBetsInStake, showBets)
        this.setState({showBets, textBetsInStake, countBetsInStake})
        this.updatePrice(props, showBets)
    }

    applyPaginatorWindow(items) {
        var rows = constant.COUNT_PLAYER_ROWS
        var i = this.state.currentPage * rows
        var j = (this.state.currentPage + 1) * rows
        return items.slice(i, j)
    }

    sortLegs(legs) {
        var sortFn = function (i0, i1) {
            if (i0.match.kickoff < i1.match.kickoff) {
                return -1
            } else if (i0.match.kickoff > i1.match.kickoff) {
                return 1
            } else {
                if (i0.description < i1.description) {
                    return -1
                } else if (i0.description > i1.description) {
                    return 1
                } else {
                    return 0
                }
            }
        }
        return legs.sort(sortFn)
    }

    handlePaginatorClicked(item) {
        const currentPage = item.value
        this.setState({currentPage})
    }

    handleStakeChanged(e) {
        if (!this.state.stakeValidation) {
            this.setState({stakeValidation: true})
        }
        if (e.target.value === "") {
            this.setState({stake: 0})
        } else {
            let value = parseFloat(e.target.value).toFixed(2)
            this.setState({stake: parseFloat(value)})
        }
    }

    updatePrice(props, showBets) {
        const {match, bets} = props
        this.setState({price: undefined})
        if (showBets.length > 1) {
            let matchid = match.match_id.toString()
            setTimeout(function () {
                    let struct = {
                        "selection":
                            {
                                "winners_criteria": 1,
                                "draw_ft": null,
                                "draw_bh": null,
                                "draw_eh": null,
                                "home_ft": null,
                                "home_bh": null,
                                "home_eh": null,
                                "away_ft": null,
                                "away_bh": null,
                                "away_eh": null,
                                "btts_ft": null,
                                "btts_bh": null,
                                "btts_eh": null,
                                "total_goals_bound": null,
                                "home_ags_p_ft": null,
                                "match_home_p_fgs_ft": null,
                                "home_fgs_p_ft": null,
                                "home_threegs_p_ft": null,
                                "away_ags_p_ft": null,
                                "match_away_fgs_p_ft": null,
                                "away_fgs_p_ft": null,
                                "away_threegs_p_ft": null,
                                "home_corners_ft": null,
                                "away_corners_ft": null,
                                "total_corners_ft": null,
                                "both_corners_ft": null,
                                "lower_goals_bound": null,
                                "upper_goals_bound": null,
                                "home_bp_ft": null,
                                "away_bp_ft": null,
                                "total_bp_ft": null,
                                "both_bp_ft": null,
                                "home_acard_p_ft": null,
                                "match_home_p_fcard_ft": null,
                                "home_fcard_p_ft": null,
                                "home_ared_p_ft": null,
                                "away_acard_p_ft": null,
                                "match_away_p_fcard_ft": null,
                                "away_fcard_p_ft": null,
                                "away_ared_p_ft": null
                            },
                        "iD": matchid
                    }
                    let selection, range, sliderValue, tableSelectedItem, selectedTab, toogleValue
                    bets.forEach(function (bet) {
                        switch (bet.name) {
                            case constant.MATCH_RESULT:
                                selection = bet.options.selection
                                range = bet.options.range
                                tableSelectedItem = bet.options.tableSelectedItem
                                struct['selection'][selection] = 1
                                if (tableSelectedItem[1] !== constant.SELCTED_TWO) {
                                    struct['selection']['lower_goals_bound'] = range[0]
                                    struct['selection']['upper_goals_bound'] = range[1]
                                }
                                break
                            case constant.GOALS:
                                selection = bet.options.selection
                                sliderValue = bet.options.sliderValue
                                if (bet.options.selectedItem[1] === constant.SELCTED_FIRST) {
                                    struct['selection'][selection] = 1
                                } else if (bet.options.selectedItem[1] === constant.SELCTED_TWO) {
                                    struct['selection'][selection] = -1
                                }
                                if (bet.options.selectedTab['name'] === "over") {
                                    struct['selection']['total_goals_bound'] = parseFloat(constant.marks[sliderValue])
                                } else if (bet.options.selectedTab['name'] === "under") {
                                    struct['selection']['total_goals_bound'] = -Math.abs(parseFloat(constant.marks[sliderValue]))
                                }
                                break
                            case constant.GOAL_SCORERS:
                                bet.options.selectedItem.forEach(function (item) {
                                    selection = item.selection
                                    if (struct['selection'][selection] === null) {
                                        struct['selection'][selection] = []
                                    }
                                    struct['selection'][selection].push(item.selectedId)
                                })
                                break
                            case constant.CORNERS:
                            case constant.TEAM_CARDS:
                                selection = bet.options.selection
                                selectedTab = bet.options.selectedTab
                                toogleValue = bet.options.toogleValue
                                if (selectedTab === "over") {
                                    struct['selection'][selection] = parseFloat(toogleValue)
                                } else if (selectedTab === "under") {
                                    struct['selection'][selection] = -Math.abs(parseFloat(toogleValue))
                                }
                                break
                            case constant.PLAYER_CARDS_:
                                bet.options.selectedItem.forEach(function (item) {
                                    selection = item.selection
                                    if (struct['selection'][selection] === null) {
                                        struct['selection'][selection] = []
                                    }
                                    struct['selection'][selection].push(item.selectedId)

                                })
                                break
                        }
                    })
                    console.log(struct)
                    this.props.exoticsApi.fetchPrice(struct, function (response) {
                        console.log(JSON.parse(response))
                        let res = JSON.parse(response)
                        const {countBetsInStake} = this.state
                        const price = res[countBetsInStake].price
                        this.setState({price})
                    }.bind(this))
                }.bind(this), 300
            )
        }
    }

    decrementValue() {
        let {countBetsInStake, showBets, textBetsInStake} = this.state
        if (parseInt(countBetsInStake) <= 1) return
        countBetsInStake -= 1
        textBetsInStake = this.formatToogleText(countBetsInStake, showBets)
        this.setState({countBetsInStake, textBetsInStake})
        this.updatePrice(this.props, showBets)
    }

    incrementValue() {
        let {countBetsInStake, showBets, textBetsInStake} = this.state
        if (parseInt(countBetsInStake) >= showBets.length) return
        countBetsInStake += 1
        textBetsInStake = this.formatToogleText(countBetsInStake, showBets)
        this.setState({countBetsInStake, textBetsInStake})
        this.updatePrice(this.props, showBets)
    }

    formatToogleText(countBetsInStake, showBets) {
        let textBetsInStake = ''
        if (countBetsInStake === showBets.length) textBetsInStake = countBetsInStake + ' (of ' + showBets.length + ')'
        else textBetsInStake = countBetsInStake + '+ (of ' + showBets.length + ')'
        return textBetsInStake
    }

    placeBet = () => {
        const {showBets, stake, price, countBetsInStake, textBetsInStake} = this.state
        const {match, bets} = this.props
        if (showBets.length > 1) {
            if (this.state.stake === 0) {
                this.setState({stakeValidation: false});
                return
            }
            let btnDisabled = true
            this.setState({btnDisabled})
            let struct = {
                "selection": {},
                "number_of_winners": countBetsInStake,
                "stake": parseFloat(stake),
                "price": price,
                "uid": sessionStorage.getItem('UID'),
                "id": match.match_id.toString(),
                "currency": "EUR"
            }
            let selection, range, sliderValue, tableSelectedItem, selectedTab, toogleValue
            bets.forEach(function (bet) {
                switch (bet.name) {
                    case constant.MATCH_RESULT:
                        selection = bet.options.selection
                        range = bet.options.range
                        tableSelectedItem = bet.options.tableSelectedItem
                        struct['selection'][selection] = 1
                        if (tableSelectedItem[1] !== constant.SELCTED_TWO) {
                            struct['selection']['lower_goals_bound'] = range[0]
                            struct['selection']['upper_goals_bound'] = range[1] < 5 ? range[1] : "unbounded"

                        }
                        break
                    case constant.GOALS:
                        selection = bet.options.selection
                        sliderValue = bet.options.sliderValue
                        if (bet.options.selectedItem[1] === constant.SELCTED_FIRST) {
                            struct['selection'][selection] = 1
                        } else if (bet.options.selectedItem[1] === constant.SELCTED_TWO) {
                            struct['selection'][selection] = -1
                        }
                        if (bet.options.selectedTab['name'] === "over") {
                            struct['selection']['total_goals_bound'] = parseFloat(constant.marks[sliderValue])
                        } else if (bet.options.selectedTab['name'] === "under") {
                            struct['selection']['total_goals_bound'] = -Math.abs(parseFloat(constant.marks[sliderValue]))
                        }
                        break
                    case constant.GOAL_SCORERS:
                        bet.options.selectedItem.forEach(function (item) {
                            selection = item.selection
                            if (!struct['selection'].hasOwnProperty(selection)) {
                                struct['selection'][selection] = []
                            }
                            struct['selection'][selection].push(item.selectedId)
                        })
                        break
                    case constant.CORNERS:
                    case constant.TEAM_CARDS:
                        selection = bet.options.selection
                        selectedTab = bet.options.selectedTab
                        toogleValue = bet.options.toogleValue
                        if (selectedTab === "over") {
                            struct['selection'][selection] = parseFloat(toogleValue)
                        } else if (selectedTab === "under") {
                            struct['selection'][selection] = -Math.abs(parseFloat(toogleValue))
                        }
                        break
                    case constant.PLAYER_CARDS_:
                        bet.options.selectedItem.forEach(function (item) {
                            selection = item.selection
                            if (!struct['selection'].hasOwnProperty(selection)) {
                                struct['selection'][selection] = []
                            }
                            struct['selection'][selection].push(item.selectedId)
                        })
                        break
                }
            })
            console.log("************************************** Place Selection *****************************************")
            console.log(struct)
            this.props.exoticsApi.placeBet(struct, function (response) {
                let res = JSON.parse(response)
                console.log("*************************** Place Response ********************************")
                console.log(res)
                let {price} = this.state
                btnDisabled = false
                this.setState({btnDisabled})
                if (res.placement_status === "accepted") {
                    this.props.openStakePanel(showBets, stake, price, textBetsInStake)
                } else if (res.placement_status === "offer") {
                    price = res.price
                    let errMsg = "This price is no longer offered. The correct price for these legs is : " + price + " and current price will be reset with it."
                    if (window.confirm(errMsg)) {
                        this.setState({price})
                    }
                }
            }.bind(this))
        }
    }

    render() {
        const {handleBetRemoved, match} = this.props
        const {price, showBets, textBetsInStake} = this.state
        if (showBets.length === 0) {
            return (
                <div>
                    <div className={classNames(s["description"])}>
                        <div className={classNames(s['title'])}>
                            How does this work?
                        </div>
                        <div className={classNames('text-muted', 'text-left')}>
                            <span className={s['white-text']}>1) </span>
                            Choose your
                            <span className={s['white-text']}> match </span>
                            from the
                            <span className={s['white-text']}> Build </span>
                            tab!
                        </div>
                        <div className={classNames('text-muted', 'text-left')}>
                            <span className={s['white-text']}>2) </span>
                            Add your
                            <span className={s['white-text']}>  selections </span>
                            for in-game events.
                        </div>
                        <div className={classNames('text-muted', 'text-left')}>
                            <span className={s['white-text']}>3) </span>
                            Make it exotic on the
                            <span className={s['white-text']}> Betslip! </span>
                        </div>
                        <button
                            className={classNames('btn', 'btn-primary', s['get-started-btn'])}
                            onClick={this.props.returnToBetsPanel}>
                            Get Started
                        </button>
                    </div>
                </div>
            )
        }
        return (
            <div>
                <div>
                    <div className="form-group">
                        <h3 className="current-price text-center">Current price:&nbsp;
                            <span
                                id="price">{showBets.length > 1 ? formatCurrentPrice(price) : "Add another leg"}</span>
                        </h3>
                    </div>
                    <MatchBetsTable
                        clickHandler={handleBetRemoved}
                        bets={this.applyPaginatorWindow(this.sortLegs(showBets))}
                        accaProductPanelState='custom'
                        match={match}
                    />
                    <hr className={classNames(s['table-border-bottom'])}/>
                    {
                        (showBets.length > constant.COUNT_PLAYER_ROWS) ?
                            <MyPaginator
                                product={{rows: constant.COUNT_PLAYER_ROWS}}
                                data={showBets}
                                clickHandler={this.handlePaginatorClicked}
                                currentPage={this.state.currentPage}
                            />
                            : null
                    }
                    <div className={s["corners-slider-container"]}>
                        <CornersToogle
                            value={textBetsInStake}
                            clickHandlers={{
                                increment: this.incrementValue,
                                decrement: this.decrementValue
                            }}/>
                    </div>
                    <div className="bet-submit-btns">
                        {/*<button
                            className="btn btn-primary bet-cancel-btn"
                            onClick={ this.props.clearBets}>Cancel
                        </button>*/}
                        {/*<div className={classNames(s["bet-submit-btns-child"], "stake-label")}>STAKE</div>*/}
                        <div className="stake">
                            <span className="stake-symbol">€</span>
                            <input name="stake-value"
                                   type="number"
                                   placeholder="Stake"
                                   className={this.state.stakeValidation ? "stake-value" : "stake-value validate"}
                                   defaultValue={this.state.stake > 0 ? this.state.stake : ""}
                                   onChange={(e) => {
                                       this.handleStakeChanged(e)
                                   }}
                                   onKeyPress={(e) => {
                                       if ((e.which !== 46 || e.target.value.indexOf('.') !== -1) && (e.which < 48 || e.which > 57)) {
                                           e.preventDefault()
                                       }
                                   }}
                            />
                        </div>
                        <div>
                            <button
                                disabled={this.state.btnDisabled}
                                style={{marginTop: '8px'}}
                                className={classNames(s["bet-submit-btns-child"], "btn btn-primary btn-place")}
                                onClick={this.placeBet}>
                                <span className="bold" style={{marginRight: "5px"}}>EUR {formatCurrentPrice(this.state.stake)}</span>
                                Place Bet
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}