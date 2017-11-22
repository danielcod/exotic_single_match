import React from 'react'
import {bindAll} from 'lodash'
import AppTab from './AppTab'
import AccaProductPanel from '../../../templates/AccaProductPanel'
import AccaMatchProductPanel from '../../../templates/AccaMatchProductPanel'
import MyBetPanel from '../../../templates/MyBetPanel'
import * as faq from '../../../faq'
import classnames from 'classnames'

export default class AppStage extends React.PureComponent {
    appTab = [
        {name: "browse", label: "Browse"},
        {name: "build", label: "Build"},
        {name: "bet", label: "Betslip"},
        {name: "bets", label: "Bets"}
    ]

    constructor(props) {
        super(props)
        sessionStorage.setItem('UID', Math.round(Math.random() * 1e10))
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
                    <AccaProductPanel
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
            <div>
                <AppTab
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