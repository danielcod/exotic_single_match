import React from 'react';
import {bindAll, isEmpty, isEqual} from 'lodash';
import MatchResultTable from '../MatchResultTable';
import * as constant from '../../constant';
const productsName = constant.MATCH_RESULT;
import Slider from 'rc-slider';
const Range = Slider.Range;
import classNames from 'classnames';
import * as s from './index.css'

export default class MatchResult extends React.PureComponent {
    constructor(props) {
        super(props);
        let bet = this.getCurrentBet(this.props);
        if (isEmpty(bet)) bet = this.initMatchResult();
        this.state = {
            value: bet.options.range,
            textValue: bet.options.textValue,
            selectedItem: bet.options.tableSelectedItem,
            showSlider: bet.options.showSlider,
            changes: bet.options.selectedMatchResult,
            price: bet.options.price,
            selection: bet.options.selection

        }
        bindAll(this, ['onChange', 'clickHandler', 'formatDynamicText',
            'handleCancel', 'getCurrentBet', 'setToParrenState']);
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

    initMatchResult() {
        return {
            name: productsName,
            options: {
                range: [1, 5],
                textValue: '',
                showSlider: true,
                tableSelectedItem: [],
                selectedMatchResult: false,
                selection: '',
                price: 0,
            }
        }
    }

    onChange(value) {
        const {selectedItem, showSlider, selection, price} = this.state;
        if (isEmpty(selectedItem)) {
            this.setState({value});
            return;
        }
        const textValue = this.formatDynamicText(selectedItem, value);
        this.setToParrenState(selectedItem, value, textValue, showSlider, selection, price)
    }

    componentWillReceiveProps(props) {
        let bet = this.getCurrentBet(props);
        if (isEmpty(bet)) bet = this.initMatchResult();
        const value = bet.options.range,
            textValue = bet.options.textValue,
            selectedItem = bet.options.tableSelectedItem,
            showSlider = bet.options.showSlider,
            changes = bet.options.selectedMatchResult,
            price = bet.options.price,
            selection = bet.options.selection
        this.setState({value, textValue, selectedItem, showSlider, changes, price, selection});
    }

    clickHandler(id, key, selection, selectedPrice) {
        let showSlider = true;
        const {value} = this.state;
        if (key === constant.SELCTED_TWO) showSlider = false;
        let {selectedItem} = this.state;
        if (isEqual(selectedItem, Array(id, key))) {
            this.handleCancel()
        } else {
            selectedItem = [id, key]
            const textValue = this.formatDynamicText(selectedItem, value);
            this.setToParrenState(selectedItem, value, textValue, showSlider, selection, selectedPrice);
        }

    }

    formatDynamicText(selectedItem, value) {
        if (!this.props.match || isEmpty(selectedItem)) return;
        const comands = this.props.match.fixture.split(' vs ');
        let firstTeam, secondTeam;
        if (this.props.match) {
            [firstTeam, secondTeam] = this.props.match.fixture.split(' vs ');
        }
        const [resultTimeId, winnComandId] = selectedItem;
        let textValue = '', comand = '', selectedTime = '', scores = '';
        const [minCountGoals, maxCountGoals] = value;
        switch (winnComandId) {
            case constant.SELCTED_FIRST:
                comand = firstTeam + ' ' + constant.TO_WINN;
                break;
            case constant.SELCTED_THREE:
                comand = secondTeam + ' ' + constant.TO_WINN;
                break;
            case constant.SELCTED_TWO:
                comand = constant.MATCH_IS_DRAW;
                break;
        }
        switch (resultTimeId) {
            case constant.SELCTED_FIRST:
                selectedTime = ''; //' (' + constant.FULL_MATCH + ')';
                break;
            case constant.SELCTED_TWO:
                selectedTime = ' (' + constant.BOTH_HALVES + ')';
                break;
            case constant.SELCTED_THREE:
                selectedTime = ' (' + constant.EITHER_HALF + ')';
                break;
        }
        const goalText = this.formatGoalText(winnComandId, value);
        if (minCountGoals === maxCountGoals) {
            if (maxCountGoals !== 5) {
                scores = winnComandId != constant.SELCTED_TWO ? '​ by​ exactly ' + maxCountGoals + goalText : '';
            } else {
                scores = winnComandId != constant.SELCTED_TWO ? '​ by ' + maxCountGoals + goalText : '';
            }
        }
        else {
            const countGoals = maxCountGoals != constant.SELCTED_SIX ? minCountGoals + ' - ' + maxCountGoals : minCountGoals + '+ ';
            scores = winnComandId != constant.SELCTED_TWO ? 'by ' + countGoals + goalText : '';
        }
        if (minCountGoals === constant.SELCTED_TWO && maxCountGoals === constant.SELCTED_SIX) scores = '';
        textValue = comand + ' ' + ' ' + scores + selectedTime;

        return textValue;
    }

    formatGoalText(winnComandId, value) {
        const [minCountGoals, maxCountGoals] = value;
        if (minCountGoals !== maxCountGoals) {
            return ' goals';
        }
        if (minCountGoals === 1) {
            return ' goal'
        } else if (minCountGoals === 5) {
            return '+ goals';
        }
        return '';
    }

    setToParrenState(selectedItem, value, textValue, showSlider, selection, selectedPrice) {
        const bet = {
            name: productsName,
            match: this.props.match,
            options: {
                range: value,
                textValue: textValue,
                showSlider,
                tableSelectedItem: selectedItem,
                selectedMatchResult: true,
                selection: selection,
                price: parseFloat(selectedPrice)
            }
        }
        this.props.betResultMatch(bet);
    }

    render() {
        const {value, selectedItem} = this.state
        const {match} = this.props
        const matches = [
            {
                name: "Full Match",
                '1x2_prices': [
                    {ones_criteria: match.ones_criteria},
                    {xs_criteria: match.xs_criteria},
                    {twos_criteria: match.twos_criteria}
                ],
            },
            {
                name: "Both Halves",
                '1x2_prices': [
                    {bhones_criteria: match.bhones_criteria},
                    {bhxs_criteria: match.bhxs_criteria},
                    {bhtwos_criteria: match.bhtwos_criteria}
                ],
            },
            {
                name: "Either Half",
                '1x2_prices': [
                    {ehones_criteria: match.ehones_criteria},
                    {ehxs_criteria: match.ehxs_criteria},
                    {ehtwos_criteria: match.ehtwos_criteria}
                ],
            }
        ]
        const marks = {
            1: '1',
            2: '2',
            3: '3',
            4: '4',
            5: '5+'
        }
        return (
            <div className={s['match-result']}>
                <MatchResultTable
                    matches={matches}
                    legs={this.props.legs}
                    clickHandler={this.clickHandler}
                    selected={selectedItem}
                />
                {this.state.showSlider ?
                    <div className={s['wrap-slider']}>
                        <div className={s['text-goals']}>By how many goals?</div>
                        <Range dots step={1} value={value} defaultValue={value} marks={marks} min={1} max={5}
                               onChange={this.onChange}/>
                    </div>
                    :
                    null
                }
                <div className={classNames("form-group", s['form-marg'])}>
                    {
                        (!this.state.changes) ?
                            <h3 className={classNames("current-price", s['text-center'])}>
                                No Selections
                            </h3>
                            :
                            <h3 className={classNames("current-price", s['text-center'])}>
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
        );
    }
}