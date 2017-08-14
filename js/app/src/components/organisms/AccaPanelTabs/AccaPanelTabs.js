import React from 'react';

export default class AccaPanelTabs extends React.PureComponent {

    render() {
        const {legs} = this.props;
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
                                            {legs.length}
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