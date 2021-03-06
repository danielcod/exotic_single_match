import React from 'react';
import AccaLegRow from '../../molecules/AccaLegRow';

export default class AccaLegTable extends React.PureComponent {
    render() {
        const {price, accaProductPanelState, legs, clickHandler} = this.props;
        return (
            <table className="table table-condensed table-striped  text-center table-bordered">
                <tbody>
                {
                    legs.map(function (leg, key) {
                        return (<AccaLegRow
                            key={key}
                            clickHandler={clickHandler}
                            accaProductPanelState={accaProductPanelState}
                            price={price}
                            leg={leg}/>)
                    })
                }
                </tbody>
            </table>
        )
    }
}