export function matchSorter(m0, m1) {	       
        if (m0.kickoff < m1.kickoff) {
            return -1;
        } else if (m0.kickoff > m1.kickoff) {
            return 1;
        } else {
            if (m0.name < m1.name) {
            return -1
            } else if (m0.name > m1.name) {
            return 1
            } else {
            return 0;
            }
        }
    }
  export function formatPrice(value) {
        if (!value) return null;
        if(typeof value === "string") value = parseFloat(value);
        if (value < 2) {
            // return value.toFixed(3);
            return value.toFixed(2);
        } else if (value < 10) {
            return value.toFixed(2);
        } else if (value < 100) {
            return value.toFixed(1);
        } else {
            return Math.floor(value);
        }
    }
    export function getCurrentBet(props, matchComponents){
        const {bets, match} = props;
        let currentBet = {};
        bets.map(bet=>{            
            if (bet.name === matchComponents && bet.match.name === match.name){
                currentBet = bet;
            }
        });
        return currentBet;
    }
    