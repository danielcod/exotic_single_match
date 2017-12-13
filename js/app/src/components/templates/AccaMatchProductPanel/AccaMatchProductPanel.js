import React from 'react'
import {bindAll, isEmpty, isEqual} from 'lodash'
import MySelect from '../../atoms/MySelect'
import MyFormComponent from '../../atoms/MyFormComponent'
import MatchResult from '../../organisms/MatchResult'
import CornersPanel from '../../organisms/CornersPanel'
import TeamCardsPanel from '../../organisms/TeamCardsPanel'
import GoalScorersPanel from '../../organisms/GoalScorersPanel'
import PlayerCardsPanel from '../../organisms/PlayerCardsPanel'
import StakePanel from '../../organisms/StakePanel'
import BTTSPanel from '../../organisms/BTTSPanel'
import MatchBetsPanel from '../../organisms/MatchBetsPanel'
import {matchSorterByName} from '../../utils'
import {Accordion, AccordionItem} from 'react-sanfona'
import * as data from '../../products'
import * as constant from '../../constant'
import s from './index.css'

const PLAYER_CARDS = constant.PLAYER_CARDS_
const GOAL_SCORERS = constant.GOAL_SCORERS
const BTTS = constant.GOALS
const LEAGUES = constant.LEAGUES

export default class AccaMatchProductPanel extends React.PureComponent {
    constructor(props) {
        super(props)
        const previousState = JSON.parse(localStorage.getItem("AccaMatchProduct"))
        if (previousState) {
            let bets = previousState.bets
            let match = previousState.match
            let curate = {}
            if (!isEmpty(this.props.curate)) {
                bets = []
                match = {}
                curate = this.props.curate
            }
            this.state = {
                selectedTab: previousState.selectedTab,
                match: match,
                matches: previousState.matches,
                curate: curate,
                league: previousState.league,
                legs: previousState.legs,
                bets: bets,
                sanfonaActiveItems: previousState.sanfonaActiveItems,
                openedStakePanel: previousState.openedStakePanel,
                showBets: previousState.showBets,
                stake: previousState.stake,
                price: previousState.price,
                textBetsInStake: previousState.textBetsInStake,
                countBetsInStake: previousState.countBetsInStake
            }
            localStorage.removeItem("AccaMatchProduct")
        } else {
            this.state = {
                selectedTab: "build",
                match: {},
                matches: [],
                curate: {},
                league: null,
                legs: [],
                bets: [],
                sanfonaActiveItems: [],
                openedStakePanel: false,
                showBets: [],
                stake: null,
                price: null,
                textBetsInStake: null,
                countBetsInStake: 0
            }
        }
        bindAll(this, ['handleLeagueChanged', 'handleMatchChanged', 'delBetfromBetsList', 'changeBlock',
            'betResultMatch', 'delTeamBetfromBetsList', 'handleBetRemoved', 'delPlayerFromBetList',
            'clearBets', 'delFromBTTS', 'setEmptyCurate', 'setCountBetsInStake'])
    }

    componentDidMount() {
        let {matches, match, countBetsInStake, league} = this.state
        let {curate} = this.props
        if (isEmpty(match) || isEmpty(matches) || !isEmpty(curate)) {
            let initialLeague = LEAGUES[0]
            if (!isEmpty(curate)) {
                initialLeague = curate.league
            }
            this.props.exoticsApi.fetchMatches([initialLeague], function (struct) {
                matches = Object.values(struct).filter(function (item) {
                    return item
                }).sort(matchSorterByName)
                if (!isEmpty(curate)) {
                    match = matches.filter(function (item) {
                        return parseInt(curate.iD) === item.match_id
                    })[0]
                    countBetsInStake = parseInt(curate.price_to_show + 1)
                } else {
                    match = matches[0]
                }
                league = initialLeague
                this.setState({matches, match, curate, countBetsInStake, league})
                this.props.setMatch(match)
                if (!isEmpty(curate)) {
                    setTimeout(() => this.setEmptyCurate(), 700)
                }
            }.bind(this))
        }
    }

    componentWillUnmount() {
        localStorage.setItem('AccaMatchProduct', JSON.stringify(this.state))
    }

    setEmptyCurate() {
        const curate = {}
        this.setState({curate})
        this.props.setEmptyCurate()
    }

    setCountBetsInStake(countBets) {
        this.setState({countBetsInStake: countBets})
    }

    handleLeagueChanged(name, value) {
        const league = value, bets = [], matches = []
        this.setState({league, bets, matches})
        setTimeout(this.props.exoticsApi.fetchMatches([league], function (struct) {
            let matches, match
            matches = Object.values(struct).filter(function (item) {
                return item
            }).sort(matchSorterByName)
            match = matches[0]
            this.setState({matches, match})
            this.props.setMatch(match)
            this.props.setBets(bets)
        }.bind(this)), 100)
    }

    handleMatchChanged(name, value) {
        const match = this.state.matches.filter(function (product) {
            return product.match_id.toString() === value
        })[0]
        const bets = []
        this.setState({match, bets})
        this.props.setMatch(match)
        this.props.setBets(bets)
    }

    handleBetRemoved(bet) {
        if (BTTS === bet.name) {
            this.delFromBTTS(bet)
        } else if (PLAYER_CARDS === bet.name || GOAL_SCORERS === bet.name) {
            this.delPlayerFromBetList(bet)
        } else {
            this.delBetfromBetsList(bet)
        }
    }

    betResultMatch(nBet) {
        let {bets} = this.state
        let changed = false
        bets = bets.map(bet => {
            if (bet.name === nBet.name && bet.match.fixture === nBet.match.fixture) {
                bet.options = nBet.options
                changed = true
            }
            return bet
        })
        if (changed === false) bets.push(nBet)
        this.setState({bets})
        this.setState({openedStakePanel: false})
        this.props.setBets(bets)
    }

    delBetfromBetsList(oldBet) {
        let {bets} = this.state
        bets = bets.filter(bet => {
            return (!Object.is(bet.name, oldBet.name) || !Object.is(bet.match.fixture, oldBet.match.fixture))
        })
        this.setState({bets})
        this.props.setBets(bets)
    }

    delTeamBetfromBetsList(productsName, matchName) {
        let {bets} = this.state
        bets = bets.filter((bet) => {
            if (bet.name === productsName && bet.match.fixture !== matchName ||
                bet.name !== productsName)
                return bet
        })
        this.setState({bets})
        this.props.setBets(bets)
    }

    delPlayerFromBetList(oldBet) {
        let {bets} = this.state
        bets = bets.map((bet) => {
            if (bet.name === oldBet.name && bet.match.name === oldBet.match.name) {
                const selectedItem = bet.options.selectedItem.filter(value => {
                    if (oldBet.selectedItem.selectedTeam !== value.selectedTeam ||
                        oldBet.selectedItem.selectedTeam === value.selectedTeam &&
                        oldBet.selectedItem.page !== value.page ||
                        oldBet.selectedItem.selectedTeam === value.selectedTeam &&
                        oldBet.selectedItem.page === value.page &&
                        !isEqual(oldBet.selectedItem.item, value.item))
                        return value
                })
                bet.options.selectedItem = selectedItem
                return bet
            }
            return bet
        })
        this.setState({bets})
        this.props.setBets(bets)
    }

    delFromBTTS(oldBet) {
        let {bets} = this.state
        bets = bets.filter((bet) => {
            if (bet.name === oldBet.name && bet.match.fixture === oldBet.match.fixture) {
                if (oldBet.options.changedTab) {
                    bet.options.changedTab = !oldBet.options.changedTab
                    bet.options.textTotalGoals = ''
                    bet.options.sliderValue = 3
                    bet.options.selectedTab = {
                        name: "",
                        number: null
                    }
                }
                if (oldBet.options.changedTable) {
                    bet.options.changedTable = !oldBet.options.changedTable
                    bet.options.selectedItem = []
                    bet.options.textBTTS = ''
                }
                return bet
            }
            return bet
        })
        this.setState({bets})
        this.props.setBets(bets)
    }

    changeBlock(value) {
        const sanfonaActiveItems = value.activeItems
        this.setState({sanfonaActiveItems})
    }

    clearBets() {
        this.setState({
            bets: [],
            selectedTab: "build",
            sanfonaActiveItems: [],
            openedStakePanel: false
        })
        this.props.setBets()
        setTimeout(function () {
            this.props.handleToBrowse({name: "browse"})
        }.bind(this), 100)
    }

    openStakePanel = (showBets, stake, price, textBetsInStake) => {
        this.setState({openedStakePanel: true, showBets, stake, price, textBetsInStake})
    }

    returnToBetsPanel = () => {
        this.setState({openedStakePanel: false, buildMyOwn: true})
        this.props.handleToBrowse({name: "build", label: "Build"})
    }

    render() {
        const {matches, match, legs, sanfonaActiveItems, bets, curate, countBetsInStake, league} = this.state
        const {openedStakePanel, showBets, stake, price, textBetsInStake} = this.state
        const {selectedTab} = this.props
        const renderAngle = (index, title) => {
            let opened = false
            for (let i = 0; i < sanfonaActiveItems.length; i++) {
                if (sanfonaActiveItems[i] === index) {
                    opened = true
                }
            }
            const darkOrLight = opened ? '-dark.png' : '-light.png'
            return ((opened) ?
                    <div className="react-sanfona-item-wrap">
                        <div className={s['title-img']}>
                            <img style={{display: 'block'}} src={'/img/' + title + '-dark.png'}/>
                            <img style={{display: 'none'}} src={'/img/' + title + '-light.png'}/>
                        </div>
                        <div className="react-sanfona-item-title" style={{cursor: 'pointer', margin: '0px'}}>
                            <div className={s["wrap-item-title"]}>
                                <div className={s['sanfona-title']}>{title}</div>
                                <div className={s['b-angle']}>
                                    <span className="glyphicon glyphicon-triangle-top glyph-background">
                                        <span className="inner"></span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    :
                    <div className="react-sanfona-item-wrap">
                        <div className={s['title-img']}>
                            <img style={{display: 'none'}} src={'/img/' + title + '-dark.png'}/>
                            <img style={{display: 'block'}} src={"/img/" + title + "-light.png"}/>
                        </div>
                        <div className="react-sanfona-item-title" style={{cursor: 'pointer', margin: '0px'}}>
                            <div className={s["wrap-item-title"]}>
                                <div className={s['sanfona-title']}>{title}</div>
                                <div className={s['b-angle']}>
                                    <span className="glyphicon glyphicon-triangle-bottom glyph-background">
                                        <span className="inner"></span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
            )
        }
        return (
            <div>
                {
                    !isEmpty(match) ?
                        selectedTab === "bet" ?
                            openedStakePanel ?
                                <StakePanel
                                    showBets={showBets}
                                    stake={stake}
                                    price={price}
                                    textBetsInStake={textBetsInStake}
                                    toMainMenu={this.clearBets}
                                    returnToBetsPanel={this.returnToBetsPanel}
                                    match={match}
                                />
                                :
                                <MatchBetsPanel
                                    exoticsApi={this.props.exoticsApi}
                                    handleBetRemoved={this.handleBetRemoved}
                                    bets={bets}
                                    match={match}
                                    clearBets={this.clearBets}
                                    openStakePanel={this.openStakePanel}
                                    returnToBetsPanel={this.returnToBetsPanel}
                                    countBetsInStake={countBetsInStake}
                                    setCountBetsInStake={this.setCountBetsInStake}
                                />
                            :
                            <div>
                                <label className="text-center" style={{width: "100%"}}>Choose your Match</label>
                                <div id="league-select">
                                    <MySelect
                                        className="form-control btn-primary input-lg"
                                        options={LEAGUES.map(function (league) {
                                            return {
                                                value: league
                                            }
                                        })
                                        }
                                        name="league"
                                        changeHandler={this.handleLeagueChanged}
                                        league={league}
                                    />
                                </div>
                                <div id="fixture-select">
                                    <MySelect
                                        className="form-control btn-primary input-lg"
                                        options={matches.map(function (product) {
                                            return {
                                                label: product.fixture,
                                                value: product.match_id
                                            }
                                        })
                                        }
                                        name="match"
                                        changeHandler={this.handleMatchChanged}
                                        match={match}
                                    />
                                </div>
                                {
                                    matches.length > 0 ?
                                        <Accordion onChange={this.changeBlock} activeItems={sanfonaActiveItems}>
                                            {data.matchComponents.map((item, index) => {
                                                return (
                                                    <AccordionItem
                                                        title={renderAngle(index, item)} key={item}
                                                    >
                                                        {index === 0 ?
                                                            <MatchResult
                                                                match={match}
                                                                legs={legs}
                                                                betResultMatch={this.betResultMatch}
                                                                bets={this.state.bets}
                                                                curate={curate}
                                                                delBetfromBetsList={this.delBetfromBetsList}
                                                            /> : null}
                                                        {index === 1 ?
                                                            <BTTSPanel
                                                                match={match}
                                                                betResultMatch={this.betResultMatch}
                                                                bets={this.state.bets}
                                                                curate={curate}
                                                                delBetfromBetsList={this.delBetfromBetsList}
                                                            /> : null}
                                                        {index === 2 ?
                                                            <GoalScorersPanel
                                                                matches={matches}
                                                                match={match}
                                                                betResultMatch={this.betResultMatch}
                                                                bets={this.state.bets}
                                                                curate={curate}
                                                                delBetfromBetsList={this.delTeamBetfromBetsList}
                                                            /> : null}
                                                        {index === 3 ?
                                                            <CornersPanel
                                                                matches={matches}
                                                                match={match}
                                                                betResultMatch={this.betResultMatch}
                                                                bets={this.state.bets}
                                                                curate={curate}
                                                                delBetfromBetsList={this.delBetfromBetsList}
                                                            />
                                                            : null}
                                                        {index === 4 ?
                                                            <TeamCardsPanel
                                                                matches={matches}
                                                                match={match}
                                                                betResultMatch={this.betResultMatch}
                                                                bets={this.state.bets}
                                                                curate={curate}
                                                                delBetfromBetsList={this.delBetfromBetsList}
                                                            />
                                                            : null}
                                                        {index === 5 ?
                                                            <PlayerCardsPanel
                                                                matches={matches}
                                                                match={match}
                                                                betResultMatch={this.betResultMatch}
                                                                bets={this.state.bets}
                                                                curate={curate}
                                                                delBetfromBetsList={this.delTeamBetfromBetsList}
                                                            />
                                                            : null}
                                                    </AccordionItem>
                                                )
                                            })}
                                        </Accordion>
                                        :
                                        null
                                }
                            </div>
                        : null
                }
            </div>
        )
    }
}