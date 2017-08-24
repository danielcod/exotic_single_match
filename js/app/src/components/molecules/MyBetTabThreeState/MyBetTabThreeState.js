import React from 'react';
import s from './index.css';
import classNames from 'classnames';

export default class MyBetTabThreeState extends React.PureComponent {
    render() {
          const {forTeamName} = this.props;
        return (
            <div id="my-bet-tabs" className={classNames((forTeamName ? s['my-team-bet-tabs'] : s['my-bet-tabs']))}>
                <ul className="nav nav-tabs">
                    {
                        this.props.tabs.map((tab, key) => {
                            tab.number = key
                            return (
                                <li key={key}
                                    className={classNames((tab.name == this.props.selected.name ? "active" : ''))}
                                    onClick={this.props.clickHandler.bind(null, tab)}>
                                    <a className={s['tab-label']}>
                                        <span className={s['label-text']}>
                                            {tab.label}
                                        </span>
                                        </a>
                                </li>
                            )
                        })
                    }
                </ul>
            </div>
        )
    }
}