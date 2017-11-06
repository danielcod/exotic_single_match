import React from 'react';
import {bindAll} from 'lodash';
import AccaProductLegTable from '../AccaProductLegTable';
import MyPaginator from '../../../molecules/MyPaginator';
/*
 nLegs is the state value for NLegsToggle
 nGoals is the state value for NGoalsSlider
 */
export default class AccaProductPanelList extends React.PureComponent {
    accaProductType = [
        {name: "acca-type", label: "Exotic Type"},
        {name: "winners", label: "Winners"},
        {name: "losers", label: "Losers"},
        {name: "draws", label: "Draws"},
    ];
    accaTeamType = [
        {name: "all-teams", label: "Team Grouping"}
    ];
    bet = this.props.items;

    constructor(props) {
        super(props);
        this.getTeamType();
        this.state = {
            selectedProductType: "Exotic Type",
            selectedTeamType: "Team Grouping",
            currentPage: 0
        };
        bindAll(this, ['getTeamType', 'filterLegs', 'handleProductChanged', 'handleTeamChanged',
            'handleLegEdited', 'handlePaginatorClicked', 'applyPaginatorWindow'
        ]);
    }

    getTeamType() {
        var names = [];
        for (var i = 0; i < this.bet.length; i++) {
            var bet = this.bet[i];
            if (names.indexOf(bet.betLeague) == -1) {
                names.push(bet.betLeague);
            }
        }
        for (var j = 0; j < names.length; j++) {
            this.accaTeamType.push({name: names[j], label: names[j]});
        }
    }

    filterLegs() {
        var selectedProductType = this.state.selectedProductType;
        var legs = this.bet.filter(function (leg) {
            return leg.betType === selectedProductType;
        });
        if (legs.length === 0) legs = this.bet;
        var selectedTeamType = this.state.selectedTeamType;
        var filteredLegs = legs.filter(function (leg) {
            return leg.betLeague === selectedTeamType;
        });
        if (filteredLegs.length === 0 && selectedTeamType === "Team Grouping") filteredLegs = legs;
        return filteredLegs;
    }

    handleProductChanged(name, value) {
        var selectedProductType = this.accaProductType.filter(function (type) {
            return type.name === value;
        })[0].label;
        this.setState({
            selectedProductType: selectedProductType,
            currentPage: 0
        });

    }

    handleTeamChanged(name, value) {
        const selectedTeamType = this.accaTeamType.filter(function (type) {
            return type.name === value;
        })[0].label;
        this.setState({
            selectedTeamType: selectedTeamType,
            currentPage: 0
        });
    }

    handleLegEdited(oldleg) {
        /*
        var state = this.state;
        state.bet.legs = state.bet.legs.filter(function (leg) {
            return leg.betLegs != oldleg.betLegs;
        });
        this.setState({bet: state.bet, legs: state.bet.legs});

        */
    }

    handlePaginatorClicked(item) {
        this.setState({currentPage: item.value});
    }

    applyPaginatorWindow(items) {
        var rows = this.props.legsPaginator.rows;
        var i = this.state.currentPage * rows;
        var j = (this.state.currentPage + 1) * rows;
        return items.slice(i, j);
    }

    sortLegs(legs) {
        var sortFn = function (i0, i1) {
            if (i0.betTime < i1.betTime) {
                return -1;
            } else if (i0.betTime > i1.betTime) {
                return 1;
            } else {
                if (i0.betLegs < i1.betLegs) {
                    return -1
                } else if (i0.betLegs > i1.betLegs) {
                    return 1
                } else {
                    return 0;
                }
            }
        }.bind(this);
        return legs.sort(sortFn);
    }

    render() {
        return (
            <div id="exotic-acca-list">
                <div id="exotic-acca-list-header">
                    <div className="form-group">
                        <button
                            className="btn btn-primary"
                            onClick={() => this.props.clickHandler("custom")}>Build Your Own EXOTIC
                        </button>
                    </div>
                    <div className="form-group">
                        <span>....or edit one of the popular bets other people have chosen:</span>
                    </div>
                </div>
                <div id="exotic-acca-list-content">
                    <div id="exotic-acca-list-table">
                        <AccaProductLegTable
                            clickHandler={this.handleLegEdited}
                            /*legs={this.applyPaginatorWindow(this.sortLegs(this.filterLegs()))}*/
                            legs={this.applyPaginatorWindow(this.filterLegs())}
                        />
                    </div>
                    {
                        this.filterLegs().length > this.props.legsPaginator.rows ?
                            <MyPaginator
                                clickHandler={this.handlePaginatorClicked}
                                currentPage={this.state.currentPage}
                                product={this.props.legsPaginator}
                                /*data={this.sortLegs(this.filterLegs())}*/
                                data={this.filterLegs()}
                            />
                            : null
                    }
                </div>
            </div>
        )
    }
}