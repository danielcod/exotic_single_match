import React from 'react';
import {bindAll, isEmpty, isEqual} from 'lodash';
import MySelect from '../../atoms/MySelect';
import MyFormComponent from '../../atoms/MyFormComponent';
import AccaMatchPanelTabs from '../../organisms/AccaMatchPanelTabs';
import MatchResult from '../../organisms/MatchResult';
import CornersPanel from '../../organisms/CornersPanel';
import TeamCardsPanel from '../../organisms/TeamCardsPanel';
import GoalScorersPanel from '../../organisms/GoalScorersPanel';
import PlayerCardsPanel from '../../organisms/PlayerCardsPanel';
import StakePanel from '../../organisms/StakePanel';
import BTTSPanel from '../../organisms/BTTSPanel';
import MatchBetsPanel from '../../organisms/MatchBetsPanel';
import {matchSorter} from '../../utils';
import {Accordion, AccordionItem} from 'react-sanfona';
import * as data from '../../products';
import * as constant from '../../constant';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import classnames from 'classnames';
import FaAngleDoubleDown from 'react-icons/lib/fa/angle-double-down';
import FaAngleDoubleUp from 'react-icons/lib/fa/angle-double-up';
import s from './index.css';
import * as str from '../../struct';

const PLAYER_CARDS = constant.PLAYER_CARDS_;
const GOAL_SCORERS = constant.GOAL_SCORERS;
const BTTS = constant.GOALS;

export default class AccaMatchProductPanel extends React.PureComponent {
    constructor(props) {
        super(props)
        const previousState = JSON.parse(localStorage.getItem("AccaMatchProduct"));
        if (previousState) {
            this.state = {
                selectedTab: previousState.selectedTab,
                match: previousState.match,
                matches: previousState.matches,
                legs: previousState.legs,
                bets: previousState.bets,
                sanfonaActiveItems: previousState.sanfonaActiveItems,
                openedStakePanel: previousState.openedStakePanel,
                showBets: previousState.showBets,
                stake: previousState.stake,
                price: previousState.price,
                textBetsInStake: previousState.textBetsInStake
            }
            localStorage.removeItem("AccaMatchProduct");
        } else {
            this.state = {
                selectedTab: "build",
                match: {},
                matches: [],
                legs: [],
                bets: [],
                sanfonaActiveItems: [],
                openedStakePanel: false,
                showBets: [],
                stake: null,
                price: 10,
                textBetsInStake: null

            }
        }
        bindAll(this, ['handleMatchChanged', 'delBetfromBetsList', 'changeBlock', 'betResultMatch',
            'delTeamBetfromBetsList', 'handleBetRemoved', 'delPlayerFromBetList',
            'clearBets', 'delFromBTTS']);
    }

    componentDidMount() {
        if (isEmpty(this.state.match) || isEmpty(this.state.matches)) {
            this.props.exoticsApi.fetchMatches(function (struct) {
                let {matches, leagues} = this.state
                const cutoff = new Date()
                matches = Object.values(struct).filter(function (match) {
                    /*var bits = match.kickoff.split(/\D/);
                    var date = new Date(bits[0], --bits[1], bits[2], bits[3], bits[4]);
                    if (date > cutoff) {
                        return match;
                    }*/
                    return match
                }).sort(matchSorter)
                this.setState({
                    matches: matches,
                    match: matches[0]
                })
                this.props.setMatch(matches[0])
            }.bind(this))
        }
    }

    componentWillReceiveProps(props) {
        //if (props.selectedTab === 'bet') {
        //    this.setState({sanfonaActiveItems: []});
        //}
    }

    componentWillUnmount() {
        localStorage.setItem('AccaMatchProduct', JSON.stringify(this.state))
    }

    handleMatchChanged(name, value) {
        const match = this.state.matches.filter(function (product) {
            return product.match_id == value;
        })[0]
        const bets = []
        this.setState({match, bets})
        this.props.setMatch(match)
        this.props.setBets(bets)
    }

    handleBetRemoved(bet) {
        if (BTTS === bet.name) {
            this.delFromBTTS(bet);
        } else if (PLAYER_CARDS === bet.name || GOAL_SCORERS === bet.name) {
            this.delPlayerFromBetList(bet);
        } else {
            this.delBetfromBetsList(bet);
        }

    }

    betResultMatch(nBet) {
        let {bets} = this.state;
        let changed = false;
        bets = bets.map(bet => {
            if (bet.name === nBet.name && bet.match.fixture === nBet.match.fixture) {
                bet.options = nBet.options;
                changed = true;
            }
            return bet;
        });
        if (changed === false) bets.push(nBet);
        this.setState({bets});
        this.setState({openedStakePanel: false})
        this.props.setBets(bets);
        //setTimeout(() => console.log(this.state.bets), 0)
    }

    delBetfromBetsList(oldBet) {
        let {bets} = this.state;
        bets = bets.filter(bet => {
            return (!Object.is(bet.name, oldBet.name) || !Object.is(bet.match.name, oldBet.match.name));
        });
        this.setState({bets});
        this.props.setBets(bets);
    }

    delTeamBetfromBetsList(productsName, matchName) {
        let {bets} = this.state;
        bets = bets.filter((bet) => {
            if (bet.name === productsName && bet.match.fixture !== matchName ||
                bet.name !== productsName)
                return bet;
        });
        this.setState({bets});
        this.props.setBets(bets);
    }

    delPlayerFromBetList(oldBet) {
        let {bets} = this.state;
        bets = bets.map((bet) => {
            if (bet.name === oldBet.name && bet.match.name === oldBet.match.name) {
                const selectedItem = bet.options.selectedItem.filter(value => {
                    if (oldBet.selectedItem.selectedTeam != value.selectedTeam ||
                        oldBet.selectedItem.selectedTeam === value.selectedTeam &&
                        oldBet.selectedItem.page != value.page ||
                        oldBet.selectedItem.selectedTeam === value.selectedTeam &&
                        oldBet.selectedItem.page === value.page &&
                        !isEqual(oldBet.selectedItem.item, value.item))
                        return value;
                });
                bet.options.selectedItem = selectedItem;
                return bet;
            }
            return bet;
        });
        this.setState({bets});
        this.props.setBets(bets);
    }

    delFromBTTS(oldBet) {
        let {bets} = this.state;
        bets = bets.filter((bet) => {
            if (bet.name === oldBet.name && bet.match.name === oldBet.match.name) {
                if (oldBet.options.changedTab) {
                    bet.options.changedTab = !oldBet.options.changedTab;
                    bet.options.textTotalGoals = '';
                    bet.options.sliderValue = 3;
                    bet.options.selectedTab = {
                        name: "",
                        number: null
                    }
                }
                if (oldBet.options.changedTable) {
                    bet.options.changedTable = !oldBet.options.changedTable;
                    bet.options.selectedItem = [];
                    bet.options.textBTTS = '';
                }
                return bet;
            }
            return bet;
        });
        this.setState({bets});
        this.props.setBets(bets);
    }

    changeBlock(value) {
        const sanfonaActiveItems = value.activeItems;
        this.setState({sanfonaActiveItems});
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
            this.props.handleToBrowse('browse')
        }.bind(this), 200)
    }

    openStakePanel = (showBets, stake, price, textBetsInStake) => {
        this.setState({openedStakePanel: true, showBets, stake, /* price, */ textBetsInStake});
    }

    returnToBetsPanel = () => {
        this.setState({openedStakePanel: false, buildMyOwn: true});
        this.props.handleToBrowse('build');
    }

    render() {
        const {matches, match, legs, sanfonaActiveItems, bets} = this.state;
        const {openedStakePanel, showBets, stake, price, textBetsInStake} = this.state;
        const {selectedTab} = this.props;
        const renderAngle = (index, title) => {
            let opened = false;
            for (let i = 0; i < sanfonaActiveItems.length; i++) {
                if (sanfonaActiveItems[i] === index) {
                    opened = true;
                }
            }
            const darkOrLight = opened ? '-dark.png' : '-light.png'
            const imgSrc = 'img/' + title + darkOrLight;
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
            );
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
                                />
                            :
                            <div>
                                <MyFormComponent
                                    label="Choose your Match Exotics"
                                    component={<MySelect
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
                                    }
                                />
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
                                                        delBetfromBetsList={this.delBetfromBetsList}
                                                    /> : null}
                                                {index === 1 ?
                                                    <BTTSPanel
                                                        match={match}
                                                        betResultMatch={this.betResultMatch}
                                                        bets={this.state.bets}
                                                        delBetfromBetsList={this.delBetfromBetsList}
                                                    /> : null}
                                                {index === 2 ?
                                                    <GoalScorersPanel
                                                        matches={matches}
                                                        match={match}
                                                        betResultMatch={this.betResultMatch}
                                                        bets={this.state.bets}
                                                        delBetfromBetsList={this.delTeamBetfromBetsList}
                                                    /> : null}
                                                {index === 3 ?
                                                    <CornersPanel
                                                        matches={matches}
                                                        match={match}
                                                        betResultMatch={this.betResultMatch}
                                                        bets={this.state.bets}
                                                        delBetfromBetsList={this.delBetfromBetsList}
                                                    />
                                                    : null}
                                                {index === 4 ?
                                                    <TeamCardsPanel
                                                        matches={matches}
                                                        match={match}
                                                        betResultMatch={this.betResultMatch}
                                                        bets={this.state.bets}
                                                        delBetfromBetsList={this.delBetfromBetsList}
                                                    />
                                                    : null}
                                                {index === 5 ?
                                                    <PlayerCardsPanel
                                                        matches={matches}
                                                        match={match}
                                                        betResultMatch={this.betResultMatch}
                                                        bets={this.state.bets}
                                                        delBetfromBetsList={this.delTeamBetfromBetsList}
                                                    />
                                                    : null}
                                            </AccordionItem>
                                        );
                                    })}
                                </Accordion>
                            </div>
                        : null
                }
            </div>
        )
    }
}