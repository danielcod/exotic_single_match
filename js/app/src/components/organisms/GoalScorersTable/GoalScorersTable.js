import React from 'react';
import {bindAll, isEmpty, isEqual, findIndex} from 'lodash';
import {formatPrice} from '../../utils';
import MatchPriceCell from '../../atoms/MatchPriceCell';
import classNames from 'classnames';
import * as s from './index.css';


export default class GoalScorersTable extends React.PureComponent {
    constructor(props) {
        super(props);
        bindAll(this, ['choicePrice', 'isSelectedItem']);
    }

    componentWillReceiveProps(props) {
        const selected = props.selected;
    }

    choicePrice(id, key, selectedPrice, selectedTeam, selection, selectedId) {
        console.log(id + "-" + key + "-" + selectedPrice + "-" + selectedTeam + "-" + selection)
        this.props.clickHandler(id, key, selectedPrice, selectedTeam, selection, selectedId);
    }

    isSelectedItem(id, i) {
        const {selected} = this.props;
        const selectedView = findIndex(selected, (value) => {
            return isEqual(value, [id, i]);
        });
        return (selectedView > -1 ? true : false);
    }

    render() {
        const {matches} = this.props;
        const row = (player, id) => {
            let row = [];
            for (let i = 0; i < 2; i++) {
                if (i === 0) {
                    row.push(
                        <td key={i} className={s['name_td']}>
                            <span className={classNames(s['first-collumn'])}>
                                {player.name}
                            </span>
                        </td>
                    )
                } else {
                    const selected = this.isSelectedItem(id, i);
                    row.push(
                        <MatchPriceCell
                            key={i}
                            value={formatPrice(player.price)}
                            selected={selected}
                            clickHandler={() => this.choicePrice(id, i)}
                        />
                    )
                }
            }
            return row;
        }
        return (
            <table className={classNames("table table-condensed table-striped table-not-bordered")}>
                <thead>
                <tr>
                    {
                        ["", "Any Time", "Game 1st", "Team 1st", "3+ goals"].map(function (label, key) {
                            return (
                                <th key={key} className={classNames(s['player-table-header-item'], "text-center")}>
                                    {label}
                                </th>
                            )
                        })
                    }
                </tr>
                </thead>
                <tbody>
                {
                    matches.map((player, key) => {
                        return (
                            <tr key={key} className="text-center match">
                                <td key={0} className={s['name_td']}>
                                    <span className={classNames(s['first-collumn'])}>
                                        {player.name}
                                    </span>
                                </td>
                                <MatchPriceCell
                                    key={1}
                                    value={formatPrice(player.any_time['price'])}
                                    selected={this.isSelectedItem(key, 1)}
                                    clickHandler={() => this.choicePrice(key, 1, formatPrice(player.any_time['price']), player.name, player.any_time['selection'], player.id)}
                                />
                                <MatchPriceCell
                                    key={2}
                                    value={formatPrice(player.game_1st['price'])}
                                    selected={this.isSelectedItem(key, 2)}
                                    clickHandler={() => this.choicePrice(key, 2, formatPrice(player.game_1st['price']), player.name, player.game_1st['selection'], player.id)}
                                />
                                <MatchPriceCell
                                    key={3}
                                    value={formatPrice(player.team_1st['price'])}
                                    selected={this.isSelectedItem(key, 3)}
                                    clickHandler={() => this.choicePrice(key, 3, formatPrice(player.team_1st['price']), player.name, player.team_1st['selection'], player.id)}
                                />
                                <MatchPriceCell
                                    key={4}
                                    value={formatPrice(player.goals['price'])}
                                    selected={this.isSelectedItem(key, 4)}
                                    clickHandler={() => this.choicePrice(key, 4, formatPrice(player.goals['price']), player.name, player.goals['selection'], player.id)}
                                />
                            </tr>
                        )
                    })
                }
                </tbody>
            </table>
        );
    }
}
