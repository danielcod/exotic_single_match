import React from 'react';
import {bindAll} from 'lodash';
import AppStageSlider from './AppStageSlider';
import AppTab from './AppTab';
import AccaProductPanel from '../../../templates/AccaProductPanel';
import AccaMatchProductPanel from '../../../templates/AccaMatchProductPanel';
import MyBetPanel from '../../../templates/MyBetPanel';
import * as data from '../../../products';
import * as list from '../../../list';
import * as faq from '../../../faq';

export default class AppStage extends React.PureComponent {
    appStage = [
        {name: "browse", label: "Browse"},
        {name: "edit", label: "Edit"},
        {name: "bet", label: "Bet"}
    ];
    appTab = [
        /*{name: "match", label: "Match Exotics"},*/
        {name: "browse", label: "Browse"},
        { name: "build", label: "Build" },
        { name: "bet",  label: "Betslip" },         
        { name: "bets", label: "Bets" }
    ];

    constructor(props) {
        super(props);
        this.state = {
            currentStage: "browse",
            selectedTab: "browse",
            match: {},
            bets: []
        };
        bindAll(this, ['handleTabClicked', 'handleStageChanged', 'getTabContent']);
    }

    handleTabClicked(tab) {
        this.setState({selectedTab: tab.name});
        if ('bets' === tab.name){
            this.setBets();
        }
    }

    handleStageChanged(stage) {
        this.setState({
            currentStage: stage
        });
    }
    handleBuidMyOwn = ()=>{
        this.setState({selectedTab: 'build', currentStage: "edit"});
    }
    handleToBrowse = (selectedTab)=>{
        this.setState({selectedTab, currentStage: "edit"});
    }
    setMatch = (match)=>{
        this.setState({match});
    }
    setBets = (bets = [])=>{
        this.setState({bets});
    }
    getTabContent() {
        switch (this.state.selectedTab) {
            case "browse":
                return (
                    <button className="btn btn-primary" style={{float: 'right'}}
                        onClick={this.handleBuidMyOwn}
                        >Build My Own</button>
                );
            case "build":
            case "bet":
                return (                    
                    <AccaMatchProductPanel 
                        exoticsApi={this.props.exoticsApi}                                               
                        clickHandler={this.handleStageChanged}
                        selectedTab = {this.state.selectedTab}     
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
                    bets={this.state.bets}
                    match={this.state.match}
                />
                {tabContent}
            </div>
        )
    }
}