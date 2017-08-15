import React from 'react';
import { bindAll } from 'lodash';
import MyBetTab from '../../templates/MyBetPanel/MyBetTab';
import CornersToogle from '../../molecules/CornersToggle';
import * as constant from  '../../constant';
import * as data from '../../products';
import * as struct from  '../../struct';
import s from './index.css';
import classNames from 'classnames';

export default class CornersPanel extends React.PureComponent {
        constructor(props){
        super(props);
        this.state={
            selectedTab: "over",
            sliderOptions: struct.cornersStruct[0],
            toogleValue: struct.cornersStruct[0].value,           
            myBetTab : [
                {name: "over", label: "OVER"},
                {name: "under", label: "UNDER"}
            ],
            selectedBetTab: null,
            textValue: '',
            price: 6.5
        }
        bindAll(this, ['handleTabClicked', 'clickGrid', 'decrementValue', 
                        'incrementValue', 'handleCancel', 'formatText', 'changeStateByTab']);
    }
     handleCancel(){
        this.setState({
            selectedTab: "over",
            sliderOptions: struct.cornersStruct[0],
            toogleValue: struct.cornersStruct[0].value,                       
            textValue: '',
            selectedBetTab: null
        })
    }
    changeStateByTab(pos){
         this.setState({
            selectedTab: "over",
            sliderOptions: struct.cornersStruct[pos],
            toogleValue: struct.cornersStruct[pos].value,                       
            textValue: '',
            selectedBetTab: pos
        })
    }
    handleTabClicked(tab) {
        this.setState({selectedTab: tab.name});
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
       textValue = data.cornersComponents[selectedBetTab] + ' ' + selectedTab + ' ' + toogleValue + ' corners';       
       this.setState({textValue})
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
                <div className= "form-group">
                    <h3 className= "current-price text-center">
                        Selection Price: 
                        <span className={s['price']} id= "price">
                            { this.state.price }
                        </span>
                    </h3>
                </div>   
                <div
                    className={s['show-text']}>
                    {this.state.textValue}
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