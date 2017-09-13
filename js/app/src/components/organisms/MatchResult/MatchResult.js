import React from 'react';
import { bindAll, isEmpty, isEqual } from 'lodash';
import MatchResultTable from '../MatchResultTable';
import * as constant from  '../../constant';
import * as products from  '../../products';
const productsName = constant.MATCH_RESULT;
import Slider from 'rc-slider';
const Range = Slider.Range;
import classNames from 'classnames';
import * as s from './index.css'

export default class MatchResult extends React.PureComponent {
    constructor(props){
        super(props);
        let bet = this.getCurrentBet(this.props); 
        if (isEmpty(bet)) bet = this.initMatchResult();
        this.state={
            value :  bet.options.range,
            textValue  : bet.options.textValue,
            selectedItem :  bet.options.tableSelectedItem,
            showSlider : bet.options.showSlider,
            changes : bet.options.selectedMatchResult,
            price: 17.3,
            
        }
        bindAll(this, ['onChange', 'clickHandler', 'formatDynamicText',
                        'handleCancel', 'getCurrentBet', 'setToParrenState']);    
    }
    getCurrentBet(props){
        const {bets, match} = props;
        let currentBet = {};
        bets.map(bet=>{            
            if (bet.name ===  productsName && bet.match.name === match.name){
                currentBet = bet;
            }
        });
        return currentBet;
    }
    handleCancel(){
         const props = this.props;
         const bet  = this.getCurrentBet(props);
         this.props.delBetfromBetsList(bet);        
    }
    initMatchResult(){
        return {
            name: productsName,
            options:{
                range: [1, 5],
                selectedItem: [],
                text: ' ',
                showSlider: true,
                buildMyOwn: false,
                changes: false
        }}
    }
    onChange(value){
        const {selectedItem, showSlider} = this.state;
        if (!selectedItem) {
            this.setState({value});
            return;
        }
       const textValue =  this.formatDynamicText(selectedItem, value);
       this.setToParrenState(selectedItem, value, textValue, showSlider)
    }
    componentWillReceiveProps(props){       
        let bet = this.getCurrentBet(props);
        if (isEmpty(bet)) bet = this.initMatchResult();
        const   value =  bet.options.range,
                textValue  = bet.options.textValue,
                selectedItem =  bet.options.tableSelectedItem,
                showSlider = bet.options.showSlider,
                changes= bet.options.selectedMatchResult;
                
        this.setState({  value, textValue, selectedItem, showSlider, changes});      
    }
    
    clickHandler(id, key){
        let showSlider = true;
        const {value} = this.state;
        if (key === constant.SELCTED_TWO) showSlider = false;        
        let {selectedItem} =  this.state;
        if (isEqual(selectedItem, Array(id, key))) {     
            this.handleCancel()                     
        }else{
            selectedItem = [id, key];
            const textValue = this.formatDynamicText(selectedItem, value);
            this.setToParrenState(selectedItem, value, textValue, showSlider);
        }           
        
    }
    formatDynamicText(selectedItem, value){
        if (!this.props.match || !selectedItem) return;
        const comands = this.props.match.name.split(' vs ');
        const [resultTimeId, winnComandId ]  = selectedItem;
        let textValue  = '', comand = '', selectedTime = '', scores = '', goalText = '';
        const [minCountGoals, maxCountGoals] = value;
        switch(winnComandId){
            case constant.SELCTED_FIRST:
                comand = comands[0] + ' ' + constant.TO_WINN;
                goalText = (minCountGoals === maxCountGoals && minCountGoals === 1) ?  ' goal' : ' goals';
                break;
            case constant.SELCTED_THREE:
                comand = comands[1] + ' ' + constant.TO_WINN;
                goalText = (minCountGoals === maxCountGoals && minCountGoals === 1) ?  ' goal' : ' goals';
                break;
            case constant.SELCTED_TWO:
                comand = constant.MATCH_IS_DRAW;
                goalText = ''; //minCountGoals != maxCountGoals ?  ' total goals' : ' total goal';
                break;
        }
        switch(resultTimeId){
            case constant.SELCTED_FIRST:
                selectedTime = ''; //' (' + constant.FULL_MATCH + ')';
                break;
            case constant.SELCTED_TWO:
                selectedTime = ' (' + constant.BOTH_HALVES +')';
                break;
            case constant.SELCTED_THREE:
               selectedTime = ' (' + constant.EITHER_HALF + ')';
                break;
        }        
        if (minCountGoals === maxCountGoals) {            
            scores = winnComandId != constant.SELCTED_TWO ?  '​ by​ exactly ' + maxCountGoals + goalText : '';
        }
        else {
            const countGoals = maxCountGoals != constant.SELCTED_SIX ? minCountGoals + ' - ' + maxCountGoals : minCountGoals + '+ ';
            scores = winnComandId != constant.SELCTED_TWO ?  'by ' + countGoals + goalText : '';
        }
        if (minCountGoals === constant.SELCTED_TWO && maxCountGoals=== constant.SELCTED_SIX) scores = '';
        textValue  = comand + ' ' + ' ' + scores + selectedTime;        
        
        return textValue;  
    }
   setToParrenState(selectedItem, value, textValue, showSlider){
       
       const { changes, price} = this.state;
       const bet = {
           name: productsName,
           match: this.props.match,
           options:{
                range: value,
                textValue: textValue,
                tableSelectedItem: selectedItem,
                showSlider,
                selectedMatchResult: true,
                price
           }           
       }
       this.props.betResultMatch(bet);
   }
    render(){
        const  {value, selectedItem} = this.state;  
        let select;
        if (selectedItem) select = selectedItem[1];
        const marks = {
            1: '1',
            2: '2',
            3: '3',
            4: '4',
            5: '5+'
        }     
        return(
            <div className={s['match-result']}>
                <MatchResultTable
                            matches={ this.props.matches }
                            legs= {this.props.legs}
                            clickHandler = {this.clickHandler}
                            selected={selectedItem}/>              
                { this.state.showSlider ? 
                        <div className={s['wrap-slider']}>
                            <div className={s['text-goals']}>By how many goals?</div>  
                            <Range dots step={1} value={value} defaultValue={value}  marks={marks} min={1} max={5} onChange={this.onChange}/>    
                        </div>
                        : 
                        null           
                    }                              
                <div className= {classNames("form-group", s['form-marg'])}>
                     {
                        (!this.state.changes) ? 
                        <h3 className= {classNames("current-price", s['text-center'])}>
                           No Selections
                        </h3>
                        :
                        <h3 className= {classNames("current-price", s['text-center'])}>
                           {this.state.textValue} 
                           <span className={s['price-symbol']}>
                                    @  
                                </span> 
                            <span className={s['price']} id= "price">
                                { this.state.price }
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