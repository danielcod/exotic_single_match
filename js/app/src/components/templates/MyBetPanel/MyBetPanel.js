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
            selectedTab: "open",
            clickedFaq: false
        };
        bindAll(this, ['handleTabClicked', 'getTabContent', 'getBetsFromTab', 'handleFaqClicked']);
    }

    handleTabClicked(tab) {
        this.setState({selectedTab: tab.name, clickedFaq: false});
    }

    handleFaqClicked() {
        this.setState({clickedFaq: !this.state.clickedFaq});
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

    getTabContent(mybets, faqs) {
        const bets = this.getBetsFromTab(mybets);
        return (
            <MyBetList
                bets={bets}
                selectedTab={this.state.selectedTab}
                faqs={faqs}
                clickedFaq={this.state.clickedFaq}
            />
        );
    }

    render() {
        const {mybets, faqs, clickHandler} = this.props;
        const tabContent = this.getTabContent(mybets, faqs);
        return (
            <div>
                <MyBetTab
                    tabs={this.myBetTab}
                    selected={this.state.selectedTab}
                    clickHandler={this.handleTabClicked}
                />
                <button
                    className={this.state.clickedFaq ? "btn btn-primary faq-btn faq-btn-active" : "btn btn-primary faq-btn"}
                    onClick={() => this.handleFaqClicked()}>
                    FAQs
                </button>
                {tabContent}
            </div>
        )
    }
}