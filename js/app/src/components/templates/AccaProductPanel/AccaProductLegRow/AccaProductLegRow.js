import React from 'react';

export default class AccaProductLegRow extends React.PureComponent {

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

    getHeader(bet) {
        return "Any " + bet.betCondition.nLegs + "+ of " + bet.betCondition.legs;
    }

    render() {
        return (
            <tr className="leg-row">
                <td className="leg-row-descr">
                    <div>
                        <span className="bold">{this.props.leg.betLeague + " (" + this.props.leg.betTime + ")"}</span>
                    </div>
                    <span className="desc" style={{marginTop: "5px"}}>
                        {this.props.leg.betLegs}
                    </span>
                    <span className="goal label">
                        {this.getHeader(this.props.leg)}
                    </span>
                </td>
                <td className="leg-row-price">
                    <span>
                        {this.formatPrice(this.props.leg.betPrice)}
                    </span>
                </td>
                <td onClick={this.props.clickHandler.bind(null, this.props.leg)}>
                    <a className="btn btn-secondary">
                        <i className="glyphicon glyphicon-pencil"></i>
                    </a>
                </td>
            </tr>
        )
    }
}