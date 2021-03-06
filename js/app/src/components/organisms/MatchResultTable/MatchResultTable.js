import React from 'react';
import MatchPriceCell from '../../atoms/MatchPriceCell';
import {formatPrice} from '../../utils';
import {bindAll, isEqual} from 'lodash';
import classnames from 'classnames';
import * as s from './index.css'

export default class MatchResultTable extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            selected: this.props.selected
        }
        bindAll(this, ['choicePrice']);
    }

    componentWillReceiveProps(props) {
        const selected = props.selected;
        this.setState({selected});
    }

    choicePrice(id, key, selection, selectedPrice) {
        this.props.clickHandler(id, key, selection, selectedPrice);
        this.setState({selected: [id, key]})
    }

    render() {
        const {matches} = this.props;
        return (
            <table className="table table-condensed table-striped table-not-bordered">
                <thead>
                <tr>
                    {
                        ["", "1", "X", "2"].map(function (label, key) {
                            return (
                                <th key={key} className={classnames('text-center')} style={{paddingBottom: "5px"}}>
                                    {label}
                                </th>
                            )
                        })
                    }
                </tr>
                </thead>
                <tbody>
                {
                    matches.map((match, id) => {
                        return (
                            <tr key={id} className="text-center match">
                                <td>
                                    <span className={classnames(s['first-column'])}>
                                        {match.name}
                                    </span>
                                </td>
                                {
                                    match['1x2_prices'].map((value, key) => {
                                        const selected = isEqual(this.state.selected, [id, key]);
                                        return (
                                            <MatchPriceCell
                                                key={key}
                                                value={formatPrice(Object.values(value)[0])}
                                                selected={selected}
                                                clickHandler={() => this.choicePrice(id, key, Object.keys(value)[0], formatPrice(Object.values(value)[0]))}
                                            />
                                        )
                                    })
                                }
                            </tr>
                        )
                    })
                }
                </tbody>
            </table>
        )
    }
}