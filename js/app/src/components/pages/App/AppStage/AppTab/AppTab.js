import React from 'react';

export default class AppTab extends React.PureComponent {

    render() {
        return (
            <div>
                {
                    /*(this.props.currentStage == "browse") ?*/
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
                    /*: null*/
                }
            </div>
        )
    }
}