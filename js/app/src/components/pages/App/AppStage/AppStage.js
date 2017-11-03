import React from 'react';
import {bindAll} from 'lodash';
import AppTab from './AppTab';
import AccaProductPanel from '../../../templates/AccaProductPanel';
import AccaMatchProductPanel from '../../../templates/AccaMatchProductPanel';
import MyBetPanel from '../../../templates/MyBetPanel';
import {matchSorter} from '../../../utils';
import * as data from '../../../products';
import * as list from '../../../list';
import * as faq from '../../../faq';
import classnames from 'classnames';

export default class AppStage extends React.PureComponent {
    appTab = [
        {name: "browse", label: "Browse"},
        {name: "build", label: "Build"},
        {name: "bet", label: "Betslip"},
        {name: "bets", label: "Bets"}
    ];

    constructor(props) {
        super(props)
        this.state = {
            selectedTab: "browse",
            match: {},
            bets: []
        }
        bindAll(this, ['handleTabClicked', 'handleToBrowse', 'setMatch', 'setBets', 'getTabContent'])
    }

    handleTabClicked(tab) {
        this.setState({selectedTab: tab.name})
    }

    handleToBrowse(selectedTab) {
        this.setState({selectedTab})
    }

    setMatch(match) {
        this.setState({match})
    }

    setBets(bets = []) {
        this.setState({bets})
    }

    getTabContent() {
        switch (this.state.selectedTab) {
            case "browse":
                return (
                    <AccaProductPanel
                        list={list.items}
                        legsPaginator={{rows: 4}}
                        clickHandler={this.handleTabClicked}
                    />
                )
            case "build":
            case "bet":
                return (
                    <AccaMatchProductPanel
                        exoticsApi={this.props.exoticsApi}
                        selectedTab={this.state.selectedTab}
                        setMatch={this.setMatch}
                        setBets={this.setBets}
                        handleToBrowse={this.handleToBrowse}
                    />
                )
            case "bets":
                return (
                    <MyBetPanel
                        exoticsApi={this.props.exoticsApi}
                        faqs={faq.faqs}
                    />
                )
        }
    }

    render() {
        const tabContent = this.getTabContent()
        return (
            <div className="content">
                <AppTab
                    tabs={this.appTab}
                    selected={this.state.selectedTab}
                    clickHandler={this.handleTabClicked}
                    bets={this.state.bets}
                    match={this.state.match}
                />
                {tabContent}
            </div>
        )
    }
}