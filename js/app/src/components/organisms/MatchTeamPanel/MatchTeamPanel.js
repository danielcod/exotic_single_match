import React from 'react';
import {bindAll} from 'lodash';
import MyFormComponent from '../../atoms/MyFormComponent';
import MySelect from '../../atoms/MySelect';
import MatchTeamTable from '../MatchTeamTable';
import MyPaginator from '../../molecules/MyPaginator';

export default class MatchTeamPanel extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            matches: [],
            leagues: [],
            league: undefined,
            currentPage: 0
        };
        bindAll(this, ['handleLeagueChanged', 'applyPaginatorWindow', 'handlePaginatorClicked',
            'filterLeagues', 'filterMatches', 'matchSorter']);
    }

    handleLeagueChanged(name, league) {
        this.setState({league, currentPage: 0});
    }

    applyPaginatorWindow(items) {
        var rows = this.props.paginator.rows;
        var i = this.state.currentPage * rows;
        var j = (this.state.currentPage + 1) * rows;
        return items.slice(i, j);
    }

    handlePaginatorClicked(item) {
        this.setState({currentPage: item.value});
    }

    filterLeagues(matches) {
        var names = [];
        for (var i = 0; i < matches.length; i++) {
            var match = matches[i];
            if (names.indexOf(match.league) == -1) {
                names.push(match.league);
            }
        }
        return names.sort();
    }

    filterMatches(matches) {
        return matches.filter(function (match) {
            return match.league == this.state.league;
        }.bind(this));
    }

    matchSorter(m0, m1) {
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

    componentDidMount() {
        this.props.exoticsApi.fetchMatches(function (struct) {
            let {matches, leagues} = this.state;
            const cutoff = new Date();
            matches = struct.filter(function (match) {
                return new Date(match.kickoff) > cutoff;
            }).sort(this.matchSorter);
            leagues = this.filterLeagues(matches);
            this.setState({
                league: leagues[0],
                leagues: leagues,
                matches: matches
            });
        }.bind(this));
    }

    render() {
        const {league, leagues, matches} = this.state;
        return (
            <div>
                {
                    league != undefined ?
                        <div>
                            <div style={{marginLeft: '100px', marginRight: "100px"}}>
                                <MySelect
                                    options={leagues.map(league => {
                                        return {value: league};
                                    })}
                                    name="league"
                                    changeHandler={this.handleLeagueChanged}
                                />
                            </div>
                            <MatchTeamTable
                                matches={this.applyPaginatorWindow(this.filterMatches(matches))}
                                legs={this.props.legs}
                                clickHandler={this.props.clickHandler}
                            />
                            {
                                this.filterMatches(matches).length > this.props.paginator.rows ?
                                    <MyPaginator
                                        clickHandler={this.handlePaginatorClicked}
                                        currentPage={this.state.currentPage}
                                        product={this.props.paginator}
                                        data={matches.filter(function (match) {
                                            return match.league == league;
                                        })
                                        }
                                    />
                                    : null
                            }
                        </div>
                        : null
                }
            </div>
        )
    }
}