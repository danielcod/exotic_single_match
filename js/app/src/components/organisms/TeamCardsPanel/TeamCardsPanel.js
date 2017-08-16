import React from 'react';
import { bindAll, isEmpty } from 'lodash';
import MyBetTab from '../../templates/MyBetPanel/MyBetTab';
import CornersToogle from '../../molecules/CornersToggle';
import * as constant from  '../../constant';
import * as products from  '../../products';
const productsName = products.matchComponents[2];
import * as data from '../../products';
import * as struct from  '../../struct';
import s from './index.css';
import classNames from 'classnames';

export default class TeamCardsPanel extends React.PureComponent {
        constructor(props){
        super(props);
        bindAll(this, ['handleTabClicked', 'clickGrid', 'decrementValue', 
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
    }
    handleTabClicked(tab) {
        this.setState({selectedTab: tab.name, changes: true});
        setTimeout(()=>this.formatText(), 0); 
    }
    clickGrid(event){
        const gridName = event.target.innerText;
        let position;
        if (!gridName) return;
        switch(gridName){
            case constant.HOME_TEAM:
                position = 0;                
                break;
            case constant.AWAY_TEAM:
                position = 1;
                break;
            case constant.BOTH_TEAM:
                position = 2;
                break;                
            case constant.MATCH_TOTAL:
                position = 3;
                break;
        }        
        this.changeStateByTab(position)
        setTimeout(()=>this.formatText(), 0); 
    }
    decrementValue() {        
        const {sliderOptions} = this.state;
        let toogleValue = this.state.toogleValue - sliderOptions.step;
        if (toogleValue < sliderOptions.min) toogleValue = this.state.toogleValue;
        this.setState({toogleValue, changes: true});        
        setTimeout(()=>this.formatText(), 0); 
    }
    incrementValue() {          
       const {sliderOptions} = this.state;
        let toogleValue = this.state.toogleValue + sliderOptions.step;
        if (toogleValue > sliderOptions.max) toogleValue = this.state.toogleValue;
        this.setState({toogleValue, changes: true});
        setTimeout(()=>this.formatText(), 0); 

    }
   formatText(){
       let textValue = '';
       const {selectedBetTab, toogleValue, selectedTab} = this.state;
       if (selectedBetTab === null || selectedBetTab === undefined) return;
       if (selectedBetTab === constant.SELCTED_FIRST || selectedBetTab === constant.SELCTED_TWO){
            const comands = this.props.match.name.split(' vs ');
            textValue = comands[selectedBetTab] + ' ' + selectedTab + ' ' + toogleValue + ' corners';
       }else{
            textValue = data.cornersComponents[selectedBetTab] + ' ' + selectedTab + ' ' + toogleValue + ' corners';       
       }       
       this.setState({textValue});
       setTimeout(()=>this.setToParrenState(), 0) ;
   }
    render(){
        const toogleValue = this.state.toogleValue + ' Corners';
        return(
            <div>
                <table className={s['cornersTable']}>
                    <tbody>
                        <tr>
                            {
                                data.cornersComponents.map((value, key)=>{                                                                     
                                    return(
                                        <td  key={key} 
                                            className={(this.state.selectedBetTab === key) ? 
                                                classNames(s['item'], s['selected-bet-tab']) 
                                                : classNames(s['item'])}
                                            onClick={this.clickGrid}>
                                            <span >
                                                {value} 
                                            </span> 
                                    </td>)
                                })
                            } 
                            
                        </tr>
                    </tbody>
                </table>
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
                <div
                    className={s['show-text']}>
                    {this.state.textValue}
                </div>
                <div className= "form-group">
                    {
                        (!this.state.changes) ? 
                        <h3 className= "current-price text-center">
                           No Selections
                        </h3>
                        :
                        <h3 className= "current-price text-center">
                            Selection Price: 
                            <span className={s['price']} id= "price">
                                { this.state.price }
                            </span>
                        </h3>                       
                    }                    
                </div>                
                <div className={classNames("bet-submit-btns", s['btn-group'])}>
                    <button
                        className="btn btn-primary bet-cancel-btn"
                        onClick={() => this.handleCancel()}>Clear Selections
                    </button>
                </div>
            </div>
        )
    }

}