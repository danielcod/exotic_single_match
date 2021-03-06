import React from 'react'
import {bindAll} from 'lodash'
import AccaBetTab from './AccaBetTab'
import AccaBetList from './AccaBetList'
import MyPaginator from '../../molecules/MyPaginator'
import {matchSorter} from '../../utils'
import * as s from './index.css'

export default class AccaMatchBetPanel extends React.PureComponent {
    myBetTab = [
        {name: "open", label: "OPEN"},
        {name: "settled", label: "SETTLED"}
    ]

    constructor(props) {
        super(props)
        this.state = {
            selectedTab: "open",
            clickedFaq: false,
            allBets: [],
            bets: [],
            currentPage: 0
        }
        bindAll(this, ['handleTabClicked', 'handleFaqClicked', 'handlePaginatorClicked', 'applyPaginatorWindow'])
    }

    componentDidMount() {
        const struct = {
            "uid": sessionStorage.getItem('UID')
        }
        this.props.exoticsApi.fetchBets(struct, function (response) {
            let {allBets, bets} = this.state
            response.forEach(function (item) {
                //allBets.push(JSON.parse(item))
                allBets.push(item)
            })
            allBets.sort(matchSorter)
            bets = allBets.filter(function (bet) {
                return !bet.bet_settled
            })
            this.setState({allBets, bets})
        }.bind(this))
    }

    handleTabClicked(tab) {
        let {selectedTab, allBets, bets} = this.state
        selectedTab = tab.name
        if (selectedTab === "open") {
            bets = allBets.filter(function (bet) {
                return !bet.bet_settled
            })
        } else if (selectedTab === "settled") {
            bets = allBets.filter(function (bet) {
                return bet.bet_settled
            })
        }
        console.log(bets)
        this.setState({selectedTab, bets})
    }

    handleFaqClicked() {
        this.setState({clickedFaq: !this.state.clickedFaq})
    }

    handlePaginatorClicked(item) {
        this.setState({currentPage: item.value})
    }

    applyPaginatorWindow(items) {
        let rows = this.props.betsPaginator.rows
        let i = this.state.currentPage * rows
        let j = (this.state.currentPage + 1) * rows
        return items.slice(i, j)
    }

    render() {
        const {betsPaginator, faqs} = this.props
        const {allBets, bets, selectedTab, clickedFaq, currentPage} = this.state
        return (
            <div id="my-bets">
                {
                    allBets.length > 0 ?
                        <div className={s['wrap-mybettab']}>
                            <AccaBetTab
                                tabs={this.myBetTab}
                                selected={selectedTab}
                                clickHandler={this.handleTabClicked}
                            />
                        </div>
                        :
                        null
                }
                <button
                    className={clickedFaq ? "btn btn-primary faq-btn faq-btn-active" : "btn btn-primary faq-btn"}
                    onClick={() => this.handleFaqClicked()}>
                    FAQs
                </button>
                <AccaBetList
                    bets={this.applyPaginatorWindow(bets)}
                    selectedTab={selectedTab}
                    faqs={faqs}
                    clickedFaq={clickedFaq}
                />
                {
                    !clickedFaq && bets.length > betsPaginator.rows ?
                        <MyPaginator
                            clickHandler={this.handlePaginatorClicked}
                            currentPage={currentPage}
                            product={betsPaginator}
                            data={bets}
                        />
                        : null
                }
            </div>
        )
    }
}