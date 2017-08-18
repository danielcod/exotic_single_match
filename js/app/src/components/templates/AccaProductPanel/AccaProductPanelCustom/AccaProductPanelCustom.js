import React from 'react';
import {bindAll} from 'lodash';
import MyFormComponent from '../../../atoms/MyFormComponent';
import MySelect from '../../../atoms/MySelect';
import AccaNGoalsSlider from '../../../atoms/AccaNGoalsSlider';
import AccaPanelTabs from '../../../organisms/AccaPanelTabs';
import MatchTeamPanel from '../../../organisms/MatchTeamPanel';
import MatchPanel from '../../../organisms/MatchPanel';
import AccaNLegsToggle from '../../../organisms/AccaNLegsToggle';
import AccaLegTable from '../../../organisms/AccaLegTable';
import MyPaginator from '../../../molecules/MyPaginator';
import * as DU from '../../../date_utils';
/*
 nLegs is the state value for NLegsToggle
 nGoals is the state value for NGoalsSlider
 */
export default class AccaProductPanelCustom extends React.PureComponent {
    constructor(props) {
        super(props);
        const bet = this.initBet(this.props.products[0]);
        this.state = {
            accaProductHelp: false,
            accaProductPanelCustomState: "select",
            selectedTab: "legs",
            product: this.props.products[0],
            bet: bet,
            legs: bet.legs,
            stake: "10.00"
        };
        bindAll(this, ['handleStateChanged', 'handleProductChanged', 'handleTabClicked',
            'handleStakeChanged', 'handleLegAdded', 'handleLegRemoved',
            'handleGoalsSliderChanged', 'handlePaginatorClicked', 'incrementNLegs',
            'decrementNLegs', 'placedBetTextFormatter', 'placedBetGoalFormatter',
            'applyPaginatorWindow', 'updatePrice', 'sortLegs',
            'getLegSelectorTabContent', 'getYourBetTabContent', 'getAccaProductPanelCustomContent']);
    }

    initBet(product) {
        var initNLegs = function (product) {
            var toggle = product.betLegsToggle;
            return toggle ? toggle.minVal : 1;
        };
        var initNGoals = function (product) {
            var slider = product.betGoalsSlider;
            return slider ? slider.minVal : 0;
        };
        return {
            legs: [],
            nLegs: initNLegs(product),
            nGoals: initNGoals(product),
            currentPage: 0
        }
    }

    handleStateChanged(accaProductPanelCustomState) {
        this.setState({accaProductPanelCustomState: accaProductPanelCustomState});
        if (accaProductPanelCustomState == "place") {
            this.props.clickHandler("place");
        } else if(accaProductPanelCustomState == "select") {
            this.props.clickHandler("custom");
        }
    }

    handleProductChanged(name, value) {
        const product = this.props.products.filter(function (product) {
            return product.name == value;
        })[0];
        const bet = this.initBet(product);
        this.setState({product, bet, legs: bet.legs});
    }

    handleTabClicked(tab) {
        this.setState({selectedTab: tab.name});
    }

    handleStakeChanged(e) {
        this.setState({stake: e.target.value});
    }

    handleLegAdded(newleg) {
        var state = this.state;
        state.bet.legs = state.bet.legs.filter(function (leg) {
            return leg.match.name != newleg.match.name;
        });
        state.bet.legs.push(newleg);
        this.setState({bet: state.bet, legs: state.bet.legs});
        this.updatePrice();
    }

    handleLegRemoved(oldleg) {

        var state = this.state;
        state.bet.legs = state.bet.legs.filter(function (leg) {
            return leg.description != oldleg.description;
        });
        state.bet.nLegs = Math.max(this.state.product.betLegsToggle.minVal, Math.min(state.bet.nLegs, state.bet.legs.length)); // NB
        this.setState({bet: state.bet, legs: state.bet.legs});
        this.updatePrice();
    }

    handleGoalsSliderChanged(value) {
        var state = this.state;
        if (value != state.bet.nGoals) {
            state.bet.nGoals = value;
            this.setState(state.bet);
            this.updatePrice();
        }
    }

    handlePaginatorClicked(item) {
        var state = this.state;
        state.bet.currentPage = item.value;
        this.setState({bet: state.bet});
    }

    incrementNLegs() {
        var state = this.state;
        if (state.bet.nLegs < state.bet.legs.length) {
            state.bet.nLegs += 1;
            this.setState(state.bet);
            this.updatePrice();
        }
    }

    decrementNLegs() {
        var state = this.state
        if (state.bet.nLegs > 1) {
            state.bet.nLegs -= 1;
            this.setState(state.bet);
            this.updatePrice();
        }
    }

    getCurrentTimeFormatter() {
        var dt = new Date();
        var monthNames = [
            "January", "February", "March",
            "April", "May", "June", "July",
            "August", "September", "October",
            "November", "December"
        ];
        var month = monthNames[dt.getMonth()];
        var day = dt.getDate().toString();
        var hour = dt.getHours().toString();
        var minutes = dt.getMinutes() > 10 ? dt.getMinutes().toString() : "0" + dt.getMinutes().toString();
        var mid = dt.getHours() >= 12 ? "pm" : "am";
        return <span
            className="bet-saved-date">{hour + ":" + minutes + " " + mid + " " + day}<sup>{DU.DateUtils.formatDaySuffix(dt)}</sup>{" " + month}</span>
    }

    placedBetTextFormatter() {
        return Math.ceil((this.state.bet.legs.length / 2) + 1) + ((this.state.bet.nLegs < this.state.bet.legs.length) ? "+" : "") + " of " + this.state.bet.legs.length
    }

    placedBetGoalFormatter() {
        switch (this.state.product.name) {
            case "exotic_acca_winner":
                return this.state.bet.nGoals == 1 ? "To just win" : "To win by " + this.state.bet.nGoals + "+ goals"
            case "exotic_acca_loser":
                return this.state.bet.nGoals == 1 ? "To just lose" : "To lose by " + this.state.bet.nGoals + "+ goals"
            case "exotic_acca_draws":
                return this.state.bet.nGoals == 1 ? "To just draw" : "To draw by " + this.state.bet.nGoals + "+ goals"
        }
    }

    applyPaginatorWindow(items) {
        var rows = this.props.betLegsPaginator.rows;
        var i = this.state.bet.currentPage * rows;
        var j = (this.state.bet.currentPage + 1) * rows;
        return items.slice(i, j);
    }

    formatPrice(value) {
        let result = 0;
        if (value < 2) {
            // return value.toFixed(3);
            result = value.toFixed(2);
        } else if (value < 10) {
            result = value.toFixed(2);
        } else if (value < 100) {
            result = value.toFixed(1);
        } else {
            result = Math.floor(value);
        }
        return result;
    }

    formatCurrentPrice(price) {
        if (price == undefined) {
            return "[...]";
        } else {
            return this.formatPrice(price);
        }
    }

    updatePrice() {
        if (this.state.bet.legs.length > 0) {
            // blank price, set price request id
            var state = this.state;
            state.price = undefined;
            var priceId = Math.round(Math.random() * 1e10);
            state.priceId = priceId;
            this.setState({priceId: state.priceId});

            // fetch new price
            setTimeout(function () {
                var struct = {
                    name: this.state.product.name,
                    legs: this.state.bet.legs,
                    nLegs: this.state.bet.nLegs,
                    nGoals: this.state.bet.nGoals,
                    bust: Math.round(Math.random() * 1e10)
                };
                this.props.exoticsApi.fetchPrice(struct, function (struct) {
                    let state = this.state;
                    if (state.priceId == priceId) {
                        const price = struct.price;
                        this.setState({price});

                    }
                }.bind(this));
            }.bind(this), 500);
        }
    }

    sortLegs(legs) {
        var sortFn = function (i0, i1) {
            if (i0.match.kickoff < i1.match.kickoff) {
                return -1;
            } else if (i0.match.kickoff > i1.match.kickoff) {
                return 1;
            } else {
                if (i0.description < i1.description) {
                    return -1
                } else if (i0.description > i1.description) {
                    return 1
                } else {
                    return 0;
                }
            }
        }.bind(this);
        return legs.sort(sortFn);
    }

    getLegSelectorTabContent() {
        if (this.state.product.legsPanel === 'MatchPanel') {
            return (
                <MatchPanel
                    exoticsApi={this.props.exoticsApi}
                    legs={this.state.bet.legs}
                    paginator={this.props.legsPaginator}
                    clickHandler={{
                        add: this.handleLegAdded,
                        remove: this.handleLegRemoved
                    }}
                />)
        } else {
            return (
                <div>
                    <MatchTeamPanel
                        exoticsApi={this.props.exoticsApi}
                        legs={this.state.bet.legs}
                        paginator={this.props.legsPaginator}
                        clickHandler={{
                            add: this.handleLegAdded,
                            remove: this.handleLegRemoved
                        }}
                    />
                    <div className="main-menu-container">
                        <button
                            className="btn btn-primary main-menu-btn"
                            onClick={() => this.props.clickHandler("list")}>MAIN MENU
                        </button>
                    </div>
                </div>
            )
        }
    }

    getYourBetTabContent() {
        return (
            <div>
                {
                    (this.state.bet.legs.length != 0) ?
                        <div>
                            <AccaLegTable
                                clickHandler={this.handleLegRemoved}
                                legs={this.applyPaginatorWindow(this.sortLegs(this.state.bet.legs))}
                                accaProductPanelState="custom"
                            />
                            {
                                (this.state.bet.legs.length > this.props.betLegsPaginator.rows) ?
                                    <MyPaginator
                                        product={this.props.betLegsPaginator}
                                        data={this.state.bet.legs}
                                        clickHandler={this.handlePaginatorClicked}
                                        currentPage={this.state.bet.currentPage}
                                    />
                                    : null
                            }
                            {
                                this.state.product.betLegsToggle ?
                                    <MyFormComponent
                                        label={this.state.product.betLegsToggle.label}
                                        component={<AccaNLegsToggle
                                            textFormatter={this.state.product.betLegsToggle.textFormatter}
                                            nLegs={this.state.bet.nLegs}
                                            legs={this.state.bet.legs}
                                            clickHandlers={{
                                                increment: this.incrementNLegs,
                                                decrement: this.decrementNLegs
                                            }}/>}

                                    />
                                    : null
                            }
                            {
                                this.state.product.betGoalsSlider ?
                                    <MyFormComponent
                                        label={this.state.product.betGoalsSlider.label}
                                        component={
                                            <AccaNGoalsSlider
                                                id="goalSlider"
                                                min={this.state.product.betGoalsSlider.minVal}
                                                max={this.state.product.betGoalsSlider.maxVal}
                                                tickLabeller={this.state.product.betGoalsSlider.tickLabeller}
                                                value={this.state.bet.nGoals}
                                                changeHandler={this.handleGoalsSliderChanged}
                                            />}
                                    /> : null
                            }
                            <div className="form-group">
                                <h3 className="current-price text-center">Current price:
                                    <span id="price">{this.formatCurrentPrice(this.state.price)}</span>
                                </h3>
                            </div>
                            <div className="bet-submit-btns">
                                <button
                                    className="btn btn-primary bet-cancel-btn"
                                    onClick={() => this.props.clickHandler("list")}>Cancel
                                </button>
                                <div className="stake">
                                    <span className="stake-label">Your Stake</span>
                                    <span className="stake-symbol">€</span>
                                    <input type="number" name="stake-value" className="stake-value"
                                           defaultValue={this.state.stake}
                                           onChange={(e) => {
                                               this.handleStakeChanged(e)
                                           }}/>
                                </div>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => this.handleStateChanged("place")}>Place Bet
                                </button>
                            </div>
                        </div> :
                        <h4 className="text-center text-muted"
                            style={{marginLeft: '50px', marginRight: "50px"}}>
                            Use the Leg Selector tab to add some selections
                        </h4>
                }
            </div>
        )
    }

    getAccaProductPanelCustomContent() {
        switch (this.state.accaProductPanelCustomState) {
            case "select":
                return (
                    <div>
                        <div className="product-select">
                            <MyFormComponent
                                label="Choose your Exotic Acca Type"
                                component={
                                    <MySelect
                                        className="form-control btn-primary input-lg"
                                        options={this.props.products.map(function (product) {
                                            return {label: product.label, value: product.name}
                                        })}
                                        name="product"
                                        changeHandler={this.handleProductChanged}
                                    />}
                            />
                            <a className="product-help-btn"
                               onClick={() => this.setState({accaProductHelp: !this.state.accaProductHelp})}>
                                <span className="glyphicon glyphicon-info-sign glyph-background">
                                    <span className="inner"></span>
                                </span>
                            </a>
                        </div>
                        {
                            this.state.accaProductHelp ?
                                <p className="help-block"><i>{this.state.product.description}</i></p>
                                : null
                        }
                        <AccaPanelTabs
                            tabs={[
                                {name: "legs", label: "Leg Selector"},
                                {name: "bet", label: "Your Bet"}]}
                            selected={this.state.selectedTab}
                            clickHandler={this.handleTabClicked}
                            legs={this.state.legs}
                        />
                        {
                            /* When "Leg Selector" tab is clicked */
                            (this.state.selectedTab == "legs") ? this.getLegSelectorTabContent() : null
                        }
                        {
                            /* When "Your Bet" tab is clicked */
                            (this.state.selectedTab == "bet") ? this.getYourBetTabContent() : null
                        }
                    </div>
                )
            case "place":
                return (
                    <div className="bet-confirm-container">
                        <div className="form-group">
                            <h3 className="bet-placed-text">
                                <span className="glyphicon glyphicon-ok"></span>Your bet has been placed!
                            </h3>
                        </div>
                        <div className="form-group">
                            <h3 className="bet-placed-product">
                                {this.state.product.label}
                            </h3>
                        </div>
                        <div className="form-group">
                            <div className="bet-goal">
                                {
                                    this.state.product.betLegsToggle ?
                                        <span>{this.placedBetTextFormatter()}</span>
                                        : null
                                }
                                {
                                    this.state.product.betGoalsSlider ?
                                        <span>{this.placedBetGoalFormatter()}</span>
                                        : null
                                }
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="bet-legs">
                                <AccaLegTable
                                    clickHandler={this.handleLegRemoved}
                                    legs={this.applyPaginatorWindow(this.sortLegs(this.state.bet.legs))}
                                    accaProductPanelState={this.state.accaProductPanelState}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <h3 className="bet-placed-price">
                                €{this.state.stake} @ <span>{this.formatCurrentPrice(this.state.price)}</span>
                            </h3>
                        </div>
                        <div className="form-group">
                            <div className="bet-placed-result">
                                <span>To win € {this.formatCurrentPrice(this.state.stake * this.state.price)}</span>
                                <span>Result = ?</span>
                            </div>
                        </div>
                        <div className="form-group">
                            <a className="site-url" href="http://www.URLtoinset.com">www.URLtoinset.com</a>
                            {this.getCurrentTimeFormatter()}
                        </div>
                        <div className="form-group">
                            <div className="main-menu-container">
                                <button
                                    className="btn btn-primary main-menu-btn"
                                    onClick={() => this.handleStateChanged("select")}>KEEP SELECTIONS
                                </button>
                                <button
                                    className="btn btn-primary main-menu-btn"
                                    onClick={() => this.props.clickHandler("list")}>MAIN MENU
                                </button>
                            </div>
                        </div>
                    </div>
                )
        }
    }

    render() {
        const AccaProductPanelCustomContent = this.getAccaProductPanelCustomContent();
        return (
            <div>
                {AccaProductPanelCustomContent}
            </div>
        )
    }
}