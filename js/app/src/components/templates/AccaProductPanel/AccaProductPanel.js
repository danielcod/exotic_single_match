import React from 'react';
import { bindAll } from 'lodash';
import MySelect from '../../atoms/MySelect';
import MyFormComponent from '../../atoms/MyFormComponent';
import AccaLegTable from '../../organisms/AccaLegTable';
import AccaNGoalsSlider from '../../atoms/AccaNGoalsSlider';
import AccaNLegsToggle from '../../organisms/AccaNLegsToggle';
import MyPaginator from '../../molecules/MyPaginator';
import AccaPanelTabs from '../../organisms/AccaPanelTabs';
import MatchTeamPanel from '../../organisms/MatchTeamPanel';
import MatchPanel from '../../organisms/MatchPanel';
/*
 nLegs is the state value for NLegsToggle
 nGoals is the state value for NGoalsSlider
 */
export default class AccaProductPanel extends React.PureComponent{
    constructor(props){
        super(props);
        this.state={
            selectedTab: "",
            product: {},
            bet: {},
            legs: {}
        }
        bindAll(this, ['initBet',  'handleProductChanged', 'handleTabClicked',
                        'handleLegAdded',  'handleLegRemoved', 'handleGoalsSliderChanged',
                        'incrementNLegs', 'decrementNLegs', 'formatPrice', 'formatCurrentPrice',
                        'updatePrice', 'sortLegs', 'applyPaginatorWindow', 'handlePaginatorClicked']);
    }
    componentWillMount(){
        const bet = this.initBet(this.props.products[0]);
        this.setState({
            selectedTab: "legs",
            product: this.props.products[0],
            bet: bet,
            legs: bet.legs

        })
    }
    initBet(product) {
        var initNLegs=function(product) {
            var toggle=product.betLegsToggle;
            return toggle ? toggle.minVal : 1;
        };
        var initNGoals=function(product) {
            var slider=product.betGoalsSlider;
            return slider ? slider.minVal : 0;
        };
        return {
            legs: [],
            nLegs: initNLegs(product),
            nGoals: initNGoals(product),
            currentPage: 0
        }
    }   

    handleTabClicked(tab) {        
        this.setState({selectedTab: tab.name});
    }

    handleLegAdded(newleg) {
        var state=this.state;
        state.bet.legs=state.bet.legs.filter(function(leg) {
            return leg.match.name!=newleg.match.name;
        });
        state.bet.legs.push(newleg);
        this.setState({bet: state.bet, legs: state.bet.legs});
        this.updatePrice();
    }

    handleLegRemoved(oldleg) {
        
        var state=this.state;
        state.bet.legs=state.bet.legs.filter(function(leg) {
            return leg.description!=oldleg.description;
        });
        state.bet.nLegs=Math.max(this.state.product.betLegsToggle.minVal, Math.min(state.bet.nLegs, state.bet.legs.length)); // NB
        this.setState({bet: state.bet, legs: state.bet.legs});
        this.updatePrice();
    }

    handleGoalsSliderChanged(value) {
        var state=this.state;
        if (value!=state.bet.nGoals) {
            state.bet.nGoals=value;
            this.setState( state.bet );
            this.updatePrice();
        }
    }

    incrementNLegs() {
        var state=this.state;
        if (state.bet.nLegs < state.bet.legs.length) {
            state.bet.nLegs+=1;
            this.setState( state.bet);
            this.updatePrice();
        }
    }

    decrementNLegs() {
        var state=this.state
        if (state.bet.nLegs > 1) {
            state.bet.nLegs-=1;
            this.setState( state.bet );
            this.updatePrice();
        }
    }

    formatPrice(value) {
        let result = 0;
        if (value < 2) {
            // return value.toFixed(3);
            result =  value.toFixed(2);
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
        if (price==undefined) {
            return "[...]";
        } else {
            return this.formatPrice(price);
        }
    }

    updatePrice() {
        if (this.state.bet.legs.length > 0) {
            // blank price, set price request id
            var state=this.state;
            state.price=undefined;
            var priceId=Math.round(Math.random()*1e10);
            state.priceId=priceId;
            this.setState({priceId: state.priceId});
            
            // fetch new price
            setTimeout(function() {
                var struct={
                    name: this.state.product.name,
                    legs: this.state.bet.legs,
                    nLegs: this.state.bet.nLegs,
                    nGoals: this.state.bet.nGoals,
                    bust: Math.round(Math.random()*1e10)
                };
                this.props.exoticsApi.fetchPrice(struct, function(struct) {                    
                    let state = this.state;
                    if (state.priceId==priceId) {
                        const price = struct.price;
			            this.setState({ price });
                        
                    }
                }.bind(this));
            }.bind(this), 500);
        }
    }

    sortLegs(legs) {
        var sortFn=function(i0, i1) {
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

    applyPaginatorWindow(items) {
        var rows=this.props.betLegsPaginator.rows;
        var i=this.state.bet.currentPage*rows;
        var j=(this.state.bet.currentPage+1)*rows;
        return items.slice(i, j);
    }

    handlePaginatorClicked(item) {
        var state=this.state;
        state.bet.currentPage=item.value;
        this.setState({bet: state.bet});
    }
    handleProductChanged(name, value) {  
        const product=this.props.products.filter(function(product) {
            return product.name==value;
        })[0];         
        const bet=this.initBet(product);        
        this.setState({product, bet, legs: bet.legs});           
    }
    render() {
        return (
            <div>
                <div style={{ marginTop: '20px', marginLeft: '50px', marginRight: "50px" }}>
                    <MyFormComponent
                        label= "Choose your Exotic Acca Type"
                        component={ <MySelect
                                        className="form-control btn-primary input-lg"
                                        options= {this.props.products.map(function(product) {
                                                        return {
                                                            label: product.label,
                                                            value: product.name
                                                        }
                                                    })
                                                }
                                        name= "product"
                                        changeHandler= {this.handleProductChanged}


                                    />
                                }
                    />
                </div>
                <p className= "help-block">
                    <i>
                        {this.state.product.description}
                    </i>
                </p>
                <AccaPanelTabs
                    tabs = { [
                            {
                                name: "legs",
                                label: "Leg Selector"
                            },
                            {
                                name: "bet",
                                label: "Your Bet"
                            }
                    ] }
                    selected= {this.state.selectedTab}
                    clickHandler =  {this.handleTabClicked}
                    legs= { this.state.legs }
                />
                {
                    (this.state.selectedTab=="bet") ?
                        <div>
                            {
                                (this.state.bet.legs.length!=0) ?
                                   <div>
                                        <div className= "form-group">
                                                <h3 className= "current-price text-center">
                                                    Current price:
                                                    <span id= "price">
                                                        { this.formatCurrentPrice(this.state.price)}
                                                    </span>
                                                </h3>
                                            </div>
                                        <MyFormComponent
                                            label= "Your Exotic Acca Legs"
                                            component= { <AccaLegTable
                                                            clickHandler= {this.handleLegRemoved}
                                                            legs= {this.applyPaginatorWindow(this.sortLegs(this.state.bet.legs))}
                                                            />
                                                        }
                                        />
                                        {(this.state.bet.legs.length > this.props.betLegsPaginator.rows) ?
                                                <MyPaginator
                                                    product= {this.props.betLegsPaginator}
                                                    data= {this.state.bet.legs}
                                                    clickHandler={ this.handlePaginatorClicked}
                                                    currentPage= {this.state.bet.currentPage}
                                                />
                                        : null}                                    

                                        {this.state.product.betLegsToggle ?
                                            <MyFormComponent
                                                label= {this.state.product.betLegsToggle.label}
                                                component={<AccaNLegsToggle
                                                                textFormatter={this.state.product.betLegsToggle.textFormatter}
                                                                nLegs= {this.state.bet.nLegs}
                                                                legs= {this.state.bet.legs}
                                                                clickHandlers={ {
                                                                    increment: this.incrementNLegs,
                                                                    decrement: this.decrementNLegs
                                                                }}/>}

                                            /> 
                                            : null}

                                            {this.state.product.betGoalsSlider ?
                                            <MyFormComponent
                                                label= {this.state.product.betGoalsSlider.label}
                                                component= {<AccaNGoalsSlider
                                                                id= "goalSlider"
                                                                min= {this.state.product.betGoalsSlider.minVal}
                                                                max= {this.state.product.betGoalsSlider.maxVal}
                                                                tickLabeller={ this.state.product.betGoalsSlider.tickLabeller}
                                                                value={ this.state.bet.nGoals}
                                                                changeHandler={ this.handleGoalsSliderChanged}
                                                            />}
                                            /> : null}

                                        <hr   style= {{borderColor: "#555"}}/>
                                        <div  className= "text-center"  style= {{marginBottom: "20px"}}>
                                            <button
                                                className="btn btn-primary"
                                                onClick={()=>  console.log("placing bet")}>Place Bet</button>
                                        </div>
                                    </div> :
                                    <h4  className= "text-center text-muted"
                                        style= {{marginLeft: '50px', marginRight: "50px"}}>
                                        Use the Leg Selector tab to add some selections
                                    </h4>
                            }
                        </div> : null
                }
                {
                    
                    (this.state.selectedTab == "legs") ? 
                        this.state.product.legsPanel === 'MatchPanel' ?
                            <MatchPanel
                                exoticsApi= { this.props.exoticsApi }
                                legs= { this.state.bet.legs }
                                paginator= { this.props.legsPaginator }
                                clickHandler= {{
                                    add: this.handleLegAdded,
                                    remove: this.handleLegRemoved
                                }}
                            />
                            :
                            <MatchTeamPanel 
                                exoticsApi= { this.props.exoticsApi }
                                legs= { this.state.bet.legs }
                                paginator= { this.props.legsPaginator }
                                clickHandler= {{
                                    add: this.handleLegAdded,
                                    remove: this.handleLegRemoved
                                }}
                            />
                        : null                     
                }
            </div>
        )

    }
}