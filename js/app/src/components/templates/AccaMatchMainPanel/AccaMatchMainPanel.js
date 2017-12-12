import React from 'react'
import {bindAll} from 'lodash'
import AccaMatchTab from './AccaMatchTab'
import AccaMatchCuratePanel from '../../templates/AccaMatchCuratePanel'
import AccaMatchProductPanel from '../../templates/AccaMatchProductPanel'
import AccaMatchBetPanel from '../../templates/AccaMatchBetPanel'
import * as faq from '../../faq'

export default class AccaMatchMainPanel extends React.PureComponent {
    appTab = [
        {name: "browse", label: "Browse"},
        {name: "build", label: "Build"},
        {name: "bet", label: "Betslip"},
        {name: "bets", label: "Bets"}
    ]

    constructor(props) {
        super(props)
        /*sessionStorage.setItem('UID', Math.round(Math.random() * 1e10))*/
        sessionStorage.setItem('UID', 222)
        this.state = {
            selectedTab: "browse",
            match: {},
            bets: [],
            curate: {},
        }
        bindAll(this, ['handleTabClicked', 'buildYourOwnExotic', 'setMatch', 'setBets', 'setCurate', 'setEmptyCurate', 'getTabContent'])
    }

    handleTabClicked(tab) {
        this.setState({selectedTab: tab.name})
    }

    buildYourOwnExotic() {
        this.setState({selectedTab: "build", curate: {}})
    }

    setMatch(match) {
        this.setState({match})
    }

    setBets(bets = []) {
        this.setState({bets})
    }

    setCurate(curate) {
        const selectedTab = "build"
        this.setState({curate, selectedTab})
    }

    setEmptyCurate() {
        const curate = {}
        const selectedTab = "bet"
        this.setState({curate, selectedTab})
    }

    getTabContent() {
        switch (this.state.selectedTab) {
            case "browse":
                return (
                    <AccaMatchCuratePanel
                        exoticsApi={this.props.exoticsApi}
                        setCurate={this.setCurate}
                        legsPaginator={{rows: 6}}
                        buildYourOwnExotic={this.buildYourOwnExotic}
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
                        setEmptyCurate={this.setEmptyCurate}
                        curate={this.state.curate}
                        handleToBrowse={this.handleTabClicked}
                    />
                )
            case "bets":
                return (
                    <AccaMatchBetPanel
                        exoticsApi={this.props.exoticsApi}
                        betsPaginator={{rows: 11}}
                        faqs={faq.faqs}
                    />
                )
        }
    }

    render() {
        const tabContent = this.getTabContent()
        return (
            <div>
                <AccaMatchTab
                    tabs={this.appTab}
                    selected={this.state.selectedTab}
                    clickHandler={this.handleTabClicked}
                    bets={this.state.bets}
                    match={this.state.match}
                />
                <div className="content">
                    {tabContent}
                </div>
            </div>
        )
    }
}