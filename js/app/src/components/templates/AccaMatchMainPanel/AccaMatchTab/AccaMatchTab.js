import React from 'react'
import {formatCountBets} from '../../../utils'
import classnames from 'classnames'
import * as s from './index.css'

export default class AccaMatchTab extends React.PureComponent {

    render() {
        const { bets, match } = this.props
        const betInBets = formatCountBets(bets, match)
        return (
            <div className="main-menu">
                <ul className="nav nav-tabs">
                    {
                        this.props.tabs.map((tab, key) => {
                            const myClass = classnames((tab.name === this.props.selected) ? "active" : "",
                                                        tab.name === "bet" ? s['badgeBet'] : null)
                            return (
                                <li key={key}
                                    className={myClass}
                                    onClick={this.props.clickHandler.bind(null, tab)}>
                                    <a href='#'>
                                        {tab.label}
                                        {(tab.name === "bet" && betInBets > 0) ?
                                            <span className={classnames("badge", s['badge_'])}>
                                                {betInBets}
                                            </span>
                                            : null
                                        }
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