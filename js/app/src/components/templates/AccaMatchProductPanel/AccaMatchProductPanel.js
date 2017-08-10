import React from 'react';
import { bindAll } from 'lodash';
import MySelect from '../../atoms/MySelect';
import MyFormComponent from '../../atoms/MyFormComponent';
import AccaPanelTabs from '../../organisms/AccaPanelTabs';
import MatchResult from '../../organisms/MatchResult';
import { Accordion, AccordionItem } from 'react-sanfona';
import * as data from '../../products';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import classnames from 'classnames';
import s from './index.mod.scss';
import * as str from  '../../struct';

export default class AccaMatchProductPanel extends React.PureComponent{
    constructor(props){
        super(props);
        this.state={
            matches: [],
            match: {},
            selectedTab: "legs",
            legs: []
        }
        bindAll(this, ['handleMatchChanged', 'handleTabClicked']);
    }
    componentWillMount(){      
        this.props.exoticsApi.fetchMatches(function(struct) {
            let {matches, leagues} = this.state;
            const cutoff=new Date();
            matches=struct.filter(function(match) {
                return new Date(match.kickoff) > cutoff;
            }).sort(this.matchSorter);
            
            this.setState({
                matches: matches,
                match: matches[0]
            });
        }.bind(this));	          
    }
    handleTabClicked(tab) {        
        if (tab.name == "bet") {
            this.props.clickHandler("Bet");
        } else {
            this.props.clickHandler("Edit");
        }
        this.setState({selectedTab: tab.name});

    }
    handleMatchChanged(name, value) {  
        const match = this.state.matches.filter(function(product) {
            return product.name==value;
        })[0];         
        this.setState({match});           
    }
     handleLegAdded(newleg) {
          console.log('handleLegAdded', newleg)
        /*var state=this.state;
        state.bet.legs=state.bet.legs.filter(function(leg) {
            return leg.match.name!=newleg.match.name;
        });
        state.bet.legs.push(newleg);
        this.setState({bet: state.bet, legs: state.bet.legs});
        this.updatePrice();*/
    }

    handleLegRemoved(oldleg) {
         console.log('handleLegRemoved', oldleg)
        /*var state=this.state;
        state.bet.legs=state.bet.legs.filter(function(leg) {
            return leg.description!=oldleg.description;
        });
        state.bet.nLegs=Math.max(this.state.product.betLegsToggle.minVal, Math.min(state.bet.nLegs, state.bet.legs.length)); // NB
        this.setState({bet: state.bet, legs: state.bet.legs});
        this.updatePrice();*/
    }
     render() {
         const {matches, match, legs} = this.state;
        return (
            <div>
                <MyFormComponent
                        label= "Choose your Match Exotics"
                        component={ <MySelect
                                        className="form-control btn-primary input-lg"
                                        options= {matches.map(function(product) {
                                                        return {
                                                            label: product.label,
                                                            value: product.name
                                                        }
                                                    })
                                                }
                                        name= "match"
                                        changeHandler= {this.handleMatchChanged}


                                    />
                                }
                    />
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
                    (this.state.selectedTab==="bet") ?
                        <div>
                            not
                        </div>
                        :
                        <Accordion>
                            {data.matchComponents.map((item, index) => {
                                return (
                                    <AccordionItem  
                                        title={ item } slug={item} key={item}>
                                        <div>                                                                                    
                                            {index ===  0 ? 
                                            <MatchResult 
                                                matches={str.MatchResultStruct}
                                                match={match}
                                                legs={legs}
                                                clickHandler = {{
                                                    add: this.handleLegAdded,
                                                    remove: this.handleLegRemoved
                                                }}/> : null}  
                                            {index ===  1 ? <p>{item}</p> : null} 
                                            {index ===  2 ? <p>{item}</p> : null} 
                                            {index ===  3 ? <p>{item}</p> : null} 
                                            {index ===  4 ? <p>{item}</p> : null} 
                                            {index ===  5 ? <p>{item}</p> : null} 
                                        </div>
                                    </AccordionItem>
                                );
                            })}
                        </Accordion>
                    }
            </div>
        )
     }
}