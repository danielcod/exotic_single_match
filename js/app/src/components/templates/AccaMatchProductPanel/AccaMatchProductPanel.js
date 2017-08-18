import React from 'react';
import { bindAll, eq } from 'lodash';
import MySelect from '../../atoms/MySelect';
import MyFormComponent from '../../atoms/MyFormComponent';
import AccaPanelTabs from '../../organisms/AccaPanelTabs';
import MatchResult from '../../organisms/MatchResult';
import CornersPanel from '../../organisms/CornersPanel';
import TeamCardsPanel from '../../organisms/TeamCardsPanel';
import GoalScorersPanel from '../../organisms/GoalScorersPanel';
import {matchSorter} from '../../utils'
import { Accordion, AccordionItem } from 'react-sanfona';
import * as data from '../../products';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import classnames from 'classnames';
import FaAngleDoubleDown from 'react-icons/lib/fa/angle-double-down';
import FaAngleDoubleUp from 'react-icons/lib/fa/angle-double-up';
import s from './index.css';
import * as str from  '../../struct';

export default class AccaMatchProductPanel extends React.PureComponent{
    constructor(props){
        super(props);
        this.state={
            matches: [],
            match: {},
            selectedTab: "legs",
            legs: [],           
            bets: [],
            sanfonaActiveItems: [],            
            
        }
        bindAll(this, ['handleMatchChanged', 'handleTabClicked', 'delBetfromBetsList',
                         'changeBlock', 'handleBuidMyOwn', 'betResultMatch']);
    }

    componentWillMount(){      
        this.props.exoticsApi.fetchMatches(function(struct) {
            let {matches, leagues} = this.state;
            const cutoff=new Date();
            
            matches=struct.filter(function(match) {
                return new Date(match.kickoff) > cutoff;
            }).sort(matchSorter);
            this.setState({
                matches: matches,
                match: matches[0]
            });
        }.bind(this));	          
    }
    handleTabClicked(tab) {        
        /*if (tab.name == "bet") {
            this.props.clickHandler("Bet");
        } else {
            this.props.clickHandler("Edit");
        }*/
        this.setState({selectedTab: tab.name});

    }
    handleMatchChanged(name, value) {  
        const match = this.state.matches.filter(function(product) {
            return product.name==value;
        })[0];   
        this.setState({match});           
    }
    betResultMatch(nBet){
        let {bets} = this.state;
        let changed = false;
        bets = bets.map(bet=>{     
            if (bet.name === nBet.name && bet.match.name === nBet.match.name){
                bet.options = nBet.options;
                changed = true;                
            }
            return bet;   
        });
        if (changed === false)   bets.push(nBet);
        this.setState({bets});
        setTimeout(()=> console.log(this.state.bets), 0)
    }
    delBetfromBetsList(oldBet){
        let {bets} = this.state;
        bets = bets.filter(bet=>{
            return (!Object.is(bet.name, oldBet.name) || !Object.is(bet.match.name, oldBet.match.name));
        });
        this.setState({bets});
        setTimeout(()=> console.log(this.state.bets), 0)
    }
    delTeamBetfromBetsList(){
        console.log('delTeamBetfromBetsList');
    }
   
    changeBlock(value){
        const sanfonaActiveItems = value.activeItems;
        this.setState({ sanfonaActiveItems });
    }
    handleBuidMyOwn(){
        const buildMyOwn = !this.state.buildMyOwn;
        this.setState({buildMyOwn});
        this.props.clickHandler("edit");
    }
     render() {
         const {matches, match, legs, sanfonaActiveItems} = this.state;
         const renderAngle = (index, title)=>{
            let opened = false;
            for (let i=0; i< sanfonaActiveItems.length; i++){
                if (sanfonaActiveItems[i] === index){
                    opened = true;
                }
            }                 
            return ((opened) ? 
                                <h3 className="react-sanfona-item-title" style={{cursor: 'pointer', margin: '0px'}}>
                                    {title}
                                    <div className={s['b-angle']}>
                                        <FaAngleDoubleUp/>
                                    </div>  
                                </h3>
                                :
                                <h3 className="react-sanfona-item-title" style={{cursor: 'pointer', margin: '0px'}}>
                                   {title}
                                    <div className={s['b-angle']}>
                                        <FaAngleDoubleDown/>
                                    </div>
                                </h3>);            
         }
        return (
            <div>
                { !this.state.buildMyOwn ?
                    <button className="btn btn-primary" style={{float: 'right'}}
                        onClick={this.handleBuidMyOwn}
                        >Build My Own</button>
                        :
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
                                <Accordion onChange={this.changeBlock} activeItems={sanfonaActiveItems}>
                                    {data.matchComponents.map((item, index) => {                               
                                        return (
                                        
                                                <AccordionItem  
                                                    title={ renderAngle(index, item)}  key={item}
                                                    >
                                                    <div>                                                                                    
                                                        {index ===  0 ? 
                                                            <MatchResult 
                                                                matches={str.MatchResultStruct}
                                                                match={match}
                                                                legs={legs}
                                                                betResultMatch={this.betResultMatch}                                                            
                                                                bets={this.state.bets}
                                                                delBetfromBetsList={this.delBetfromBetsList}                                                                                                      
                                                                /> : null}  
                                                        {index ===  1 ?
                                                            <CornersPanel
                                                                matches={str.MatchResultStruct}
                                                                match={match}
                                                                betResultMatch={this.betResultMatch}                                                            
                                                                bets={this.state.bets}
                                                                delBetfromBetsList={this.delBetfromBetsList}
                                                                />
                                                             : null} 
                                                        {index ===  2 ? 
                                                            <TeamCardsPanel
                                                                matches={str.MatchResultStruct}
                                                                match={match}
                                                                betResultMatch={this.betResultMatch}                                                            
                                                                bets={this.state.bets}
                                                                delBetfromBetsList={this.delBetfromBetsList}
                                                            /> 
                                                            : null} 
                                                        {index ===  3 ? <p>{item}</p> : null} 
                                                        {index ===  4 ? 
                                                            <GoalScorersPanel 
                                                                match={match}
                                                                betResultMatch={this.betResultMatch}                                                            
                                                                bets={this.state.bets}
                                                                delBetfromBetsList={this.delTeamBetfromBetsList}
                                                            /> : null} 
                                                        {index ===  5 ? <p>{item}</p> : null} 
                                                    </div>           
                                                </AccordionItem>
                                        );
                                    })}
                                </Accordion>
                            }
                        </div>                       
            
                }
                
               </div>
        )
     }
}