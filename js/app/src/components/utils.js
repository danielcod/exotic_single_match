import * as constant from './constant'

const PLAYER_CARDS = constant.PLAYER_CARDS_
const GOAL_SCORERS = constant.GOAL_SCORERS
const BTTS = constant.GOALS

export function matchSorter(m0, m1) {
    if (m0.kickoff < m1.kickoff) {
        return -1
    } else if (m0.kickoff > m1.kickoff) {
        return 1
    } else {
        if (m0.name < m1.name) {
            return -1
        } else if (m0.name > m1.name) {
            return 1
        } else {
            return 0
        }
    }
}

export function matchSorterByLeague(m0, m1) {
    if (m0.league < m1.league) {
        return -1
    } else if (m0.league > m1.league) {
        return 1
    } else {
        return 0
    }
}

export function formatPrice(value) {
    if (typeof value === "string") value = parseFloat(value)
    if (value < 2) {
        // return value.toFixed(3);
        return value.toFixed(2)
    } else if (value < 10) {
        return value.toFixed(2)
    } else if (value < 1000) {
        return value.toFixed(1)
    } else {
        return Math.floor(value)
    }
}

export function formatCurrentPrice(price) {
    if (price == undefined) {
        return "[...]"
    } else {
        return formatPrice(price)
    }
}

export function getCurrentBet(props, matchComponents) {
    const {bets, match} = props
    let currentBet = {}
    bets.map(bet => {
        if (bet.name === matchComponents && bet.match.name === match.name) {
            currentBet = bet
        }
    })
    return currentBet
}

export function formatBTTSText(row, column) {
    let columnText, rowText
    if (column === constant.SELCTED_FIRST) {
        columnText = constant.YES
    } else if (column === constant.SELCTED_TWO) {
        columnText = constant.NO
    }
    if (row === constant.SELCTED_FIRST) {
        rowText = '' //'(' +constant.FULL_MATCH + ');
    } else if (row === constant.SELCTED_TWO) {
        rowText = '(' + constant.BOTH_HALVES + ')'
    } else if (row === constant.SELCTED_THREE) {
        rowText = '(' + constant.EITHER_HALF + ')'
    }
    return 'BTTS ' + rowText + ' = ' + columnText
}

export function formatTotalGoalsText(sliderValue, selectedTab) {
    return 'Total Goals ' + selectedTab + ' ' + constant.marks[sliderValue]
}

export function formatObjectYourBet(bets, match) {
    let showBets = []
    bets.map(bet => {
        if (bet.match.fixture != match.fixture) return
        if (BTTS === bet.name) {
            if (bet.options.changedTable) {
                showBets.push({
                    match: bet.match,
                    name: bet.name,
                    description: bet.options.textBTTS,
                    price: bet.options.priceBTTS,
                    options: {
                        changedTable: bet.options.changedTable,
                        selectedItem: bet.options.selectedItem,
                        priceBTTS: bet.options.priceBTTS,
                        textBTTS: bet.options.textBTTS
                    }
                })
            }
            if (bet.options.changedTab) {
                showBets.push({
                    match: bet.match,
                    name: bet.name,
                    description: bet.options.textTotalGoals,
                    price: bet.options.priceTotalGoals,
                    options: {
                        changedTab: bet.options.changedTab,
                        selectedTab: bet.options.selectedTab,
                        priceTotalGoals: bet.options.priceTotalGoals,
                        textTotalGoals: bet.options.textTotalGoals,
                        sliderValue: bet.options.sliderValue
                    }
                })
            }
        } else if (PLAYER_CARDS === bet.name) {
            bet.options.selectedItem.map(value => {
                showBets.push({
                    match: bet.match,
                    name: bet.name,
                    options: bet.options,
                    description: value.player.name + ' - ' + getCardsBl(value.item, value.matchName, value.selectedTeam),
                    price: parseFloat(value.player.price),
                    player: value.player,
                    selectedItem: value
                })
            })
        } else if (GOAL_SCORERS === bet.name) {
            bet.options.selectedItem.map(value => {
                showBets.push({
                    match: bet.match,
                    name: bet.name,
                    options: bet.options,
                    description: value.player.name + ' - ' + getGoalScorersBl(value.item, value.matchName, value.selectedTeam),
                    price: parseFloat(value.player.price),
                    player: value.player,
                    selectedItem: value
                })
            })
        } else {
            bet.description = bet.options.textValue
            bet.price = bet.options.price
            showBets.push(bet)
        }
    })
    return showBets
}

function getCardsBl(item, matchName, selectedTeam) {
    const [homeTeam, awayTeam] = matchName.split(' vs ')
    const comandName = selectedTeam === constant.HOME ? homeTeam : awayTeam
    switch (item[1]) {
        case constant.SELCTED_TWO:
            return constant.ANY_CARD
        case constant.SELCTED_THREE:
            return constant.FIRST_MATCH + ' ' + constant.CARD
        case constant.SELCTED_FOUR:
            return constant.FIRST + ' ' + comandName + ' ' + constant.CARD
        case constant.SELCTED_FIVE:
            return constant.SENT_OFF
    }
}

function getGoalScorersBl(item, matchName, selectedTeam) {
    const [homeTeam, awayTeam] = matchName.split(' vs ')
    const comandName = selectedTeam === constant.HOME ? homeTeam : awayTeam
    switch (item[1]) {
        case constant.SELCTED_TWO:
            return constant.ANYTIME_GOAL
        case constant.SELCTED_THREE:
            return constant.FIRST_MATCH + ' ' + constant.GOAL
        case constant.SELCTED_FOUR:
            return constant.FIRST + ' ' + comandName + ' ' + constant.GOAL
        case constant.SELCTED_FIVE:
            return constant.THREE_PLUS_GOALS
    }
}

export function formatCountBets(bets, match) {
    let betInBets = 0
    bets.map(bet => {
        if (bet.match.name != match.name) return
        if (PLAYER_CARDS === bet.name ||
            GOAL_SCORERS === bet.name) {
            betInBets = betInBets + bet.options.selectedItem.length
        } else if (BTTS === bet.name) {
            if (bet.options.changedTab) betInBets = betInBets + 1
            if (bet.options.changedTable) betInBets = betInBets + 1
        } else {
            betInBets = betInBets + 1
        }
    })
    return betInBets
}

export function getLegsFromBet(bet) {
    let legs = new Array()
    for (let index in bet.betLegs) {
        let leg = {
            description: bet.betLegs[index].name,
            match: {
                kickoff: bet.betLegs[index].kickoff,
                league: bet.betLeague,
            },
            price: bet.betLegs[index].price
        }
        legs.push(leg)
    }
    return legs
}
   