import React from 'react';
import { bindAll } from 'lodash';
import MatchResultTable from '../MatchResultTable';
import * as constant from  '../../constant';
import Slider from 'rc-slider';
const Range = Slider.Range;
import * as s from './index.css'

export default class MatchResult extends React.PureComponent {
    constructor(props){
        super(props);
        this.state={
            value: this.props.matchResult.range,
            infoText: this.props.matchResult.text,
            selectedItem: this.props.matchResult.tableSelectedItem,
            showSlider: this.props.matchResult.showSlider,
            price: 17.3,
            
        }
        bindAll(this, ['onChange', 'clickHandler', 'formatDynamicText']);
    }
    onChange(value){
        this.setState({ value });
        this.props.onChangeRange(value);
        setTimeout(()=> this.formatDynamicText(), 0) ;
    }
    componentWillReceiveProps(props){
        const   value =  props.matchResult.range,
                infoText = props.matchResult.text,
                selectedItem =  props.matchResult.tableSelectedItem,
                showSlider = props.matchResult.showSlider;
        this.setState({ value, infoText, selectedItem, showSlider});        
    }
    
    clickHandler(id, key){
        let showSlider = true;
        if (key === constant.SELCTED_TWO) showSlider = false;
        const selectedItem =  [id, key];
        this.setState({ selectedItem, showSlider });
        this.props.onTableClick(id, key, showSlider);
        setTimeout(()=> this.formatDynamicText(), 0) ;
    }
    formatDynamicText(){
        if (!this.props.match) return;
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
            infoText = comand + ' ' + selectedTime + ' ' + scores;
        }else{
            infoText = selectedTime + ' ' + comand;
            infoText = infoText.split('');
            infoText[0] = infoText[0].toUpperCase();
            infoText =  infoText.join('');
        }        
        this.setState({infoText});
        this.props.changeText(infoText);
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
                { this.state.showSlider ?                    
                    <Range dots step={1} defaultValue={this.state.value}  marks={marks} min={1} max={5} onChange={this.onChange}/>
                    : null
                }
               
                <div className='result-text' >{this.state.infoText}</div>    
                <div className= "form-group">
                    <h3 className= "current-price text-center">
                        Match Result Price:
                        <span className={s['price']} id= "price">
                            { this.state.price }
                        </span>
                    </h3>
                </div>
                
            </div>
        );    
    }
}