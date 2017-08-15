import React from 'react';
import ReactBootstrapSlider from 'react-bootstrap-slider';
import { bindAll } from 'lodash';
import Switch from '../../atoms/Switch'
import * as constant from  '../../constant';
import * as data from '../../products';
import * as struct from  '../../struct';
import s from './index.css';

export default class CornersPanel extends React.PureComponent {
        constructor(props){
        super(props);
        this.state={
            switchChecked: false,
            sliderOptions: struct.cornersStruct[0]
        }
        bindAll(this, ['switchHandle', 'clickGrid', 'changeSlider']);
    }
    switchHandle(){
        this.setState( { switchChecked: !this.state.switchChecked } );
        setTimeout(()=>{console.log(this.state.switchChecked)}, 0)
    }
    clickGrid(event){
        const gridName = event.target.innerText;
        let sliderOptions = {};
        if (!gridName) return;
        switch(gridName){
            case constant.HOME_TEAM:
                sliderOptions = struct.cornersStruct[0];
                break;
            case constant.AWAY_TEAM:
                sliderOptions = struct.cornersStruct[1];
                break;
            case constant.BOTH_TEAM:
                sliderOptions = struct.cornersStruct[2];
                break;                
            case constant.MATCH_TOTAL:
                sliderOptions = struct.cornersStruct[3];
                break;
        }
        this.setState({sliderOptions})
        setTimeout(()=>console.log(this.state.sliderOptions), 0) 
    }
    changeSlider(){

    }
    initSliderTicks(minval, maxval) {
        var ticks = [];
        for (var i = minval; i <= maxval; i++) {
            ticks.push(i);
        }
        return ticks;
    };
    render(){
        return(
            <div>
                <table className={s['cornersTable']}>
                    <tbody>
                        <tr>
                            {
                                data.cornersComponents.map((value, key)=>{
                                    return(
                                        <td  key={key} className={s['item']}
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
                <Switch
                    leftLabel = 'OVER'
                    rightLabel = 'UNDER'
                    switchHandle={this.switchHandle}
                    />
                 <div className="bet-slider-container">
                    <ReactBootstrapSlider
                        value={5.5}
                        change={this.changeSlider}
                        max={this.state.sliderOptions.max}
                        min={this.state.sliderOptions.min}
                        step={1}
                        ticks={this.initSliderTicks(this.state.sliderOptions.min, this.state.sliderOptions.max)}
                    />
                    {/*
                    this.state.sliderOptions.increments
                    ticks_labels={this.props.tickLabeller(this.props.min, this.props.max)}
                        ticks={this.initSliderTicks(this.props.min, this.props.max)}*/}
                </div>   
            </div>
        )
    }

}