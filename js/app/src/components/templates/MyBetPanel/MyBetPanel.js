import React from 'react';
import {bindAll} from 'lodash';
import MyBetTab from './MyBetTab';
import MyBetList from './MyBetList';

export default class MyBetPanel extends React.PureComponent {
    myBetTab = [
        {name: "open", label: "OPEN"},
        {name: "settled", label: "SETTLED"}
    ];

    constructor(props) {
        super(props);
        this.state = {
            selectedTab: "open"
        };
        bindAll(this, ['handleTabClicked', 'getTabContent', 'getBetsFromTab']);
    }

    componentWillMount() {

    }

    handleTabClicked(tab) {
        this.setState({selectedTab: tab.name});
    }

    getBetsFromTab(bets) {
        if (this.state.selectedTab == "open") {
            return bets.filter(function (bet) {
                return bet.betResult == "?";
            })
        } else {
            return bets.filter(function (bet) {
                return bet.betResult != "?";
            })
        }
    }

    getTabContent(mybets) {
        const bets = this.getBetsFromTab(mybets);
        return (
                <MyBetList
                    bets={bets}
                    selectedTab={this.state.selectedTab}
                />
        );
    }

    render() {
        const {mybets, clickHandler} = this.props;
        const tabContent = this.getTabContent(mybets);
        return (
            <div>
                <MyBetTab
                    tabs={this.myBetTab}
                    selected={this.state.selectedTab}
                    clickHandler={this.handleTabClicked}
                />
                {tabContent}
            </div>
        )
    }
}