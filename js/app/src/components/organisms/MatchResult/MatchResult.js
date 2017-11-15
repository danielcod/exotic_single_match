import React from 'react';
import {bindAll, isEmpty, isEqual} from 'lodash';
import MatchResultTable from '../MatchResultTable';
import * as constant from '../../constant';

const productsName = constant.MATCH_RESULT;
import Slider from 'rc-slider';

const Range = Slider.Range;
import {formatPrice} from '../../utils';
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

    componentDidMount(){
        const {curate} = this.props
        if (!isEmpty(curate)) {
            this.setBetResultMatch(curate.selection)
        }
    }

    setBetResultMatch(selection) {
        console.log(selection)
        const matches = [
            {
                name: "Full Match",
                '1x2_prices': [
                    {home_ft: match.home_ft},
                    {draw_ft: match.draw_ft},
                    {away_ft: match.away_ft}
                ],
            },
            {
                name: "Both Halves",
                '1x2_prices': [
                    {home_bh: match.home_bh},
                    {draw_bh: match.draw_bh},
                    {away_bh: match.away_bh}
                ],
            },
            {
                name: "Either Half",
                '1x2_prices': [
                    {home_eh: match.home_eh},
                    {draw_eh: match.draw_eh},
                    {away_eh: match.away_eh}
                ],
            }
        ]

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

    onChange(value) {
        const {selectedItem, showSlider, selection} = this.state;
        const {match} = this.props
        let price, lower, upper
        lower = value[0]
        upper = value[1]
        if (upper === 5) upper = 'unbounded'
        if (isEmpty(selectedItem)) {
            this.setState({value});
            return;
        }
        switch (selectedItem[0]) {
            case constant.SELCTED_FIRST:
                if (selectedItem[1] === constant.SELCTED_FIRST) {
                    price = match.home_ft_margin['lower'][lower]['upper'][upper]
                } else if (selectedItem[1] === constant.SELCTED_THREE) {
                    price = match.away_ft_margin['lower'][lower]['upper'][upper]
                } else if (selectedItem[1] === constant.SELCTED_TWO) {
                    price = this.state.price
                }
                break
            case constant.SELCTED_TWO:
                if (selectedItem[1] === constant.SELCTED_FIRST) {
                    price = match.home_bh_margin['lower'][lower]['upper'][upper]
                } else if (selectedItem[1] === constant.SELCTED_THREE) {
                    price = match.away_bh_margin['lower'][lower]['upper'][upper]
                } else if (selectedItem[1] === constant.SELCTED_TWO) {
                    price = this.state.price
                }
                break
            case constant.SELCTED_THREE:
                if (selectedItem[1] === constant.SELCTED_FIRST) {
                    price = match.home_eh_margin['lower'][lower]['upper'][upper]
                } else if (selectedItem[1] === constant.SELCTED_THREE) {
                    price = match.away_eh_margin['lower'][lower]['upper'][upper]
                } else if (selectedItem[1] === constant.SELCTED_TWO) {
                    price = this.state.price
                }
                break
        }
        const textValue = this.formatDynamicText(selectedItem, value);
        this.setToParrenState(selectedItem, value, textValue, showSlider, selection, price)
    }

    clickHandler(id, key, selection, selectedPrice) {
        const {value} = this.state
        const {match} = this.props
        let showSlider = true
        let {selectedItem} = this.state
        if (key === constant.SELCTED_TWO) showSlider = false
        if (isEqual(selectedItem, Array(id, key))) {
            this.handleCancel()
        } else {
            selectedItem = [id, key]
            let price, lower = value[0], upper = value[1]
            if (upper === 5) upper = 'unbounded'
            switch (selectedItem[0]) {
                case constant.SELCTED_FIRST:
                    if (selectedItem[1] === constant.SELCTED_FIRST) {
                        price = match.home_ft_margin['lower'][lower]['upper'][upper]
                    } else if (selectedItem[1] === constant.SELCTED_THREE) {
                        price = match.away_ft_margin['lower'][lower]['upper'][upper]
                    } else if (selectedItem[1] === constant.SELCTED_TWO) {
                        price = selectedPrice
                    }
                    break
                case constant.SELCTED_TWO:
                    if (selectedItem[1] === constant.SELCTED_FIRST) {
                        price = match.home_bh_margin['lower'][lower]['upper'][upper]
                    } else if (selectedItem[1] === constant.SELCTED_THREE) {
                        price = match.away_bh_margin['lower'][lower]['upper'][upper]
                    } else if (selectedItem[1] === constant.SELCTED_TWO) {
                        price = selectedPrice
                    }
                    break
                case constant.SELCTED_THREE:
                    if (selectedItem[1] === constant.SELCTED_FIRST) {
                        price = match.home_eh_margin['lower'][lower]['upper'][upper]
                    } else if (selectedItem[1] === constant.SELCTED_THREE) {
                        price = match.away_eh_margin['lower'][lower]['upper'][upper]
                    } else if (selectedItem[1] === constant.SELCTED_TWO) {
                        price = selectedPrice
                    }
                    break
            }
            const textValue = this.formatDynamicText(selectedItem, value)
            this.setToParrenState(selectedItem, value, textValue, showSlider, selection, price);
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
                price: parseFloat(formatPrice(selectedPrice))
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
                    {home_ft: match.home_ft},
                    {draw_ft: match.draw_ft},
                    {away_ft: match.away_ft}
                ],
            },
            {
                name: "Both Halves",
                '1x2_prices': [
                    {home_bh: match.home_bh},
                    {draw_bh: match.draw_bh},
                    {away_bh: match.away_bh}
                ],
            },
            {
                name: "Either Half",
                '1x2_prices': [
                    {home_eh: match.home_eh},
                    {draw_eh: match.draw_eh},
                    {away_eh: match.away_eh}
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