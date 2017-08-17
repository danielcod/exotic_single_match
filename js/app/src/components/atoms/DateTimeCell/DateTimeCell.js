import React from 'react';
import * as DU from '../../date_utils';

export default class DateTimeCell extends React.PureComponent{
    render(){
        const value=this.props.value;
	    const date=new Date(value);
	    const today=new Date();
        let result = [];
	    const tmrw=new Date(today.getTime()+24*60*60*1000);
        if ((date.getMonth()==today.getMonth()) &&
            (date.getDate()==today.getDate())) {
            result = (<span className="label label-warning">
                        {"Today"+ this.props.type=="datetime" ? " "+DU.DateUtils.formatTime(date) : ""}
                      </span>)            
        } else if ((date.getMonth()==tmrw.getMonth()) &&
            (date.getDate()==tmrw.getDate())) {
            result = (<span className= "label label-info">
                        {"Tomorrow"}
                    </span>)            
        } else {
            result = (<span>
                        {DU.DateUtils.formatDate(date)}
                    </span>)            
        }
        return <div style={{display: "table-cell", whiteSpace: "nowrap", verticalAlign: "middle", paddingRight: "5px"}}>{result}</div>;
    }
}