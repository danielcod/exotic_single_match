import React from 'react';
import MatchBetsTable from '../../organisms/MatchBetsTable';
import {bindAll} from 'lodash';
import {formatCurrentPrice, formatObjectYourBet} from '../../utils';
import CornersToogle from '../../molecules/CornersToggle';
import MyPaginator from '../../molecules/MyPaginator';
import * as constant from  '../../constant';
import * as products from  '../../products'; 
import s from './index.css';

export default class MatchBetsPanel extends React.PureComponent {
    constructor(props){
        super(props);
        bindAll(this, ['handlePaginatorClicked', 'openStakePanel', 'handleStakeChanged',
                        'decrementValue', 'incrementValue', 'updatePrice']);       
        this.state={ 
            currentPage: 0,
            openedStakePanel: false,
            stake: 0,
            countBetsInStake: 1,
            textBetsInStake: '',
            showBets: []
        }        
    }    
    componentWillMount(){
        this.changeState(this.props);
    }
    componentWillReceiveProps(nextProps){
       this.changeState(nextProps);
    }
    changeState = (props)=>{
        const {match, bets} = props;
        let showBets = [];
        let {textBetsInStake, countBetsInStake} = this.state;       
        bets.map(bet=>{
            if (bet.match.name != match.name) return;
             showBets.push(bet);           
        });
        showBets = formatObjectYourBet(showBets, match);
        textBetsInStake = this.formatToogleText(countBetsInStake, showBets);        
        this.setState({showBets, textBetsInStake});
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
    openStakePanel(){
        const {openStakePanel} = this.state;
        this.setState({openStakePanel: !openStakePanel});
    }
    handleStakeChanged(e){
        this.setState({stake: e.target.value});
    }
    updatePrice(){
        console.log('updatePrice')
    }
    decrementValue() {    
        let {countBetsInStake, showBets, textBetsInStake} = this.state;
        if (parseInt(countBetsInStake) <= 1) return;
        countBetsInStake -= 1;
        textBetsInStake = this.formatToogleText(countBetsInStake, showBets);
        this.setState({countBetsInStake, textBetsInStake});
        this.updatePrice();
    }
    incrementValue() {
        let {countBetsInStake, showBets, textBetsInStake} = this.state;
        if (parseInt(countBetsInStake) >=  showBets.length) return;
        countBetsInStake += 1;
        textBetsInStake = this.formatToogleText(countBetsInStake, showBets);
        this.setState({countBetsInStake, textBetsInStake});
        this.updatePrice();
    }
    formatToogleText(countBetsInStake, showBets){
        let textBetsInStake = '';
        if (countBetsInStake === showBets.length)  textBetsInStake = countBetsInStake + ' (of ' + showBets.length + ')';
        else textBetsInStake = countBetsInStake + '+ (of ' + showBets.length + ')';
        return textBetsInStake;
    }
    render(){       
        const {price, handleBetRemoved, match, bets} = this.props;
        const {openStakePanel, showBets, textBetsInStake} = this.state;
         console.log('render MatchBetsPanel', showBets)
        if (showBets.length === 0){
            return(
                <div>
                    <h4 className="text-center text-muted" 
                        style={{marginLeft: '50px', marginRight: '50px'}}>
                        Use the Leg Selector tab to add some selections
                    </h4>
                </div>
            );
        }
        return(
            <div>
                {openStakePanel ?
                    <div>StakePanel</div>
                    :
                    <div>
                        <div className="form-group">
                        <h3 className="current-price text-center">Current price:
                            <span id="price">{formatCurrentPrice(price)}</span>
                        </h3>
                    </div>
                    <MatchBetsTable
                            clickHandler={handleBetRemoved}
                            bets={this.applyPaginatorWindow(this.sortLegs(showBets))}
                            accaProductPanelState='custom'
                            match={match}
                        />
                        {
                            (showBets.length > constant.COUNT_PLAYER_ROWS) ?
                                <MyPaginator
                                    product={{rows : constant.COUNT_PLAYER_ROWS}}
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
                        <hr style={{borderColor: "#555"}}/>
                        <div className="bet-submit-btns">
                            <button
                                className="btn btn-primary bet-cancel-btn"
                                onClick={ this.props.clearBets}>Cancel
                            </button>
                            <div className="stake">
                                <span className="stake-label">Your Stake</span>
                                <span className="stake-symbol">€</span>
                                <input type="number" name="stake-value" className="stake-value"
                                        defaultValue={this.state.stake}
                                        onChange={ this.handleStakeChanged }
                                        />
                            </div>
                            <button
                                className="btn btn-primary"
                                onClick={this.openStakePanel}>Place Bet
                            </button>
                        </div>
                    </div>                    
                }
            </div>
        );
    }

}