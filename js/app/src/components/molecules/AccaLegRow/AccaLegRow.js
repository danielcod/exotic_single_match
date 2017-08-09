import React from 'react';
import DateTimeCell from '../../atoms/DateTimeCell';

export default class AccaLegRow extends React.PureComponent{ 
    
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
    render(){
        return(
            <tr className = "leg-row">
                <td className = "leg-row-date">
                    <DateTimeCell 
                        value = {this.props.leg.match.kickoff}
                        type= "datetime"/>
                </td>
                <td className = "leg-row-descr">
                    {this.props.leg.description}
                </td>
                <td>
                    <span className= "text-muted">
                        {this.formatPrice(this.props.leg.price)}
                    </span>
                </td>
                <td onClick={this.props.clickHandler.bind(null, this.props.leg)}>
                    <a className= "btn btn-secondary">
                        <i className="glyphicon glyphicon-remove"></i>
                    </a>
                </td>
            </tr>           
        )
    }
}