import React from 'react';
import {bindAll} from 'lodash';
import MySelect from '../../../atoms/MySelect';
import AccaProductLegTable from '../AccaProductLegTable';
import MyPaginator from '../../../molecules/MyPaginator';
/*
 nLegs is the state value for NLegsToggle
 nGoals is the state value for NGoalsSlider
 */
export default class AccaProductPanelList extends React.PureComponent {
    accaProductType = [
        {name: "acca-type", label: "Acca Type"},
        {name: "winners", label: "Winners"},
        {name: "losers", label: "Losers"},
        {name: "draws", label: "Draws"},
    ];
    accaTeamType = [
        {name: "all-teams", label: "All Teams"}
    ];
    bet = this.props.items;

    constructor(props) {
        super(props);
        this.getTeamType();
        this.state = {
            selectedProductType: "Acca Type",
            selectedTeamType: "All Teams",
            currentPage: 0
        };
        bindAll(this, ['getTeamType', 'filterLegs', 'handleProductChanged',
            'handleTeamChanged', 'handleLegEdited', 'handlePaginatorClicked',
            'applyPaginatorWindow', 'getAccaProductPanelListContent'
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
        if (filteredLegs.length === 0 && selectedTeamType === "All Teams") filteredLegs = legs;
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

    getAccaProductPanelListContent() {
        return (
            <div>
                <div className="acca-panel-list-header">
                    <MySelect
                        className="form-control acca-product-type input-lg"
                        options={this.accaProductType.map(function (type) {
                            return {label: type.label, value: type.name}
                        })}
                        name="acca-product-type"
                        changeHandler={this.handleProductChanged}
                    />
                    <MySelect
                        className="form-control acca-league-type input-lg"
                        options={this.accaTeamType.map(function (league) {
                            return {label: league.label, value: league.name}
                        })}
                        name="acca-league-type"
                        changeHandler={this.handleTeamChanged}
                    />
                    <button
                        className="btn btn-primary"
                        onClick={() => this.props.clickHandler("custom")}
                        style={{float: "right"}}>Build My Own
                    </button>
                </div>
                <div className="acca-panel-list-content">
                    <AccaProductLegTable
                        clickHandler={this.handleLegEdited}
                        legs={this.applyPaginatorWindow(this.sortLegs(this.filterLegs()))}
                    />
                    {
                        this.filterLegs().length > this.props.legsPaginator.rows ?
                            <MyPaginator
                                clickHandler={this.handlePaginatorClicked}
                                currentPage={this.state.currentPage}
                                product={this.props.legsPaginator}
                                data={this.sortLegs(this.filterLegs())}
                            />
                            : null
                    }
                </div>
            </div>
        )
    }

    render() {
        const AccaProductPanelListContent = this.getAccaProductPanelListContent();
        return (
            <div className="acca-panel-list">
                {AccaProductPanelListContent}
            </div>
        )
    }
}