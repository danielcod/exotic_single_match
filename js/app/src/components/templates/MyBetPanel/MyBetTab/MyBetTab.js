import React from 'react';

export default class MyBetTab extends React.PureComponent {
    render() {
        return (
            <div id="my-bet-tabs">
                <ul className="nav nav-tabs">
                    {
                        this.props.tabs.map((tab, key) => {
                            return (
                                <li key={key}
                                    className={(tab.name == this.props.selected) ? "active" : ""}
                                    onClick={this.props.clickHandler.bind(null, tab)}>
                                    <a href='#'>{tab.label}</a>
                                </li>
                            )
                        })
                    }
                </ul>
            </div>
        )
    }
}