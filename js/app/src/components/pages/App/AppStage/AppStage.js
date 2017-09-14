import React from 'react';
import {bindAll} from 'lodash';
import AppStageSlider from './AppStageSlider';
import AppTab from './AppTab';
import AccaProductPanel from '../../../templates/AccaProductPanel';
import AccaMatchProductPanel from '../../../templates/AccaMatchProductPanel';
import MyBetPanel from '../../../templates/MyBetPanel';
import {matchSorter} from '../../../utils';
import * as data from '../../../products';
import * as list from '../../../list';
import * as faq from '../../../faq';
import classnames from 'classnames';
import * as s from './index.css';

export default class AppStage extends React.PureComponent {
    appStage = [
        {name: "browse", label: "Browse"},
        {name: "edit", label: "Edit"},
        {name: "bet", label: "Bet"}
    ];
    appTab = [
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
            matches: [],
            bets: []
        };
        bindAll(this, ['handleTabClicked', 'handleStageChanged', 'getTabContent', 'handleMatchChanged']);
    }
    componentWillMount(){   
        this.props.exoticsApi.fetchMatches(function(struct) {
            let {matches, leagues} = this.state;
            const cutoff=new Date();
            
            matches=struct.filter(function(match) {
                var bits = match.kickoff.split(/\D/);
                var date = new Date(bits[0], --bits[1], bits[2], bits[3], bits[4]);            
                if ( date > cutoff){                      
                     return match;
                }               
            }).sort(matchSorter);
            
            this.setState({
                matches: matches,
                match: matches[0]
            });
            
        }.bind(this));
    }
    handleMatchChanged(name, value) {  
        const match = this.state.matches.filter(function(product) {
            return product.name==value;
        })[0];           
        this.setState({match});           
    }
    handleTabClicked(tab) {
        this.setState({selectedTab: tab.name});
        if ('bets' === tab.name || "browse" === tab.name  ){
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
                    <button className={classnames("btn", "btn-primary", s['btn-build'])}
                        onClick={this.handleBuidMyOwn}
                        >BUILD YOUR OWN EXOTIC</button>
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