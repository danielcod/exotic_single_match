import React from 'react';
import { bindAll, isEmpty, isEqual } from 'lodash';
import MatchResultTable from '../MatchResultTable';
import * as constant from  '../../constant';
import * as products from  '../../products';
const productsName = products.matchComponents[0];
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
            infoText : bet.options.text,
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
        this.setState({ value });       
        setTimeout(()=> this.formatDynamicText(), 0) ;
    }
    componentWillReceiveProps(props){       
        let bet = this.getCurrentBet(props);
        if (isEmpty(bet)) bet = this.initMatchResult();
        const   value =  bet.options.range,
                infoText = bet.options.text,
                selectedItem =  bet.options.tableSelectedItem,
                showSlider = bet.options.showSlider,
                changes= bet.options.selectedMatchResult;
                
        this.setState({  value, infoText, selectedItem, showSlider, changes});      
    }
    
    clickHandler(id, key){
        let showSlider = true;
        if (key === constant.SELCTED_TWO) showSlider = false;        
        let {selectedItem} =  this.state;
        if (isEqual(selectedItem, Array(id, key))) {     
            this.handleCancel()                     
        }else{
            selectedItem = [id, key];
            this.setState({ selectedItem, showSlider: true }); 
            setTimeout(()=> this.formatDynamicText(), 0) ;   
        }           
        
    }
    formatDynamicText(){
        if (!this.props.match || !this.state.selectedItem) return;
        const comands = this.props.match.name.split(' vs ');
        const winnComandId = this.state.selectedItem[1];
        const resultTimeId = this.state.selectedItem[0];
        const {value} = this.state;
        let infoText = '', comand = '', selectedTime = '', scores = '';
        switch(winnComandId){
            case constant.SELCTED_FIRST:
                comand = comands[0] + ' ' + constant.TO_WINN;
                break;
            case constant.SELCTED_THREE:
                comand = comands[1] + ' ' + constant.TO_WINN;
                break;
            case constant.SELCTED_TWO:
                comand = constant.MATCH_IS_DRAW;
                break;
        }
        switch(resultTimeId){
            case constant.SELCTED_FIRST:
                selectedTime = constant.FULL_MATCH.toLowerCase();
                break;
            case constant.SELCTED_TWO:
                selectedTime = constant.BOTH_HALVES.toLowerCase();
                break;
            case constant.SELCTED_THREE:
               selectedTime = constant.EITHER_HALF.toLowerCase();
                break;
        }
        if (winnComandId != constant.SELCTED_TWO){
            if (value[0] === value[1]) scores = 'by exactly ' + value[0] + ' goals';
            else scores = 'by ' + value[0] + ' - ' + value[1] + ' goals';
            infoText = comand;// + ' ' + selectedTime + ' ' + scores;
        }else{
            infoText = selectedTime + ' ' + comand;
            infoText = infoText.split('');
            infoText[0] = infoText[0].toUpperCase();
            infoText =  infoText.join('');
        }        
        this.setState({infoText, changes: true});
        setTimeout(()=>this.setToParrenState(), 0) ;
        
    }
   setToParrenState(){
       
       const { infoText, value, selectedItem, showSlider, changes, price} = this.state;
       const bet = {
           name: productsName,
           match: this.props.match,
           options:{
                range: value,
                text: infoText,
                tableSelectedItem: selectedItem,
                showSlider,
                selectedMatchResult: changes,
                price
           }           
       }
       this.props.betResultMatch(bet);
   }
    render(){
        const  {value} = this.state;  
        const marks = {
            1: '1',
            2: '2',
            3: '3',
            4: '4',
            5: '5+'
        }     
        return(
            <div>
                <MatchResultTable
                            matches={ this.props.matches }
                            legs= {this.props.legs}
                            clickHandler = {this.clickHandler}
                            selected={this.state.selectedItem}/>
                <div className={s['text-goals']}>By how many goals?</div>
                <div className={s['wrap-slider']}>
                    { this.state.showSlider ?                    
                        <Range dots step={1} value={value} defaultValue={value}  marks={marks} min={1} max={5} onChange={this.onChange}/>
                        : null
                    }
                </div>                
                <div className= {classNames("form-group", s['form-marg'])}>
                     {
                        (!this.state.changes) ? 
                        <h3 className= {classNames("current-price", s['text-center'])}>
                           No Selections
                        </h3>
                        :
                        <h3 className= {classNames("current-price", s['text-center'])}>
                           {this.state.infoText} :
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