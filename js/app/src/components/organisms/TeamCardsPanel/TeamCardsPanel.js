import React from 'react'
import {bindAll, isEmpty} from 'lodash'
import MyBetTab from '../../templates/MyBetPanel/MyBetTab'
import CornersToogle from '../../molecules/CornersToggle'
import * as constant from '../../constant'
import * as products from '../../products'
import {formatPrice} from '../../utils'

const productsName = constant.TEAM_CARDS
import * as struct from '../../struct'
import s from './index.css'
import classNames from 'classnames'

export default class TeamCardsPanel extends React.PureComponent {
    constructor(props) {
        super(props)
        bindAll(this, ['handleTabClicked', 'decrementValue',
            'incrementValue', 'handleCancel', 'formatText',
            'changeStateByTab', 'setToParrenState', 'handleCancel', 'setBetResultMatch']);
        let bet = this.getCurrentBet(this.props)
        if (isEmpty(bet)) bet = this.initMatchResult()
        this.state = {
            selectedTab: bet.options.selectedTab,
            sliderOptions: bet.options.sliderOptions,
            toogleValue: bet.options.toogleValue,
            myBetTab: [
                {name: "over", label: "OVER"},
                {name: "under", label: "UNDER"}
            ],
            selectedBetTab: bet.options.selectedBetTab,
            textValue: bet.options.textValue,
            changes: bet.options.changes,
            price: bet.options.price,
            selectedItem: bet.options.selectedItem,
            selection: bet.options.selection
        }
    }

    componentWillReceiveProps(props) {
        let bet = this.getCurrentBet(props)
        if (isEmpty(bet)) bet = this.initMatchResult()
        const {selectedTab, sliderOptions, toogleValue, selectedBetTab, textValue, changes, selectedItem, selection, price} = bet.options;
        this.setState({
            selectedTab,
            sliderOptions,
            toogleValue,
            selectedBetTab,
            textValue,
            changes,
            selectedItem,
            selection,
            price
        })
    }

    componentDidMount() {
        const {curate} = this.props
        if (!isEmpty(curate)) {
            setTimeout(() => this.setBetResultMatch(curate.selection), 500)
        }
    }

    setBetResultMatch(selection) {
        const {match} = this.props
        let {toogleValue, selectedTab} = this.state
        const matches = [
            {
                id: constant.SELCTED_FIRST,
                over: match.home_bp_ft.over,
                under: match.home_bp_ft.under,
                sliderOptions: {
                    min: 2.5,
                    max: 152.5,
                    step: 5,
                    value: 7.5
                },
                selection: 'home_bp_ft'
            },
            {
                id: constant.SELCTED_TWO,
                over: match.away_bp_ft.over,
                under: match.away_bp_ft.under,
                sliderOptions: {
                    min: 2.5,
                    max: 152.5,
                    step: 5,
                    value: 7.5
                },
                selection: 'away_bp_ft'
            },
            {
                id: constant.SELCTED_THREE,
                over: match.both_bp_ft.over,
                under: match.both_bp_ft.under,
                sliderOptions: {
                    min: 2.5,
                    max: 152.5,
                    step: 5,
                    value: 7.5
                },
                selection: 'both_bp_ft'
            },
            {
                id: constant.SELCTED_FOUR,
                over: match.total_bp_ft.over,
                under: match.total_bp_ft.under,
                sliderOptions: {
                    min: 2.5,
                    max: 152.5,
                    step: 5,
                    value: 7.5
                },
                selection: 'total_bp_ft'
            }
        ]
        const curateSelection = matches.filter(function (item) {
            return selection.hasOwnProperty(item.selection)
        })[0]
        console.log("******** TEAMS CARDS *********")
        console.log(curateSelection)
        if (!isEmpty(curateSelection)) {
            toogleValue = Math.abs(selection[curateSelection.selection])
            this.setState({toogleValue})
            this.changeStateByTab(curateSelection.id, curateSelection)
            if (selection[curateSelection.selection] > 0) {
                setTimeout(() => this.handleTabClicked({name: "over", label: "OVER"}), 100)
            } else {
                setTimeout(() => this.handleTabClicked({name: "under", label: "UNDER"}), 100)
            }
        }
    }

    initMatchResult() {
        return {
            options: {
                selectedTab: "over",
                sliderOptions: struct.cornersTeamStruct[0],
                toogleValue: struct.cornersTeamStruct[0].value,
                textValue: '',
                selectedBetTab: null,
                changes: null,
                selectedItem: {},
                selection: '',
                price: 0
            }
        }
    }

    setToParrenState(selectedBetTab, toogleValue, selectedTab, textValue, sliderOptions, selectedItem) {
        let price
        if (selectedTab === 'over') {
            price = parseFloat(formatPrice(selectedItem['value'][toogleValue]))
        } else if (selectedTab === 'under') {
            price = parseFloat(formatPrice(selectedItem['value']['-' + toogleValue]))
        }
        const bet = {
            name: productsName,
            match: this.props.match,
            options: {
                selectedTab,
                sliderOptions,
                toogleValue,
                selectedBetTab,
                textValue,
                changes: true,
                price: price,
                selectedItem,
                selection: selectedItem.selection
            }
        }
        this.props.betResultMatch(bet)
    }

    getCurrentBet(props) {
        const {bets, match} = props
        let currentBet = {}
        bets.map(bet => {
            if (bet.name === productsName && bet.match.name === match.name) {
                currentBet = bet
            }
        });
        return currentBet
    }

    handleCancel() {
        const props = this.props
        const bet = this.getCurrentBet(props)
        this.props.delBetfromBetsList(bet)
    }

    changeStateByTab(selected, selectedItem) {
        const {toogleValue, selectedTab, selectedBetTab} = this.state
        if (selectedBetTab === selected) {
            this.handleCancel()
            return
        }
        const textValue = this.formatText(selected, toogleValue, selectedTab)
        this.setToParrenState(selected, toogleValue, selectedTab, textValue, selectedItem.sliderOptions, selectedItem)
    }

    handleTabClicked(tab) {
        const {toogleValue, selectedBetTab, sliderOptions, selectedItem} = this.state
        const selectedTab = tab.name
        if (selectedBetTab === null) {
            this.setState({selectedTab})
            return
        }
        const textValue = this.formatText(selectedBetTab, toogleValue, selectedTab)
        this.setToParrenState(selectedBetTab, toogleValue, selectedTab, textValue, sliderOptions, selectedItem)
    }

    decrementValue() {
        const {sliderOptions, selectedBetTab, selectedTab, selectedItem} = this.state
        let toogleValue = this.state.toogleValue - sliderOptions.step
        if (toogleValue < sliderOptions.min) toogleValue = this.state.toogleValue
        if (selectedBetTab === null) {
            this.setState({toogleValue})
            return;
        }
        const textValue = this.formatText(selectedBetTab, toogleValue, selectedTab)
        this.setToParrenState(selectedBetTab, toogleValue, selectedTab, textValue, sliderOptions, selectedItem)
    }

    incrementValue() {
        const {sliderOptions, selectedBetTab, selectedTab, selectedItem} = this.state
        let toogleValue = this.state.toogleValue + sliderOptions.step
        if (toogleValue > sliderOptions.max) toogleValue = this.state.toogleValue
        if (selectedBetTab === null) {
            this.setState({toogleValue})
            return;
        }
        const textValue = this.formatText(selectedBetTab, toogleValue, selectedTab)
        this.setToParrenState(selectedBetTab, toogleValue, selectedTab, textValue, sliderOptions, selectedItem)

    }

    formatText(selectedBetTab, toogleValue, selectedTab) {
        let textValue = ''
        if (selectedBetTab === constant.SELCTED_FIRST || selectedBetTab === constant.SELCTED_TWO) {
            const comands = this.props.match.fixture.split(' vs ')
            textValue = comands[selectedBetTab] + ' ' + selectedTab + ' ' + toogleValue + ' booking points'
        } else if (selectedBetTab === constant.SELCTED_FOUR) {
            textValue = constant.MATCH_TOTAL + ' ' + selectedTab + ' ' + toogleValue + ' booking points'
        } else {
            textValue = products.cornersComponents[selectedBetTab] + ' ' + selectedTab + ' ' + toogleValue + ' booking points'
        }
        return textValue
    }

    render() {
        const {match} = this.props
        let firstTeam, secondTeam
        if (match) {
            [firstTeam, secondTeam] = match.fixture.split(' vs ')
        }
        const matches = [
            {
                value: match.home_bp_ft,
                sliderOptions: {
                    min: 2.5,
                    max: 152.5,
                    step: 5,
                    value: 7.5
                },
                selection: 'home_bp_ft'
            },
            {
                value: match.away_bp_ft,
                sliderOptions: {
                    min: 2.5,
                    max: 152.5,
                    step: 5,
                    value: 7.5
                },
                selection: 'away_bp_ft'
            },
            {
                value: match.both_bp_ft,
                sliderOptions: {
                    min: 2.5,
                    max: 152.5,
                    step: 5,
                    value: 7.5
                },
                selection: 'both_bp_ft'
            },
            {
                value: match.total_bp_ft,
                sliderOptions: {
                    min: 2.5,
                    max: 152.5,
                    step: 5,
                    value: 7.5
                },
                selection: 'total_bp_ft'
            },

        ]
        const toogleValue = this.state.toogleValue
        return (
            <div>
                <div className={s['cornersTable']}>
                    <div className={classNames('row', s['row-change-btn'])}>
                        <div className={(this.state.selectedBetTab === 0) ?
                            classNames(s['item'], s['selected-bet-tab'], 'col-xs-6', 'col-md-6')
                            : classNames(s['item'], s['not-selected-bet-tab'], 'col-xs-6', 'col-md-6')}
                             onClick={() => this.changeStateByTab(constant.SELCTED_FIRST, matches[0])}>
                            {firstTeam}
                        </div>
                        <div className={(this.state.selectedBetTab === 1) ?
                            classNames(s['item'], s['selected-bet-tab'], 'col-xs-6', 'col-md-6')
                            : classNames(s['item'], s['not-selected-bet-tab'], 'col-xs-6', 'col-md-6')}
                             onClick={() => this.changeStateByTab(constant.SELCTED_TWO, matches[1])}>
                            {secondTeam}
                        </div>
                    </div>
                    <div className={classNames('row', s['row-change-btn'])}>
                        <div className={(this.state.selectedBetTab === 2) ?
                            classNames(s['item'], s['selected-bet-tab'], 'col-xs-6', 'col-md-6')
                            : classNames(s['item'], s['not-selected-bet-tab'], 'col-xs-6', 'col-md-6')}
                             onClick={() => this.changeStateByTab(constant.SELCTED_THREE, matches[2])}>
                            {products.cornersComponents[2]}
                        </div>
                        <div className={(this.state.selectedBetTab === 3) ?
                            classNames(s['item'], s['selected-bet-tab'], 'col-xs-6', 'col-md-6')
                            : classNames(s['item'], s['not-selected-bet-tab'], 'col-xs-6', 'col-md-6')}
                             onClick={() => this.changeStateByTab(constant.SELCTED_FOUR, matches[3])}>
                            {products.cornersComponents[3]}
                        </div>


                    </div>
                </div>
                <div className={s['wrap-mybettab']}>
                    <MyBetTab
                        tabs={this.state.myBetTab}
                        selected={this.state.selectedTab}
                        clickHandler={this.handleTabClicked}
                    />
                </div>

                <div className={s["corners-slider-container"]}>
                    <CornersToogle
                        value={toogleValue}
                        clickHandlers={{
                            increment: this.incrementValue,
                            decrement: this.decrementValue
                        }}/>
                </div>

                <div className={classNames(s["form-group"], s['output-block'])}>
                    {
                        (!this.state.changes) ?
                            <h3 className="current-price text-center">
                                No Selections
                            </h3>
                            :
                            <h3 className={classNames(s['output-block'], "current-price", "text-center")}>
                                {this.state.textValue}
                                <span className={s['price-symbol']}>
                                    @  
                                </span>
                                <span className={s['price']} id="price">
                                {this.state.price}
                            </span>
                            </h3>
                    }
                </div>
                <div className={classNames("bet-submit-btns", s['btn-group'])}>
                    <button
                        className="btn btn-primary bet-cancel-btn"
                        onClick={() => this.handleCancel()}>Clear
                    </button>
                </div>
            </div>
        )
    }

}