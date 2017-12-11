import React from 'react'
import {bindAll, isEmpty, findIndex, isEqual} from 'lodash'
import GoalScorersTable from '../GoalScorersTable'
import MyPaginator from '../../molecules/MyPaginator'
import MyBetTab from '../../templates/MyBetPanel/MyBetTab'
import * as constant from '../../constant'
import s from './index.css'
import classNames from 'classnames'

const productsName = constant.GOAL_SCORERS

export default class GoalScorersPanel extends React.PureComponent {
    constructor(props) {
        super(props);
        bindAll(this, ['getCurrentBet', 'initState', 'clickTable', 'applyPaginatorWindow',
            'handlePaginatorClicked', 'handleTabClicked', 'getCurrentListPlayer',
            'formatText', 'isCurrentItemClicked', 'handleCancel', 'setBetResultMatch'])
        let bet = this.getCurrentBet(this.props)
        if (isEmpty(bet)) bet = this.initState()
        let firstComand, secondComand
        if (this.props.match) {
            [firstComand, secondComand] = this.props.match.fixture.split(' vs ')
        }
        this.state = {
            price: bet.options.price,
            currentPage: bet.options.currentPage,
            selectedItem: bet.options.selectedItem,
            selectedTeam: bet.options.selectedTeam,
            textValue: bet.options.textValue,
            myBetTab: [
                {name: constant.HOME, label: firstComand},
                {name: constant.AWAY, label: secondComand}
            ],
            triggerState: false,
            changes: bet.options.changes
        }
    }

    componentWillReceiveProps(props) {
        let bet = this.getCurrentBet(props)
        if (isEmpty(bet)) bet = this.initState()
        let firstComand, secondComand
        if (props.match) {
            [firstComand, secondComand] = props.match.fixture.split(' vs ')
        }
        const myBetTab = [
            {name: constant.HOME, label: firstComand},
            {name: constant.AWAY, label: secondComand}
        ]
        const {selectedTeam, currentPage, selectedItem, price, textValue, changes} = bet.options
        this.setState({myBetTab, selectedTeam, currentPage, selectedItem, price, textValue, changes})
    }

    componentDidMount() {
        const {curate} = this.props
        if (!isEmpty(curate)) {
            setTimeout(() => this.setBetResultMatch(curate.selection), 300)
        }
    }

    setBetResultMatch(selection) {
        const {match} = this.props
        let {currentPage, selectedTeam} = this.state
        let matches, matches_home = [], matches_away = []
        matches = Object.keys(match.home_ags_p_ft)
        let sortFnHome = function (i0, i1) {
            if (match.home_ags_p_ft[i0]['price'] < match.home_ags_p_ft[i1]['price']) {
                return -1
            } else if (match.home_ags_p_ft[i0]['price'] > match.home_ags_p_ft[i1]['price']) {
                return 1
            }
        }
        matches.sort(sortFnHome)
        matches.forEach(function (team, id) {
            matches_home.push(
                {
                    playerId: team,
                    name: match.home_ags_p_ft[team]['name'],
                    id: id,
                    key: constant.SELCTED_TWO,
                    price: match.home_ags_p_ft[team]['price'],
                    selection: "home_ags_p_ft"
                }
            )
            matches_home.push(
                {
                    playerId: team,
                    name: match.match_home_p_fgs_ft[team]['name'],
                    id: id,
                    key: constant.SELCTED_THREE,
                    price: match.match_home_p_fgs_ft[team]['price'],
                    selection: "match_home_p_fgs_ft"
                }
            )
            matches_home.push(
                {
                    playerId: team,
                    name: match.home_fgs_p_ft[team]['name'],
                    id: id,
                    key: constant.SELCTED_FOUR,
                    price: match.home_fgs_p_ft[team]['price'],
                    selection: "home_fgs_p_ft"
                }
            )
            matches_home.push(
                {
                    playerId: team,
                    name: match.home_threegs_p_ft[team]['name'],
                    id: id,
                    key: constant.SELCTED_FIVE,
                    price: match.home_threegs_p_ft[team]['price'],
                    selection: "home_threegs_p_ft"
                }
            )
        })
        matches = Object.keys(match.away_ags_p_ft)
        let sortFnAway = function (i0, i1) {
            if (match.away_ags_p_ft[i0]['price'] < match.away_ags_p_ft[i1]['price']) {
                return -1
            } else if (match.away_ags_p_ft[i0]['price'] > match.away_ags_p_ft[i1]['price']) {
                return 1
            }
        }
        matches.sort(sortFnAway)
        matches.forEach(function (team, id) {
            matches_away.push(
                {
                    playerId: team,
                    name: match.away_ags_p_ft[team]['name'],
                    id: id,
                    key: constant.SELCTED_TWO,
                    price: match.away_ags_p_ft[team]['price'],
                    selection: "away_ags_p_ft"
                }
            )
            matches_away.push(
                {
                    playerId: team,
                    name: match.match_away_fgs_p_ft[team]['name'],
                    id: id,
                    key: constant.SELCTED_THREE,
                    price: match.match_away_fgs_p_ft[team]['price'],
                    selection: "match_away_fgs_p_ft"
                }
            )
            matches_away.push(
                {
                    playerId: team,
                    name: match.away_fgs_p_ft[team]['name'],
                    id: id,
                    key: constant.SELCTED_FOUR,
                    price: match.away_fgs_p_ft[team]['price'],
                    selection: "away_fgs_p_ft"
                }
            )
            matches_away.push(
                {
                    playerId: team,
                    name: match.away_threegs_p_ft[team]['name'],
                    id: id,
                    key: constant.SELCTED_FIVE,
                    price: match.away_threegs_p_ft[team]['price'],
                    selection: "away_threegs_p_ft"
                }
            )
        })
        let curateSelection = matches_away.filter(function (item) {
            return selection.hasOwnProperty(item.selection) && selection[item.selection].indexOf(item.playerId) > -1
        })
        console.log("******** GOALSCORERS - Away*********")
        console.log(curateSelection)
        if (!isEmpty(curateSelection)) {
            selectedTeam = "away"
            curateSelection.forEach(function (item) {
                let correctId = item.id
                if (correctId > constant.COUNT_PLAYER_ROWS - 1) {
                    currentPage = 1
                    correctId = correctId - constant.COUNT_PLAYER_ROWS
                } else {
                    currentPage = 0
                }
                this.setState({currentPage, selectedTeam})
                this.clickTable(correctId, item.key, item.price, item.name, item.selection, item.playerId)
            }.bind(this))
        }
        curateSelection = matches_home.filter(function (item) {
            return selection.hasOwnProperty(item.selection) && selection[item.selection].indexOf(item.playerId) > -1
        })
        console.log("******** GOALSCORERS - Home*********")
        console.log(curateSelection)
        if (!isEmpty(curateSelection)) {
            selectedTeam = "home"
            curateSelection.forEach(function (item) {
                let correctId = item.id
                if (correctId > constant.COUNT_PLAYER_ROWS - 1) {
                    currentPage = 1
                    correctId = correctId - constant.COUNT_PLAYER_ROWS
                } else {
                    currentPage = 0
                }
                this.setState({currentPage, selectedTeam})
                this.clickTable(correctId, item.key, item.price, item.name, item.selection, item.playerId)
            }.bind(this))
        }
    }

    initState() {
        return {
            name: productsName,
            match: this.props.match,
            options: {
                selectedTeam: constant.HOME,
                //selectedTeam: constant.AWAY,
                currentPage: 0,
                selectedItem: [],
                textValue: [],
                price: 26.5,
                changes: false
            }
        }
    }

    getCurrentBet(props) {
        const {bets, match} = props
        let currentBet = {}
        bets.map(bet => {
            if (bet.name === productsName && bet.match.name === match.name) {
                currentBet = bet
            }
        })
        return currentBet
    }

    setToParrenState(selectedItem, currentPage, selectedTeam, textValue, selectedPrice) {
        const bet = {
            name: productsName,
            match: this.props.match,
            options: {
                currentPage,
                selectedItem,
                selectedTeam,
                textValue,
                price: selectedPrice,
                changes: true,
            }
        }
        this.props.betResultMatch(bet)
    }

    clickTable(id, key, selectedPrice, selectedPlayer, selection, selectedId) {
        let {selectedItem, currentPage, selectedTeam} = this.state
        const triggerState = !this.state.triggerState
        const {match, matches} = this.props
        const selected = {
            matchName: match.fixture,
            page: currentPage,
            item: [id, key],
            selectedTeam: selectedTeam,
            player: {
                name: selectedPlayer,
                price: selectedPrice
            },
            selectedId: selectedId,
            selection: selection
        };
        const index = this.isCurrentItemClicked(id, key)
        if (index > -1) {
            selectedItem.splice(index, 1)
        } else {
            switch (key) {
                case constant.SELCTED_TWO:    //AnyTime
                    selectedItem = selectedItem.filter((value, idx) => {
                        if (value.matchName === match.fixture && value.selectedTeam === selectedTeam
                            && value.page === currentPage) {
                            if (value.item[0] !== id) {
                                return value
                            }
                        } else {
                            return value
                        }
                    })
                    break
                case constant.SELCTED_THREE:       //1stGame
                    selectedItem = selectedItem.filter((value, idx) => {
                        if (value.item[0] === id && value.matchName === match.fixture
                            && value.selectedTeam === selectedTeam && value.page === currentPage) {
                            if (value.item[1] === constant.SELCTED_FIVE) {
                                return value
                            }
                        } else {
                            if (value.matchName !== match.fixture ||
                                value.matchName === match.fixture && value.selectedTeam !== selectedTeam && value.item[1] !== constant.SELCTED_THREE ||
                                value.matchName === match.fixture && value.selectedTeam === selectedTeam && value.item[1] !== constant.SELCTED_FOUR &&
                                value.matchName === match.fixture && value.selectedTeam === selectedTeam && value.item[1] !== constant.SELCTED_THREE) {
                                return value
                            }
                        }
                    })
                    break
                case constant.SELCTED_FOUR:  //1stTeam
                    selectedItem = selectedItem.filter((value, idx) => {
                        if (value.item[0] === id && value.matchName === match.fixture
                            && value.selectedTeam === selectedTeam && value.page === currentPage) {
                            if (value.item[1] === constant.SELCTED_FIVE) {
                                return value
                            }
                        } else {
                            if (value.matchName !== match.fixture ||
                                value.matchName === match.fixture && value.selectedTeam !== selectedTeam ||
                                value.matchName === match.fixture && value.selectedTeam === selectedTeam && value.item[1] !== constant.SELCTED_FOUR &&
                                value.matchName === match.fixture && value.selectedTeam === selectedTeam && value.item[1] !== constant.SELCTED_THREE ||
                                value.matchName === match.fixture && value.selectedTeam === selectedTeam && value.item[1] !== constant.SELCTED_FOUR &&
                                value.matchName === match.fixture && value.selectedTeam === selectedTeam && value.item[1] !== constant.SELCTED_THREE) {
                                return value
                            }
                        }
                    })
                case constant.SELCTED_FIVE: //3+
                    selectedItem = selectedItem.filter((value, idx) => {
                        if (value.item[0] === id && value.item[1] !== constant.SELCTED_TWO || value.item[0] !== id) {
                            return value
                        }
                    })
                    break
            }
            selectedItem.push(selected)
        }
        //this.setState({selectedItem, triggerState, changes: true});
        const textValue = this.formatText(selectedItem, currentPage, selectedTeam, selectedPlayer)
        this.setToParrenState(selectedItem, currentPage, selectedTeam, textValue, selectedPrice)
    }

    isCurrentItemClicked(id, key, selectedInCurrentPage) {
        const {selectedItem, selectedTeam, currentPage} = this.state
        const {match} = this.props
        let selectedView = -1
        selectedItem.map((value, idx) => {
            const is = isEqual(value.item, [id, key])
            if (value.matchName === match.fixture && value.selectedTeam === selectedTeam &&
                value.page === currentPage && is) {
                selectedView = idx
            }
        })
        return selectedView
    }

    isPlayerClicked(id, selectedInCurrentPage) {
        const selectedView = findIndex(selectedInCurrentPage, (value) => {
            return value[0] === id
        })
        return selectedView > -1 ? true : false
    }

    formatText(selectedItem, currentPage, selectedTeam, selectedPlayer) {
        let first = '', two = '', three = '', four = '', textValue = ''
        const {matches, match} = this.props
        selectedItem.map((value, key) => {
            const selectedCountGoals = value.item[1]
            switch (selectedCountGoals) {
                case constant.SELCTED_TWO:
                    first = first + ' ' + selectedPlayer
                    break
                case constant.SELCTED_THREE:
                    two = two + ' ' + selectedPlayer
                    break
                case constant.SELCTED_FOUR:
                    three = three + ' ' + selectedPlayer
                    break
                case constant.SELCTED_FIVE:
                    four = four + ' ' + selectedPlayer
                    break
            }
        });
        textValue = [
            '\'Anytime\' - ' + first,
            '\'1st Game\' - ' + two,
            '\'1st Team\' - ' + three,
            '\'3+\' - ' + four
        ]
        return textValue
    }

    handlePaginatorClicked(item) {
        const currentPage = item.value
        this.setState({currentPage})
    }

    applyPaginatorWindow(items) {
        var rows = constant.COUNT_PLAYER_ROWS
        var i = this.state.currentPage * rows
        var j = (this.state.currentPage + 1) * rows
        return items.slice(i, j)
    }

    comparePrice(a, b) {
        const aPrice = parseFloat(a.price)
        const bPrice = parseFloat(b.price)
        if (aPrice > bPrice) return 1
        if (aPrice < bPrice) return -1
    }

    handleTabClicked(tab) {
        const {selectedItem, currentPage, textValue, price} = this.state
        let selectedTeam = tab.name
        this.setToParrenState(selectedItem, currentPage, selectedTeam, textValue, price)
    }

    getCurrentListPlayer() {
        let selected = []
        const {selectedItem, currentPage, selectedTeam} = this.state
        selectedItem.map((value) => {
            if (value.page === currentPage && value.selectedTeam === selectedTeam
                && value.matchName === this.props.match.fixture)
                selected.push(value.item)
        });
        return selected
    }

    handleCancel() {
        const props = this.props
        const bet = this.getCurrentBet(props)
        this.props.delBetfromBetsList(productsName, props.match.fixture)
    }

    render() {
        let matches
        const {selectedItem, currentPage, selectedTeam, textValue} = this.state
        const {match} = this.props
        const selectedInCurrentPage = this.getCurrentListPlayer()
        if (match) {
            if (selectedTeam === 'home') {
                matches = Object.keys(match.home_ags_p_ft).map(function (team) {
                    return {
                        id: team,
                        name: match.home_ags_p_ft[team]['name'],
                        any_time: {
                            price: match.home_ags_p_ft[team]['price'],
                            selection: "home_ags_p_ft"
                        },
                        game_1st: {
                            price: match.match_home_p_fgs_ft[team]['price'],
                            selection: "match_home_p_fgs_ft"
                        },
                        team_1st: {
                            price: match.home_fgs_p_ft[team]['price'],
                            selection: "home_fgs_p_ft"
                        },
                        goals: {
                            price: match.home_threegs_p_ft[team]['price'],
                            selection: "home_threegs_p_ft"
                        }
                    }
                })
            } else {
                matches = Object.keys(match.away_ags_p_ft).map(function (team) {
                    return {
                        id: team,
                        name: match.away_ags_p_ft[team]['name'],
                        any_time: {
                            price: match.away_ags_p_ft[team]['price'],
                            selection: "away_ags_p_ft"
                        },
                        game_1st: {
                            price: match.match_away_fgs_p_ft[team]['price'],
                            selection: "match_away_fgs_p_ft"
                        },
                        team_1st: {
                            price: match.away_fgs_p_ft[team]['price'],
                            selection: "away_fgs_p_ft"
                        },
                        goals: {
                            price: match.away_threegs_p_ft[team]['price'],
                            selection: "away_threegs_p_ft"
                        }
                    }
                })
            }
            let sortFn = function (i0, i1) {
                if (i0.any_time.price < i1.any_time.price) {
                    return -1
                } else if (i0.any_time.price > i1.any_time.price) {
                    return 1
                }
            }
            matches.sort(sortFn)
        }
        return (
            <div>
                <div className={s['wrap-mybettab']}>
                    <MyBetTab
                        forTeamName={true}
                        tabs={this.state.myBetTab}
                        selected={this.state.selectedTeam}
                        clickHandler={this.handleTabClicked}
                    />
                </div>
                <GoalScorersTable
                    matches={this.applyPaginatorWindow(matches)}
                    legs={this.props.legs}
                    clickHandler={this.clickTable}
                    selected={selectedInCurrentPage}/>
                {
                    (matches.length > constant.COUNT_PLAYER_ROWS) ?
                        <MyPaginator
                            product={{rows: constant.COUNT_PLAYER_ROWS}}
                            data={matches}
                            clickHandler={this.handlePaginatorClicked}
                            currentPage={this.state.currentPage}
                        />
                        : null
                }
                <div className={classNames("bet-submit-btns", s['btn-group'])}>
                    <button
                        className="btn btn-primary bet-cancel-btn"
                        onClick={() => this.handleCancel()}>Clear
                    </button>
                </div>
            </div>
        )
    }
}


