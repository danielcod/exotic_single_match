import React from 'react';
import AccaProductLegRow from '../AccaProductLegRow';

export default class AccaProductLegTable extends React.PureComponent {
    render() {
        const {legs, clickHandler} = this.props;
        return (
            <table className="table table-condensed table-striped"
                   style={{marginTop: '0px', marginBottom: "0px"}}>
                <tbody>
                {
                    legs.map(function (leg, key) {
                        return (<AccaProductLegRow
                            key={key}
                            clickHandler={clickHandler}
                            leg={leg}/>)
                    })
                }
                </tbody>
            </table>
        )
    }
}