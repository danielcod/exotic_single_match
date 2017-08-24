import React from 'react';
import { bindAll, isEmpty } from 'lodash';
import MyBetTabThreeState from '../../molecules/MyBetTabThreeState';
import Slider from 'rc-slider';
import BTTSTable from '../BTTSTable';
import * as constant from  '../../constant';
import * as products from  '../../products';
const productsName = products.matchComponents[5];
import * as struct from  '../../struct';
import {formatBTTSText, formatTotalGoalsText} from '../../utils';
import s from './index.css';
import classNames from 'classnames';

export default class BTTSPanel extends React.PureComponent {
        constructor(props){
        super(props);
        bindAll(this, ['handleTabClicked',   'formatText', 'onChangeSlider',
                        'changeStateByTab', 'setToParrenState', 'handleCancel']);
        let bet = this.getCurrentBet(this.props); 
        if (isEmpty(bet)) bet = this.initMatchResult();
        this.state={
            selectedTab: bet.options.selectedTab,
            selectedItem: bet.options.selectedItem,            
            sliderValue :  bet.options.sliderValue,               
            myBetTab : [
                {name: "over", label: "OVER"},
                {name: "under", label: "UNDER"}
            ],           
            textBTTS: bet.options.textBTTS,
            textTotalGoals: bet.options.textTotalGoals,            
            changedTable: bet.options.changedTable,
            changedTab: bet.options.changedTab,
            priceBTTS: bet.options.priceBTTS,
            priceTotalGoals: bet.options.priceTotalGoals
        }        
    }
    componentWillReceiveProps(props){   
        let bet = this.getCurrentBet(props);
        if (isEmpty(bet)) bet = this.initMatchResult();
        const   { sliderValue, selectedTab, textBTTS, textTotalGoals, changedTable, changedTab, selectedItem,  priceBTTS, priceTotalGoals } = bet.options;               
                
        this.setState({ sliderValue, selectedTab, textBTTS, textTotalGoals, changedTable, changedTab, selectedItem,  priceBTTS, priceTotalGoals });      
    }
    initMatchResult(){
        return {
            options:{
                sliderValue:  3,
                selectedTab: {
                    name: "",
                    number: null
                },                                      
                textBTTS: '',       
                textTotalGoals: '',            
                changedTable: null,
                changedTab: null,
                selectedItem: [],
                priceBTTS: 1.2,
                priceTotalGoals: 3.2
        }}
    }
    setToParrenState(){       
       const {sliderValue, selectedTab, textBTTS, textTotalGoals, changedTable, changedTab, selectedItem,  priceBTTS, priceTotalGoals} = this.state;
       const bet = {
           name: productsName,
           match: this.props.match,
           options:{
                sliderValue, selectedTab, textBTTS, textTotalGoals, changedTable, changedTab, selectedItem,  priceBTTS, priceTotalGoals
           }           
       }
       this.props.betResultMatch(bet);
   }
    getCurrentBet(props){
        const {bets, match} = props;
        let currentBet = {};
        bets.map(bet=>{            
            if (bet.name === productsName && bet.match.name === match.name){
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
    changeStateByTab(row, column){
        const selectedItem =  [row, column];
        const textBTTS = formatBTTSText(row, column);
        this.setState({selectedItem, changedTable: true, textBTTS});    
        setTimeout(()=> this.setToParrenState(), 0);
    }
    handleTabClicked(tab) {
        let {selectedTab, sliderValue} = this.state;
        let changedTab;
        if (selectedTab.number === tab.number){
            selectedTab =  {
                    name: "",
                    number: null,                    
                };       
                changedTab = false;     
        }else{
            selectedTab = {name: tab.name, number: tab.number, label: tab.label};
            changedTab = true;
        }
        const textTotalGoals = formatTotalGoalsText(sliderValue, selectedTab.label);
        this.setState({selectedTab, textTotalGoals, changedTab});
        setTimeout(()=> this.setToParrenState(), 0);
    }
    onChangeSlider(sliderValue){
        const {selectedTab, changedTab} = this.state;
        let textTotalGoals = '';
        if (changedTab){
            textTotalGoals = formatTotalGoalsText(sliderValue, selectedTab.label);
            this.setState({ sliderValue, textTotalGoals }); 
            setTimeout(()=> this.setToParrenState(), 0);
        }else{
            this.setState({ sliderValue });               
        }
    }
   formatText(){
       
   }
    render(){        
        const firstTeam = this.props.match.name.split(' vs ')[0];
        const secondTeam = this.props.match.name.split(' vs ')[1];
        const toogleValue = this.state.toogleValue;
        const  {sliderValue} = this.state;  
        return(
            <div>
                <BTTSTable
                    changeStateByTab = {this.changeStateByTab}
                    selectedItem= {this.state.selectedItem}
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
                        <Slider dots step={1} value={sliderValue} defaultValue={sliderValue}  marks={constant.marks} min={1} max={6} onChange={this.onChangeSlider}/>                            
                </div>   
                
               
                <div className={classNames(s["form-group"], s['output-block'])}>
                    {
                        (!this.state.changedTable && !this.state.changedTab) ? 
                        <h3 className= "current-price text-center">
                           No Selections
                        </h3> 
                        :
                        <h3 className={classNames(s['output-block'], "current-price", "text-center")} >
                            {
                            (this.state.changedTable) ? 
                            <div className={s['price-text']}>
                                {this.state.textBTTS} 
                                <span className={s['price-symbol']}>
                                    @  
                                </span>  
                                <span className={s['price']} id= "price">
                                    { this.state.priceBTTS }
                                </span>
                            </div>
                            :null
                            }
                            {
                            ( this.state.changedTab) ?
                            <div>
                                {this.state.textTotalGoals} 
                                <span className={s['price-symbol']}>
                                    @  
                                </span>
                                <span className={s['price']} id= "price">
                                    { this.state.priceTotalGoals }
                                </span>
                            </div>
                            :null
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