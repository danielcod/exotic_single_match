import React from 'react';
import {bindAll} from 'lodash';
import AppStageSlider from './AppStageSlider';
import AppTab from './AppTab';
import AccaProductPanel from '../../../templates/AccaProductPanel';
import MyBetPanel from '../../../templates/MyBetPanel';
import * as data from '../../../products';
import * as bet from '../../../bet';
import * as list from '../../../list';

export default class AppStage extends React.PureComponent {
    appStage = [
        {name: "browse", label: "Browse"},
        {name: "edit", label: "Edit"},
        {name: "bet", label: "Bet"}
    ];
    appTab = [
        {name: "match", label: "Match Exotics"},
        {name: "exotic", label: "Exotic Accas"},
        {name: "bets", label: "Your Bets"}
    ];

    constructor(props) {
        super(props);
        this.state = {
            currentStage: "browse",
            selectedTab: "match",
        };
        bindAll(this, ['handleTabClicked', 'handleStageChanged', 'getTabContent']);
    }

    handleTabClicked(tab) {
        this.setState({selectedTab: tab.name});
    }

    handleStageChanged(stage) {
        this.setState({
            currentStage: stage
        });
    }

    getTabContent() {
        switch (this.state.selectedTab) {
            case "match":
                return (
                    <div style={{textAlign: "center"}}>Coming soon</div>
                )
            case "exotic":
                return (
                    <AccaProductPanel
                        exoticsApi={this.props.exoticsApi}
                        products={data.products}
                        legsPaginator={{rows: 8}}
                        betLegsPaginator={{rows: 8}}
                        list={list.items}
                        clickHandler={this.handleStageChanged}
                    />
                )
            case "bets":
                return (
                    <MyBetPanel
                        mybets={bet.bets}
                        clickHandler={this.handleStageChanged}
                    />
                )
        }
    }

    render() {
        const tabContent = this.getTabContent();
        return (
            <div>
                <AppStageSlider
                    ticks={this.appStage}
                    currentStage={this.state.currentStage}
                />
                <AppTab
                    tabs={this.appTab}
                    selected={this.state.selectedTab}
                    clickHandler={this.handleTabClicked}
                    currentStage={this.state.currentStage}
                />
                {tabContent}
            </div>
        )
    }
}