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
        var header = bet.betCondition.nLegs + "+ of " + bet.betCondition.legs;
        switch (bet.betType) {
            case 'Winners': {
                bet.betCondition.nGoals > 1 ? header = header + " to win by " + bet.betCondition.nGoals + " goals" : header = header + " to just win";
                break;
            }
            case 'Losers': {
                bet.betCondition.nGoals > 1 ? header = header + " to lose by " + bet.betCondition.nGoals + " goals" : header = header + " to just lose";
                break;
            }
            case 'Draws': {
                bet.betCondition.nGoals > 1 ? header = header + " to draw by " + bet.betCondition.nGoals + " goals" : header = header + " to just draw";
                break;
            }
        }
        return header;
    }

    render() {
        return (
            <tr className="leg-row">
                <td className="leg-row-descr">
                    <div>
                        <span className={"label " + this.props.leg.betType.toLowerCase()}>{this.props.leg.betType}</span>
                        <span>{this.props.leg.betLeague}</span>
                    </div>
                    <span className="desc" style={{marginTop: "5px"}}>
                        {this.props.leg.betLegs}
                    </span>
                    <span className="goal">
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