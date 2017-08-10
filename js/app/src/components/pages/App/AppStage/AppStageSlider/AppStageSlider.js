import React from 'react';
import ReactBootstrapSlider from 'react-bootstrap-slider';

export default class AppStageSlider extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            disabled: ""
        }
    }

    initSliderTicks(minval, maxval) {
        var ticks = [];
        for (var i = minval; i <= maxval; i++) {
            ticks.push(i);
        }
        return ticks;
    };

    componentDidMount() {
        this.setState({
            disabled: "disabled"
        })
    }

    render() {
        const {ticks, currentStage} = this.props;
        const sliderTicks = this.initSliderTicks(1, ticks.length);
        return (
            <div className="app-stage-slider-container">
                <ReactBootstrapSlider
                    value={ticks.map(function (o) {return o.name;}).indexOf(currentStage) + 1}
                    max={ticks.length}
                    min={1}
                    ticks_labels={ticks.map(function (o) {return o.label;})}
                    ticks={sliderTicks}
                    tooltip="hide"
                    disabled={this.state.disabled}
                />
            </div>
        )
    }
}