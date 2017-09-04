import React from 'react';
import DateTimeCell from '../../atoms/DateTimeCell';
import * as constant from '../../constant';
import s from './index.css';

export default class BetRow extends React.PureComponent {

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

    render() {
        const {leg, matchBets} = this.props;
        let firstItem = null;
        if(matchBets){
            const imgSrc = 'img/' + leg.name + '-light.png';
            firstItem =  <div className = {s['title-img']} title={leg.name}>
                                <img src={imgSrc}/>
                            </div>
        }else{
            firstItem = <DateTimeCell
                            value={this.props.leg.match.kickoff}
                            type="datetime"/>;
        }
        return (
            <tr className="leg-row">
                <td className="leg-row-date">
                    {firstItem}
                </td>
                <td className="leg-row-descr">
                    {this.props.leg.description}
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