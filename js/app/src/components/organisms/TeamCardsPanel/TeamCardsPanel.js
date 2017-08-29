import React from 'react';
import { bindAll, isEmpty } from 'lodash';
import MyBetTab from '../../templates/MyBetPanel/MyBetTab';
import CornersToogle from '../../molecules/CornersToggle';
import * as constant from  '../../constant';
import * as products from  '../../products';
const productsName = products.matchComponents[2];
import * as struct from  '../../struct';
import s from './index.css';
import classNames from 'classnames';

export default class TeamCardsPanel extends React.PureComponent {
        constructor(props){
        super(props);
        bindAll(this, ['handleTabClicked',  'decrementValue', 
                        'incrementValue', 'handleCancel', 'formatText', 
                        'changeStateByTab', 'setToParrenState', 'handleCancel']);
        let bet = this.getCurrentBet(this.props); 
        if (isEmpty(bet)) bet = this.initMatchResult();
        this.state={
            selectedTab: bet.options.selectedTab,
            sliderOptions: bet.options.sliderOptions,
            toogleValue:  bet.options.toogleValue,           
            myBetTab : [
                {name: "over", label: "OVER"},
                {name: "under", label: "UNDER"}
            ],
            selectedBetTab: bet.options.selectedBetTab,
            textValue: bet.options.textValue,
            changes: bet.options.changes,
            price: 25.5
        }        
    }
    componentWillReceiveProps(props){
        let bet = this.getCurrentBet(props);
        if (isEmpty(bet)) bet = this.initMatchResult();
        const {selectedTab, sliderOptions, toogleValue, selectedBetTab, textValue, changes} = bet.options;   
        this.setState({ selectedTab, sliderOptions, toogleValue, selectedBetTab, textValue, changes });   
            
    }
    initMatchResult(){
        return {
            options:{
                selectedTab: "over",
                sliderOptions: struct.cornersTeamStruct[0],
                toogleValue: struct.cornersTeamStruct[0].value,                       
                textValue: '',
                selectedBetTab: null,
                changes: null,

        }}
    }
    setToParrenState(){       
       const {selectedTab, sliderOptions, toogleValue, selectedBetTab, textValue, changes, price} = this.state;
       const bet = {
           name: productsName,
           match: this.props.match,
           options:{
                selectedTab, 
                sliderOptions, 
                toogleValue, 
                selectedBetTab, 
                textValue, 
                changes,
                price
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
    changeStateByTab(pos){
         this.setState({
            selectedTab: "over",
            sliderOptions: struct.cornersTeamStruct[pos],
            toogleValue: struct.cornersTeamStruct[pos].value,                       
            textValue: '',
            selectedBetTab: pos,
            changes: true
        })

      setTimeout(()=>this.formatText(), 0); 
    }
    handleTabClicked(tab) {
        this.setState({selectedTab: tab.name});
        setTimeout(()=>this.formatText(), 0); 
    }
    
    decrementValue() {        
        const {sliderOptions} = this.state;
        let toogleValue = this.state.toogleValue - sliderOptions.step;
        if (toogleValue < sliderOptions.min) toogleValue = this.state.toogleValue;
        this.setState({toogleValue});        
        setTimeout(()=>this.formatText(), 0); 
    }
    incrementValue() {          
       const {sliderOptions} = this.state;
        let toogleValue = this.state.toogleValue + sliderOptions.step;
        if (toogleValue > sliderOptions.max) toogleValue = this.state.toogleValue;
        this.setState({toogleValue});
        setTimeout(()=>this.formatText(), 0); 

    }
   formatText(){
       let textValue = '';
       const {selectedBetTab, toogleValue, selectedTab} = this.state;
       if (selectedBetTab === null || selectedBetTab === undefined) return;
       if (selectedBetTab === constant.SELCTED_FIRST || selectedBetTab === constant.SELCTED_TWO){
            const comands = this.props.match.name.split(' vs ');
            textValue = comands[selectedBetTab] + ' ' + selectedTab + ' ' + toogleValue + ' cards';
       }else if(selectedBetTab === constant.SELCTED_FOUR){
            textValue = constant.TOTAL_BOOKING_POINTS + ' ' + selectedTab + ' ' + toogleValue + ' cards';   
       }else{
            textValue = products.cornersComponents[selectedBetTab] + ' ' + selectedTab + ' ' + toogleValue + ' cards';       
       }       
       this.setState({textValue});
       setTimeout(()=>this.setToParrenState(), 0) ;
   }
    render(){        
        const firstTeam = this.props.match.name.split(' vs ')[0];
        const secondTeam = this.props.match.name.split(' vs ')[1];
        const toogleValue = this.state.toogleValue;
        return(
            <div>
                <div className={s['cornersTable']}>
                    <div className={classNames('row', s['row-change-btn'])}>
                        <div className={(this.state.selectedBetTab === 0) ? 
                                            classNames(s['item'], s['selected-bet-tab'], 'col-xs-6', 'col-md-6') 
                                            : classNames(s['item'], s['not-selected-bet-tab'], 'col-xs-6', 'col-md-6')}
                            onClick={()=>this.changeStateByTab(constant.SELCTED_FIRST)}>
                            {firstTeam}
                        </div>
                        <div className={(this.state.selectedBetTab === 1) ? 
                                            classNames(s['item'], s['selected-bet-tab'], 'col-xs-6', 'col-md-6') 
                                            : classNames(s['item'], s['not-selected-bet-tab'], 'col-xs-6', 'col-md-6')}
                            onClick={()=>this.changeStateByTab(constant.SELCTED_TWO)}>
                            {secondTeam}
                        </div>
                    </div>
                    <div className={classNames('row', s['row-change-btn'])}>
                        <div className={(this.state.selectedBetTab === 2) ? 
                                            classNames(s['item'], s['selected-bet-tab'], 'col-xs-6', 'col-md-6') 
                                            : classNames(s['item'], s['not-selected-bet-tab'], 'col-xs-6', 'col-md-6')}
                            onClick={()=>this.changeStateByTab(constant.SELCTED_THREE)}>
                            {products.cornersComponents[2]}
                        </div>
                        <div className={(this.state.selectedBetTab === 3) ? 
                                            classNames(s['item'], s['selected-bet-tab'], 'col-xs-6', 'col-md-6') 
                                            : classNames(s['item'], s['not-selected-bet-tab'], 'col-xs-6', 'col-md-6')}
                            onClick={()=>this.changeStateByTab(constant.SELCTED_FOUR)}>
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
                        <h3 className= "current-price text-center">
                           No Selections
                        </h3>
                        :
                        <h3 className={classNames(s['output-block'], "current-price", "text-center")} >
                             {this.state.textValue}: 
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
        )
    }

}