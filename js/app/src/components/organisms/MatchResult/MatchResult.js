import React from 'react';
import {RangeSlider} from 'reactrangeslider';
import Slider, { Range } from 'rc-slider';
import Nouislider from 'react-nouislider';
import InputRange from 'react-input-range';
import { bindAll } from 'lodash';
import MatchResultTable from '../MatchResultTable';

export default class MatchResult extends React.PureComponent {
    constructor(props){
        super(props);
        this.state={
         value: { min: 1, max: 5 },
        }
        bindAll(this, ['onChange']);
    }
    onChange(value){
        console.log(value)
        this.setState({ value });
    }
    up(value){
        console.log(value)
    }
    render(){
        console.log(this.props.match)
        const  {value} = this.state
        return(
            <div>
                <MatchResultTable
                            matches={ this.props.matches }
                            legs= {this.props.legs}
                            clickHandler= {this.props.clickHandler}/>
                <InputRange
                    maxValue={5}
                    minValue={1}
                    value={this.state.value}
                    onChange={this.onChange} />
                    <span>{this.props.match.name}</span>    
            </div>
        );    
    }
}