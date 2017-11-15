import React from 'react';
import {bindAll, isEmpty} from 'lodash';
import MyBetTab from '../../templates/MyBetPanel/MyBetTab';
import CornersToogle from '../../molecules/CornersToggle';
import * as constant from '../../constant';
import * as products from '../../products';
import {formatPrice} from '../../utils';

const productsName = constant.CORNERS;
import * as struct from '../../struct';
import s from './index.css';
import classNames from 'classnames';

export default class CornersPanel extends React.PureComponent {
    constructor(props) {
        super(props);
        bindAll(this, ['handleTabClicked', 'decrementValue',
            'incrementValue', 'handleCancel', 'formatText',
            'changeStateByTab', 'setToParrenState', 'handleCancel']);
        let bet = this.getCurrentBet(this.props);
        if (isEmpty(bet)) bet = this.initMatchResult();
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
        let bet = this.getCurrentBet(props);
        if (isEmpty(bet)) bet = this.initMatchResult();
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
        });

    }

    initMatchResult() {
        return {
            options: {
                selectedTab: "over",
                sliderOptions: struct.cornersStruct[0],
                toogleValue: struct.cornersStruct[0].value,
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
                price: parseFloat(formatPrice(selectedItem[selectedTab][toogleValue])),
                selectedItem,
                selection: selectedItem.selection
            }
        }
        this.props.betResultMatch(bet);
    }

    getCurrentBet(props) {
        const {bets, match} = props;
        let currentBet = {};
        bets.map(bet => {
            if (bet.name === productsName && bet.match.name === match.name) {
                currentBet = bet;
            }
        });
        return currentBet;
    }

    handleCancel() {
        const props = this.props;
        const bet = this.getCurrentBet(props);
        this.props.delBetfromBetsList(bet);
    }

    changeStateByTab(selected, selectedItem) {
        let {toogleValue, selectedTab, selectedBetTab} = this.state;
        if (selectedBetTab === selected) {
            this.handleCancel();
            return;
        }
        if (toogleValue > selectedItem.sliderOptions.max) {
            toogleValue = selectedItem.sliderOptions.max
        }
        const textValue = this.formatText(selected, toogleValue, selectedTab);
        this.setToParrenState(selected, toogleValue, selectedTab, textValue, selectedItem.sliderOptions, selectedItem)
    }

    handleTabClicked(tab) {
        const {toogleValue, selectedBetTab, sliderOptions, selectedItem} = this.state;
        const selectedTab = tab.name;
        if (selectedBetTab === null) {
            this.setState({selectedTab});
            return;
        }
        const textValue = this.formatText(selectedBetTab, toogleValue, selectedTab);
        this.setToParrenState(selectedBetTab, toogleValue, selectedTab, textValue, sliderOptions, selectedItem);
    }

    decrementValue() {
        const {sliderOptions, selectedBetTab, selectedTab, selectedItem} = this.state;
        let toogleValue = this.state.toogleValue - sliderOptions.step;
        if (toogleValue < sliderOptions.min) toogleValue = this.state.toogleValue;
        if (selectedBetTab === null) {
            this.setState({toogleValue});
            return;
        }
        const textValue = this.formatText(selectedBetTab, toogleValue, selectedTab);
        this.setToParrenState(selectedBetTab, toogleValue, selectedTab, textValue, sliderOptions, selectedItem);
    }

    incrementValue() {
        const {sliderOptions, selectedBetTab, selectedTab, selectedItem} = this.state;
        let toogleValue = this.state.toogleValue + sliderOptions.step;
        if (toogleValue > sliderOptions.max) toogleValue = this.state.toogleValue;
        if (selectedBetTab === null) {
            this.setState({toogleValue});
            return;
        }
        const textValue = this.formatText(selectedBetTab, toogleValue, selectedTab);
        this.setToParrenState(selectedBetTab, toogleValue, selectedTab, textValue, sliderOptions, selectedItem);
    }

    formatText(selectedBetTab, toogleValue, selectedTab) {
        let textValue = '';
        if (selectedBetTab === constant.SELCTED_FIRST || selectedBetTab === constant.SELCTED_TWO) {
            const comands = this.props.match.fixture.split(' vs ');
            textValue = comands[selectedBetTab] + ' ' + selectedTab + ' ' + toogleValue + ' corners';
        } else {
            textValue = products.cornersComponents[selectedBetTab] + ' ' + selectedTab + ' ' + toogleValue + ' corners';
        }
        return textValue;
    }

    render() {
        const {match} = this.props;
        let firstTeam, secondTeam;
        if (match) {
            [firstTeam, secondTeam] = match.fixture.split(' vs ');
        }
        const matches = [
            {
                over: match.home_corners_ft.over,
                under: match.home_corners_ft.under,
                sliderOptions: {
                    min: 0.5,
                    max: 10.5,
                    step: 1,
                    value: 4.5
                },
                selection: 'home_corners_ft'
            },
            {
                over: match.away_corners_ft.over,
                under: match.away_corners_ft.under,
                sliderOptions: {
                    min: 0.5,
                    max: 10.5,
                    step: 1,
                    value: 3.5
                },
                selection: 'away_corners_ft'
            },
            {
                over: match.both_corners_ft.over,
                under: match.both_corners_ft.under,
                sliderOptions: {
                    min: 0.5,
                    max: 10.5,
                    step: 1,
                    value: 4.5
                },
                selection: 'both_corners_ft'
            },
            {
                over: match.total_corners_ft.over,
                under: match.total_corners_ft.under,
                sliderOptions: {
                    min: 0.5,
                    max: 21.5,
                    step: 1,
                    value: 8.5
                },
                selection: 'total_corners_ft'
            }
        ]
        const toogleValue = this.state.toogleValue;
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