export const products = [
    {
        label: "Exotic Winners",
        name: "winners",
        description: "An Exotic Acca Winner is like a traditional acca; but not all teams have to win for it to payout, so you don't have to select all the favourites; and you can add a goals condition to improve the price!",
        legsPanel: 'MatchTeamPanel',
        betGoalsSlider: {
            label: "To Win By At Least",
            tickLabeller: function (minval, maxval) {
                var labels = [];
                for (var i = minval; i <= maxval; i++) {
                    if (i == minval) {
                        labels.push("(Just Win)");
                    } else {
                        labels.push(i + "+ Goals");
                    }
                }
                return labels;
            },
            minVal: 1,
            maxVal: 4,
        },
        betLegsToggle: {
            label: "How many legs need to win ?",
            textFormatter: function (val, maxval) {
                return Math.ceil((maxval / 2) + 1) + ((val < maxval) ? "+" : "") + " (of " + maxval + ")";
            },
            minVal: 1
        }
    },
    {
        label: "Exotic Losers",
        name: "losers",
        description: "An Exotic Acca Loser is like an Exotic Acca Winner, but in reverse! This time you're picking a set of teams you expect to lose, and not all teams have to lose for you to win.",
        legsPanel: 'MatchTeamPanel',
        betGoalsSlider: {
            label: "To Lose By At Least",
            tickLabeller: function (minval, maxval) {
                var labels = [];
                for (var i = minval; i <= maxval; i++) {
                    if (i == minval) {
                        labels.push("(Just Lose)");
                    } else {
                        labels.push(i + "+ Goals");
                    }
                }
                return labels;
            },
            minVal: 1,
            maxVal: 4,
        },
        betLegsToggle: {
            label: "How many legs need to lose ?",
            textFormatter: function (val, maxval) {
                return Math.ceil((maxval / 2) + 1) + ((val < maxval) ? "+" : "") + " (of " + maxval + ")";
            },
            minVal: 1
        }
    },
    {
        label: "Exotic Draws",
        name: "draws",
        description: "An Exotic Acca Draws bet allows you to bet on the number of draws in an Acca; once again, not all of them have to come in and you can improve the price by specifying the number of goals in each game",
        legsPanel: 'MatchPanel',
        betGoalsSlider: {
            label: "With each team scoring at least",
            tickLabeller: function (minval, maxval) {
                var labels = [];
                for (var i = minval; i <= maxval; i++) {
                    if (i == minval) {
                        labels.push("(Just Draw)");
                    } else {
                        labels.push(i + "+ Goals");
                    }
                }
                return labels;
            },
            minVal: 0,
            maxVal: 3,
        },
        betLegsToggle: {
            label: "How many legs need to draw ?",
            textFormatter: function (val, maxval) {
                return Math.ceil((maxval / 2) + 1) + ((val < maxval) ? "+" : "") + " (of " + maxval + ")";
            },
            minVal: 1
        }
    }
]