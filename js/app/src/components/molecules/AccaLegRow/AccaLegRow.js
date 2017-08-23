import React from 'react';
import DateTimeCellCustom from '../../atoms/DateTimeCellCustom';

export default class AccaLegRow extends React.PureComponent {

    formatPrice(value) {
        if (value < 2) {
            // return value.toFixed(3);
            return value.toFixed(2);
        } else if (value < 10) {
            return value.toFixed(2);
        } else if (value < 100) {
            return value.toFixed(1);
        } else {
            return Math.floor(value);
        }
    }

    formatDescription(match) {
        var teamnames = match.split(" vs ");
        return (
            <span>{teamnames[0]}<br /><span>{" (vs " + teamnames[1] + ")"}</span></span>
        )
    }

    render() {
        return (
            <tr className="leg-row">
                <td className="leg-row-date">
                    <DateTimeCellCustom
                        value={this.props.leg.match.kickoff}
                        type="datetime"/>
                </td>
                <td className="leg-row-descr">
                    {this.formatDescription(this.props.leg.match.name)}
                </td>
                <td>
                    <span className="text-muted">
                        {this.formatPrice(this.props.leg.price)}
                    </span>
                </td>
                {
                    this.props.accaProductPanelState == "custom" ?
                        <td onClick={this.props.clickHandler.bind(null, this.props.leg)}>
                            <a className="btn btn-secondary">
                                <i className="glyphicon glyphicon-remove"></i>
                            </a>
                        </td>
                        :
                        <td>
                            <span>?</span>
                        </td>
                }
            </tr>
        )
    }
}