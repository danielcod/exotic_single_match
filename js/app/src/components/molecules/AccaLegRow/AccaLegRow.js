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

    formatDescription(leg) {
        var selection = leg.selection;
        var teamNames = leg.match.name.split(" vs ");
        if (selection.homeAway) {
            switch (selection.homeAway) {
                case "home":
                    return (
                        <span>{teamNames[0]}<span>{" (vs " + teamNames[1] + ")"}</span></span>
                    );
                case "away":
                    return (
                        <span>{teamNames[1]}<span>{" (vs " + teamNames[0] + ")"}</span></span>
                    );
            }
        } else if (selection.name) {
            return (
                <span>{teamNames[0] + " vs " + teamNames[1]}</span>
            );
        }
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
                    {this.formatDescription(this.props.leg)}
                </td>
                {
                    this.props.price === true ?
                        <td>
                            <span className="text-muted">
                                {this.formatPrice(this.props.leg.price)}
                            </span>
                        </td>
                        :
                        null
                }
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