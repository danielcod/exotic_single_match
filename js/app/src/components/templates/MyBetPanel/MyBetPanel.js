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
            clickedFaq: false,
            bets: []
        };
        bindAll(this, ['handleTabClicked', 'handleFaqClicked']);
    }

    componentDidMount() {
        this.props.exoticsApi.fetchBets('active', function (struct) {
                this.setState({bets: struct});
            }.bind(this)
        );
    }

    handleTabClicked(tab) {
        var status;
        if (tab.name === "open") {
            status = "active";
        } else if (tab.name === "settled") {
            status = "settled";
        }
        this.props.exoticsApi.fetchBets(status, function (struct) {
            this.setState({
                selectedTab: tab.name,
                clickedFaq: false,
                bets: struct
            });
        }.bind(this));
    }

    handleFaqClicked() {
        this.setState({clickedFaq: !this.state.clickedFaq});
    }

    render() {
        const {faqs, clickHandler} = this.props;
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
                <MyBetList
                    bets={this.state.bets}
                    selectedTab={this.state.selectedTab}
                    faqs={faqs}
                    clickedFaq={this.state.clickedFaq}
                />
            </div>
        )
    }
}