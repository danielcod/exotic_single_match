import React from 'react';
import {bindAll} from 'lodash';
import AccaProductPanelList from './AccaProductPanelList';

export default class AccaProductPanel extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            accaProductPanelState: "list",
        };
        bindAll(this, ['handleAccaProductPanelStateChanged', 'getAccaProductPanelContent']);
    }

    handleAccaProductPanelStateChanged(accaProductPanelState) {
        switch (accaProductPanelState) {
            case "list": {
                this.setState({accaProductPanelState: "list"});
                break;
            }
            case "edit": {
                this.setState({accaProductPanelState: "edit"});
                break;
            }
            case "custom": {
                this.props.clickHandler({name: "build"});
                break;
            }
        }
    }

    getAccaProductPanelContent() {
        switch (this.state.accaProductPanelState) {
            case "list":
                return (
                    <AccaProductPanelList
                        items={this.props.list}
                        legsPaginator={this.props.legsPaginator}
                        clickHandler={this.handleAccaProductPanelStateChanged}
                    />
                );
            case "edit":
                return (
                    <div></div>
                )
        }
    }

    render() {
        const AccaProductPanelContent = this.getAccaProductPanelContent();
        return (
            <div id="exotic-acca-content">
                {AccaProductPanelContent}
            </div>
        )
    }
}