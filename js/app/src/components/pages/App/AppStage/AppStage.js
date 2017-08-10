import React from 'react';
import {bindAll} from 'lodash';
import AppStageSlider from './AppStageSlider';
import AppTab from './AppTab';
import AccaProductPanel from '../../../templates/AccaProductPanel';
import AccaMatchProductPanel from '../../../templates/AccaMatchProductPanel';
import * as data from '../../../products';

export default class AppStage extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            currentStage: "",
            selectedTab: ""
        }
        bindAll(this, ['handleTabClicked', 'handleStageChanged']);
    }

    componentWillMount() {
        this.setState({
            selectedTab: "match",
            currentStage: "Browse"
        })
    }

    handleTabClicked(tab) {
        this.setState({selectedTab: tab.name});
    }

    handleStageChanged(stage) {
        this.setState({currentStage: stage});
    }
    render() {       
        return (
            <div>
                <AppStageSlider
                    tickLabels={['Browse', 'Edit', 'Bet']}
                    currentStage={this.state.currentStage}
                />
                {
                    (this.state.currentStage == "Browse") &&
                        <div>
                            <AppTab
                                tabs={[
                                    {
                                        name: "match",
                                        label: "Match Exotics"
                                    },
                                    {
                                        name: "exotic",
                                        label: "Exotic Accas"
                                    },
                                    {
                                        name: "bets",
                                        label: "Your Bets"
                                    }
                                ]}
                                selected={this.state.selectedTab}
                                clickHandler={this.handleTabClicked}
                            />
                            {
                                (this.state.selectedTab == "exotic" || this.state.selectedTab == "match") &&
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => this.handleStageChanged("Edit")}
                                        style= {{float: "right"}}>Build My Own
                                    </button>
                            }                            
                        </div>
                }
                {
                    (this.state.selectedTab == "exotic") &&
                        <div>
                            {
                                (this.state.currentStage == "Edit" || this.state.currentStage == "Bet") &&
                                    <AccaProductPanel
                                        exoticsApi={this.props.exoticsApi}
                                        products={data.products}
                                        legsPaginator={{rows: 8}}
                                        betLegsPaginator={{rows: 8}}
                                        clickHandler={this.handleStageChanged}
                                    />
                            }
                        </div>
                }
                 {
                    (this.state.selectedTab == "match") &&
                        <div>
                            {
                                (this.state.currentStage == "Edit" || this.state.currentStage == "Bet") &&
                                    <AccaMatchProductPanel
                                        exoticsApi={this.props.exoticsApi}                                              
                                        clickHandler={this.handleStageChanged}    
                                    />
                            }
                        </div>
                }
                
            </div>
        )
    }
}