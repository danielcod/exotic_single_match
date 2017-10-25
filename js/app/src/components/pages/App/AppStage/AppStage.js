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
        super(props);
        this.state = {
            selectedTab: "browse",
            match: {},
            matches: [],
            bets: []
        };
        bindAll(this, ['handleTabClicked', 'getTabContent', 'handleMatchChanged']);
    }

    componentWillMount() {
        this.props.exoticsApi.fetchMatches(function (struct) {
            let {matches, leagues} = this.state;
            const cutoff = new Date();

            matches = Object.values(struct).filter(function (match) {
                /*var bits = match.kickoff.split(/\D/);
                var date = new Date(bits[0], --bits[1], bits[2], bits[3], bits[4]);
                if (date > cutoff) {
                    return match;
                }*/
                return match
            }).sort(matchSorter);
            this.setState({
                matches: matches,
                match: matches[0]
            });

        }.bind(this));
    }

    handleMatchChanged(name, value) {
        const match = this.state.matches.filter(function (product) {
            return product.match_id == value;
        })[0];
        this.setState({match});
    }

    handleTabClicked(tab) {
        this.setState({selectedTab: tab.name});
        if ('bets' === tab.name || "browse" === tab.name) {
            this.setBets();
        }
    }

    handleToBrowse = (selectedTab) => {
        this.setState({selectedTab, currentStage: "edit"});
    }
    setMatch = (match) => {
        this.setState({match});
    }
    setBets = (bets = []) => {
        this.setState({bets});
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
                        matches={this.state.matches}
                        match={this.state.match}
                        handleMatchChanged={this.handleMatchChanged}
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
        const tabContent = this.getTabContent();
        return (
            <div>
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