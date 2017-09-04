import React from 'react';
import {bindAll} from 'lodash';
import AccaProductPanelList from './AccaProductPanelList';
import AccaProductPanelCustom from './AccaProductPanelCustom';

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
                this.props.clickHandler("browse");
                break;
            }
            case "edit": {
                break;
            }
            case "custom": {
                this.setState({accaProductPanelState: "custom"});
                this.props.clickHandler("edit");
                break;
            }
            case "place": {
                this.props.clickHandler("bet");
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
                )
            case "edit":
                return (
                    <div></div>
                )
            case "custom": {
                return (
                    <AccaProductPanelCustom
                        products={this.props.products}
                        exoticsApi={this.props.exoticsApi}
                        legsPaginator={this.props.legsPaginator}
                        betLegsPaginator={this.props.betLegsPaginator}
                        clickHandler={this.handleAccaProductPanelStateChanged}
                    />
                )
            }
        }
    }

    render() {
        const AccaProductPanelContent = this.getAccaProductPanelContent();
        return (
            <div>
                {AccaProductPanelContent}
            </div>
        )
    }
}