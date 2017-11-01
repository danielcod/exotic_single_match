import React from 'react';
import MatchBetsTable from '../../organisms/MatchBetsTable';
import {bindAll} from 'lodash';
import {formatCurrentPrice, formatObjectYourBet} from '../../utils';
import CornersToogle from '../../molecules/CornersToggle';
import MyPaginator from '../../molecules/MyPaginator';
import * as constant from '../../constant';
import * as products from '../../products';
import classNames from 'classnames';
import s from './index.css';

export default class MatchBetsPanel extends React.PureComponent {
    constructor(props) {
        super(props);
        bindAll(this, ['handlePaginatorClicked', 'handleStakeChanged',
            'decrementValue', 'incrementValue', 'updatePrice']);
        this.state = {
            currentPage: 0,
            openedStakePanel: false,
            stake: "10.00",
            price: undefined,
            countBetsInStake: 1,
            textBetsInStake: '',
            showBets: []
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
        if (countBetsInStake > showBets.length) {
            countBetsInStake = showBets.length
        }
        textBetsInStake = this.formatToogleText(countBetsInStake, showBets)
        this.setState({showBets, textBetsInStake, countBetsInStake})
        this.updatePrice(props, showBets)
    }

    applyPaginatorWindow(items) {
        var rows = constant.COUNT_PLAYER_ROWS;
        var i = this.state.currentPage * rows;
        var j = (this.state.currentPage + 1) * rows;
        return items.slice(i, j);
    }

    sortLegs(legs) {
        var sortFn = function (i0, i1) {
            if (i0.match.kickoff < i1.match.kickoff) {
                return -1;
            } else if (i0.match.kickoff > i1.match.kickoff) {
                return 1;
            } else {
                if (i0.description < i1.description) {
                    return -1
                } else if (i0.description > i1.description) {
                    return 1
                } else {
                    return 0;
                }
            }
        };
        return legs.sort(sortFn);
    }

    handlePaginatorClicked(item) {
        const currentPage = item.value;
        this.setState({currentPage});
    }

    handleStakeChanged(e) {
        this.setState({stake: e.target.value});
    }

    updatePrice(props, showBets) {
        const {match, bets} = props
        if (showBets.length > 0) {
            this.setState({price: undefined})
            let matchid = match.match_id.toString()
            setTimeout(function () {
                    let struct = {
                        "selection":
                            {
                                "winners_criteria": 1,
                                "xs_criteria": null,
                                "bhxs_criteria": null,
                                "ehxs_criteria": null,
                                "ones_criteria": null,
                                "bhones_criteria": null,
                                "ehones_criteria": null,
                                "twos_criteria": null,
                                "bhtwos_criteria": null,
                                "ehtwos_criteria": null,
                                "btts_criteria": null,
                                "btts_both_halves_criteria": null,
                                "btts_either_half_criteria": null,
                                "total_goals_criteria": null,
                                "home_goal_scorer_criteria": null,
                                "first_goal_scorer_in_match_home_selections_criteria": null,
                                "first_home_goal_scorer_criteria": null,
                                "home_hattrick_criteria": null,
                                "away_goal_scorer_criteria": null,
                                "first_goal_scorer_in_match_away_selections_criteria": null,
                                "first_away_goal_scorer_criteria": null,
                                "away_hattrick_criteria": null,
                                "home_corners_criteria": null,
                                "away_corners_criteria": null,
                                "match_total_corners_criteria": null,
                                "both_teams_corners_criteria": null,
                                "lower_number_of_goals_criteria": null,
                                "upper_number_of_goals_criteria": null,
                                "home_booking_points_criteria": null,
                                "away_booking_points_criteria": null,
                                "total_booking_points_criteria": null,
                                "both_teams_booking_points_criteria": null,
                                "home_player_card_criteria": null,
                                "first_player_in_match_booked_home_selections_criteria": null,
                                "first_home_player_booked_criteria": null,
                                "home_player_reds_criteria": null,
                                "away_player_card_criteria": null,
                                "first_player_in_match_booked_away_selections_criteria": null,
                                "first_away_player_booked_criteria": null,
                                "away_player_reds_criteria": null
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
                                    struct['selection']['lower_number_of_goals_criteria'] = range[0]
                                    struct['selection']['upper_number_of_goals_criteria'] = range[1]
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
                                    struct['selection']['total_goals_criteria'] = parseFloat(constant.marks[sliderValue])
                                } else if (bet.options.selectedTab['name'] === "under") {
                                    struct['selection']['total_goals_criteria'] = -Math.abs(parseFloat(constant.marks[sliderValue]))
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
                    }.bind(this));
                }.bind(this), 500
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
        let textBetsInStake = '';
        if (countBetsInStake === showBets.length) textBetsInStake = countBetsInStake + ' (of ' + showBets.length + ')';
        else textBetsInStake = countBetsInStake + '+ (of ' + showBets.length + ')';
        return textBetsInStake;
    }

    placeBet = () => {
        const {showBets, stake, price, textBetsInStake} = this.state;
        this.props.openStakePanel(showBets, stake, price, textBetsInStake);
    }

    render() {
        const {handleBetRemoved, match, bets} = this.props
        const {price, openStakePanel, showBets, textBetsInStake} = this.state;
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
            );
        }
        return (
            <div>
                <div>
                    <div className="form-group">
                        <h3 className="current-price text-center">Current price:&nbsp;
                            <span id="price">{formatCurrentPrice(price)}</span>
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
                        <div className={classNames(s["bet-submit-btns-child"], "stake-label")}>STAKE</div>
                        <div className="stake">
                            <span className="stake-symbol">€</span>
                            <input type="number" name="stake-value"
                                   className={classNames(s["bet-submit-btns-child"], "stake-value")}
                                   defaultValue={this.state.stake}
                                   onChange={this.handleStakeChanged}
                            />
                        </div>
                        <div>
                            <button
                                style={{marginTop: '8px'}}
                                className={classNames(s["bet-submit-btns-child"], "btn btn-primary")}
                                onClick={this.placeBet}>Place Bet
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        );
    }

}