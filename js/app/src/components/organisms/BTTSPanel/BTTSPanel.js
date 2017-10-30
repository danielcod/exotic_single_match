import React from 'react';
import {bindAll, isEmpty, isEqual} from 'lodash';
import MyBetTabThreeState from '../../molecules/MyBetTabThreeState';
import Slider from 'rc-slider';
import BTTSTable from '../BTTSTable';
import * as constant from '../../constant';
import * as products from '../../products';
const productsName = constant.GOALS;
import * as struct from '../../struct';
import {formatBTTSText, formatTotalGoalsText} from '../../utils';
import {formatPrice} from '../../utils';
import s from './index.css';
import classNames from 'classnames';

export default class BTTSPanel extends React.PureComponent {
    constructor(props) {
        super(props);
        bindAll(this, ['handleTabClicked', 'onChangeSlider',
            'changeStateByTab', 'setToParrenState', 'handleCancel']);
        let bet = this.getCurrentBet(this.props);
        if (isEmpty(bet)) bet = this.initMatchResult();
        this.state = {
            selectedTab: bet.options.selectedTab,
            selectedItem: bet.options.selectedItem,
            sliderValue: bet.options.sliderValue,
            myBetTab: [
                {name: "over", label: "OVER"},
                {name: "under", label: "UNDER"}
            ],
            textBTTS: bet.options.textBTTS,
            textTotalGoals: bet.options.textTotalGoals,
            changedTable: bet.options.changedTable,
            changedTab: bet.options.changedTab,
            priceBTTS: bet.options.priceBTTS,
            priceTotalGoals: bet.options.priceTotalGoals,
            selection: bet.options.selection
        }
    }

    componentWillReceiveProps(props) {
        let bet = this.getCurrentBet(props);
        if (isEmpty(bet)) bet = this.initMatchResult();
        const {sliderValue, selectedTab, textBTTS, textTotalGoals, changedTable, changedTab, selectedItem, priceBTTS, priceTotalGoals, selection} = bet.options;
        this.setState({
            sliderValue,
            selectedTab,
            textBTTS,
            textTotalGoals,
            changedTable,
            changedTab,
            selectedItem,
            priceBTTS,
            priceTotalGoals,
            selection
        });
    }

    initMatchResult() {
        return {
            options: {
                selectedTab: {
                    name: "",
                    number: null
                },
                selectedItem: [],
                sliderValue: 3,
                textBTTS: '',
                textTotalGoals: '',
                changedTable: null,
                changedTab: null,
                priceBTTS: 1.2,
                priceTotalGoals: 0,
                selection: ''
            }
        }
    }

    setToParrenState() {
        const {sliderValue, selectedTab, textBTTS, textTotalGoals, changedTable, changedTab, selectedItem, priceBTTS, priceTotalGoals, selection} = this.state;
        const bet = {
            name: productsName,
            match: this.props.match,
            options: {
                sliderValue,
                selectedTab,
                textBTTS,
                textTotalGoals,
                changedTable,
                changedTab,
                selectedItem,
                priceBTTS: parseFloat(priceBTTS),
                priceTotalGoals,
                selection
            }
        }
        this.props.betResultMatch(bet);
    }

    getCurrentBet(props) {
        const {bets, match} = props;
        let currentBet = {};
        bets.map(bet => {
            if (bet.name === productsName && bet.match.fixture === match.fixture) {
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

    changeStateByTab(row, column, priceBTTS, selection) {
        const {selectedItem} = this.state;
        const newItem = Array(row, column);
        if (isEqual(selectedItem, newItem)) {
            this.setState({selectedItem: [], changedTable: null, textBTTS: '', priceBTTS: null});
        } else {
            const textBTTS = formatBTTSText(row, column);
            this.setState({selectedItem: newItem, changedTable: true, textBTTS, priceBTTS, selection});
        }
        setTimeout(() => this.setToParrenState(), 0);
    }

    handleTabClicked(tab) {
        const {match} = this.props
        let {selectedTab, sliderValue, priceTotalGoals} = this.state;
        let changedTab
        if (selectedTab.number === tab.number) {
            selectedTab = {
                name: "",
                number: null,
            };
            changedTab = false;
        } else {
            selectedTab = {name: tab.name, number: tab.number, label: tab.label};
            changedTab = true;
            priceTotalGoals = parseFloat(formatPrice(match.total_goals_criteria[selectedTab.name][constant.marks[sliderValue]]))
        }
        const textTotalGoals = formatTotalGoalsText(sliderValue, selectedTab.label);
        this.setState({selectedTab, textTotalGoals, changedTab, priceTotalGoals});
        setTimeout(() => this.setToParrenState(), 0);
    }

    onChangeSlider(sliderValue) {
        const {match} = this.props
        const {selectedTab, changedTab} = this.state
        let textTotalGoals = ''
        let priceTotalGoals = 0
        if (changedTab) {
            textTotalGoals = formatTotalGoalsText(sliderValue, selectedTab.label);
            priceTotalGoals = parseFloat(formatPrice(match.total_goals_criteria[selectedTab.name][constant.marks[sliderValue]]))
            this.setState({sliderValue, textTotalGoals, priceTotalGoals});
            setTimeout(() => this.setToParrenState(), 0);
        } else {
            this.setState({sliderValue});
        }
    }

    render() {
        const {match} = this.props;
        let firstTeam, secondTeam;
        if (match) {
            [firstTeam, secondTeam] = this.props.match.fixture.split(' vs ');
        }
        const matches = [
            {
                name: 'Full Match',
                YES: match.btts_criteria['Yes'],
                NO: match.btts_criteria['No'],
                selection: 'btts_criteria'
            },
            {
                name: 'Both Halves',
                YES: match.btts_both_halves_criteria['Yes'],
                NO: match.btts_both_halves_criteria['No'],
                selection: 'btts_both_halves_criteria'
            },
            {
                name: 'Either Half',
                YES: match.btts_either_half_criteria['Yes'],
                NO: match.btts_either_half_criteria['No'],
                selection: 'btts_either_half_criteria'
            }
        ]
        const toogleValue = this.state.toogleValue;
        const {sliderValue} = this.state;

        return (
            <div>
                <BTTSTable
                    matches={matches}
                    changeStateByTab={this.changeStateByTab}
                    selectedItem={this.state.selectedItem}
                    match={match}
                />
                <div className={s['wrap-mybettab']}>
                    <div className={s['title-mybettab']}>
                        Total Goals:
                    </div>
                    <MyBetTabThreeState
                        tabs={this.state.myBetTab}
                        selected={this.state.selectedTab}
                        clickHandler={this.handleTabClicked}
                    />
                </div>
                <div className={s['wrap-slider']}>
                    <Slider dots step={1} value={sliderValue} defaultValue={sliderValue} marks={constant.marks} min={1}
                            max={6} onChange={this.onChangeSlider}/>
                </div>


                <div className={classNames(s["form-group"], s['output-block'])}>
                    {
                        (!this.state.changedTable && !this.state.changedTab) ?
                            <h3 className="current-price text-center">
                                No Selections
                            </h3>
                            :
                            <h3 className={classNames(s['output-block'], "current-price", "text-center")}>
                                {
                                    (this.state.changedTable) ?
                                        <div className={s['price-text']}>
                                            {this.state.textBTTS}
                                            <span className={s['price-symbol']}>@</span>
                                            <span className={s['price']} id="price">
                                                {this.state.priceBTTS}
                                            </span>
                                        </div>
                                        : null
                                }
                                {
                                    ( this.state.changedTab) ?
                                        <div>
                                            {this.state.textTotalGoals}
                                            <span className={s['price-symbol']}>@</span>
                                            <span className={s['price']} id="price">
                                                {this.state.priceTotalGoals}
                                            </span>
                                        </div>
                                        : null
                                }
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