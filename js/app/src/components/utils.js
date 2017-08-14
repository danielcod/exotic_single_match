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