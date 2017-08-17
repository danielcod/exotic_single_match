import React from 'react';
import * as DU from '../../date_utils';

export default class DateTimeCellCustom extends React.PureComponent {
    render() {
        const value = this.props.value;
        const date = new Date(value);
        const today = new Date();
        let result = [];
        const tmrw = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        if ((date.getMonth() == today.getMonth()) &&
            (date.getDate() == today.getDate())) {
            result = (<span className="label today">
                        {DU.DateUtils.formatTime(date)}
                      </span>)
        } else if ((date.getMonth() == tmrw.getMonth()) &&
            (date.getDate() == tmrw.getDate())) {
            result = (<span className="label future">
                        {"+1d"}
                    </span>)
        } else {
            result = (<span className="label future">
                        {"+" + DU.DateUtils.formatRemainedDays(today, date) + "d"}
                    </span>)
        }
        return <div
            style={{
                display: "table-cell",
                whiteSpace: "nowrap",
                verticalAlign: "middle",
                paddingRight: "5px"
            }}>{result}</div>;
    }
}