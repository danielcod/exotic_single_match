import React from 'react';
import ReactBootstrapSlider from 'react-bootstrap-slider';
import {bindAll} from 'lodash';

export default class AccaNGoalsSlider extends React.PureComponent {
    constructor(props) {
        super(props);
        bindAll(this, ['changeHandler'])
    }

    initSliderTicks(minval, maxval) {
        var ticks = [];
        for (var i = minval; i <= maxval; i++) {
            ticks.push(i);
        }
        return ticks;
    };

    changeHandler(event) {
        const value = parseInt(event.target.value);
        this.props.changeHandler(value);
    }

    render() {
        return (
            <div className="bet-slider-container">
                <ReactBootstrapSlider
                    value={this.props.value}
                    change={this.changeHandler}
                    max={this.props.max}
                    min={this.props.min}
                    ticks_labels={this.props.tickLabeller(this.props.min, this.props.max)}
                    ticks={this.initSliderTicks(this.props.min, this.props.max)}
                />
            </div>
        )
    }
}
