import React from 'react';
import AccaLegRow from '../../molecules/AccaLegRow';

export default class AccaLegTable extends React.PureComponent {
    render() {
        const {accaProductPanelState, legs, clickHandler} = this.props;
        return (
            <table className="table table-condensed table-striped  text-center"
                   style={{marginTop: '0px', marginBottom: "0px"}}>
                <tbody>
                {
                    legs.map(function (leg, key) {
                        return (<AccaLegRow
                            key={key}
                            clickHandler={clickHandler}
                            accaProductPanelState={accaProductPanelState}
                            leg={leg}/>)
                    })
                }
                </tbody>
            </table>
        )
    }
}