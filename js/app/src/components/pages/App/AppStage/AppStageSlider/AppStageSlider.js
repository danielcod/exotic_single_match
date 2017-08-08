import React from 'react';
import ReactBootstrapSlider from 'react-bootstrap-slider';

export default class AppStageSlider extends React.PureComponent {

    constructor(props) {
        super(props);
    }

    initSliderTicks(minval, maxval) {
        var ticks = [];
        for (var i = minval; i <= maxval; i++) {
            ticks.push(i);
        }
        return ticks;
    };

    render() {
        return (
            <div className="app-stage-slider-container">
                <ReactBootstrapSlider
                    value={this.props.tickLabels.indexOf(this.props.currentStage) + 1}
                    max={this.props.tickLabels.length}
                    min={1}
                    ticks_labels={this.props.tickLabels}
                    ticks={this.initSliderTicks(1, this.props.tickLabels.length)}
                    tooltip="hide"
                    disabled="disabled" />
            </div>
        )
    }
}