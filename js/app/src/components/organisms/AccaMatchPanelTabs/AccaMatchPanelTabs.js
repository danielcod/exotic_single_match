import React from 'react';
import {isEmpty} from 'lodash';
import * as products from  '../../products'; 
import {formatCountBets} from '../../utils'

export default class AccaMatchPanelTabs extends React.PureComponent {

    render() {
        const { bets, match } = this.props;        
        const betInBets = formatCountBets(bets, match);
        return (
            <ul className="nav nav-tabs">
                {
                    this.props.tabs.map((tab, key) => {
                        return (
                            <li key={key}
                                className={(tab.name == this.props.selected) ? "active" : ""}
                                onClick={this.props.clickHandler.bind(null, tab)}>
                                <a href='#'>
                                    {tab.label}
                                    {(tab.name == "bet") ?
                                        <span className="badge" style={{marginLeft: "10px"}}>
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
        )
    }
}