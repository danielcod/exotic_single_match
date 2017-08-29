import React from 'react';
import { bindAll, eq, isEqual } from 'lodash';
import MySelect from '../../atoms/MySelect';
import MyFormComponent from '../../atoms/MyFormComponent';
import AccaMatchPanelTabs from '../../organisms/AccaMatchPanelTabs';
import MatchResult from '../../organisms/MatchResult';
import CornersPanel from '../../organisms/CornersPanel';
import TeamCardsPanel from '../../organisms/TeamCardsPanel';
import GoalScorersPanel from '../../organisms/GoalScorersPanel';
import PlayerCardsPanel from '../../organisms/PlayerCardsPanel';
import BTTSPanel from '../../organisms/BTTSPanel';
import MatchBetsPanel from '../../organisms/MatchBetsPanel';
import {matchSorter} from '../../utils'
import { Accordion, AccordionItem } from 'react-sanfona';
import * as data from '../../products';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import classnames from 'classnames';
import FaAngleDoubleDown from 'react-icons/lib/fa/angle-double-down';
import FaAngleDoubleUp from 'react-icons/lib/fa/angle-double-up';
import s from './index.css';
import * as str from  '../../struct';
const PLAYER_CARDS = data.matchComponents[3];
const GOAL_SCORERS = data.matchComponents[4];
const BTTS = data.matchComponents[5];

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
                         'changeBlock', 'handleBuidMyOwn', 'betResultMatch',
                         'delTeamBetfromBetsList', 'handleBetRemoved', 'delPlayerFromBetList',
                         'clearBets']);
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
    delTeamBetfromBetsList(productsName, matchName){
        let {bets} = this.state;
        setTimeout(()=>console.log('delTeamBetfromBetsList', bets), 0);
        bets = bets.filter((bet)=>{
            if (bet.name === productsName && bet.match.name !== matchName ||
                bet.name !== productsName)
                return bet;
        });
        this.setState({bets});
        setTimeout(()=>console.log('delTeamBetfromBetsList', bets), 0);
    }
   handleBetRemoved(bet){
       if( BTTS === bet.name){
            this.delFromBTTS(bet);
       }else if( PLAYER_CARDS === bet.name || GOAL_SCORERS === bet.name){
            this.delPlayerFromBetList(bet);
       }else{
           this.delBetfromBetsList(bet);
       }

   }
   delPlayerFromBetList(oldBet){
       let {bets} = this.state;       
       bets = bets.map((bet)=>{           
            if (bet.name === oldBet.name && bet.match.name === oldBet.match.name){
                const selectedItem = bet.options.selectedItem.filter(value=>{                   
                    if (oldBet.selectedItem.selectedTeam != value.selectedTeam ||
                        oldBet.selectedItem.selectedTeam === value.selectedTeam &&
                        oldBet.selectedItem.page != value.page ||
                        oldBet.selectedItem.selectedTeam === value.selectedTeam &&
                        oldBet.selectedItem.page === value.page &&
                        !isEqual(oldBet.selectedItem.item, value.item ))
                        return value;
                });
                bet.options.selectedItem = selectedItem;
                return bet;
            }
            return bet;
        });
        this.setState({bets});
   }
   delFromBTTS(oldBet){
        let {bets} = this.state;       
       bets = bets.filter((bet)=>{    
            debugger       
            if (bet.name === oldBet.name && bet.match.name === oldBet.match.name){
                if (oldBet.options.changedTab){
                    bet.options.changedTab = !oldBet.options.changedTab;
                    bet.options.textTotalGoals = '';
                    bet.options.sliderValue = 3;
                    bet.options.selectedTab= {
                        name: "",
                        number: null
                    }
                }
                if (oldBet.options.changedTable){
                    bet.options.changedTable = !oldBet.options.changedTable;
                    bet.options.selectedItem  = [];
                    bet.options.textBTTS = '';
                }
                //
                return bet;
            }
            return bet;
        });
        this.setState({bets});
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
    clearBets(){
        const buildMyOwn = !this.state.buildMyOwn;
        this.setState({bets: [], buildMyOwn, selectedTab: "legs", sanfonaActiveItems: []});
        this.props.clickHandler("browse");
    }

     render() {
         const {matches, match, legs, sanfonaActiveItems, bets} = this.state;
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
                            <AccaMatchPanelTabs
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
                                bets= { bets }    
                                match={ match }                            
                            />
                            {
                            (this.state.selectedTab==="bet") ?                                
                                <MatchBetsPanel
                                    price={this.state.price}
                                    handleBetRemoved={this.handleBetRemoved}
                                    bets= { bets }    
                                    match={ match } 
                                    clearBets={this.clearBets}
                                    />                               
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
                                                        {index ===  3 ? 
                                                        < PlayerCardsPanel 
                                                            matches={matches}
                                                            match={match}
                                                            betResultMatch={this.betResultMatch}                                                            
                                                            bets={this.state.bets}
                                                            delBetfromBetsList={this.delTeamBetfromBetsList}
                                                        />
                                                            : null} 
                                                        {index ===  4 ? 
                                                            <GoalScorersPanel 
                                                                matches={matches}
                                                                match={match}
                                                                betResultMatch={this.betResultMatch}                                                            
                                                                bets={this.state.bets}
                                                                delBetfromBetsList={this.delTeamBetfromBetsList}
                                                            /> : null} 
                                                        {index ===  5 ? 
                                                            <BTTSPanel
                                                                matches={str.MatchResultStruct}
                                                                match={match}
                                                                betResultMatch={this.betResultMatch}                                                            
                                                                bets={this.state.bets}
                                                                delBetfromBetsList={this.delBetfromBetsList}
                                                            /> : null} 
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