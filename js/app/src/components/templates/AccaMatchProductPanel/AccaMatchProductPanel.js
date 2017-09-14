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
import StakePanel from '../../organisms/StakePanel';
import BTTSPanel from '../../organisms/BTTSPanel';
import MatchBetsPanel from '../../organisms/MatchBetsPanel';
import { Accordion, AccordionItem } from 'react-sanfona';
import * as data from '../../products';
import * as constant from '../../constant';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import classnames from 'classnames';
import FaAngleDoubleDown from 'react-icons/lib/fa/angle-double-down';
import FaAngleDoubleUp from 'react-icons/lib/fa/angle-double-up';
import s from './index.css';
import * as str from  '../../struct';
const PLAYER_CARDS = constant.PLAYER_CARDS_; 
const GOAL_SCORERS = constant.GOAL_SCORERS; 
const BTTS = constant.GOALS;

export default class AccaMatchProductPanel extends React.PureComponent{
    constructor(props){
        super(props);
        this.state={
            selectedTab: "legs",
            legs: [],           
            bets: [],
            sanfonaActiveItems: [],  
            openedStakePanel: false,
            showBets: [],
            stake: null,
            price: 10,
            textBetsInStake: null
            
        }
        bindAll(this, [ 'handleTabClicked', 'delBetfromBetsList',
                         'changeBlock', 'handleBuidMyOwn', 'betResultMatch',
                         'delTeamBetfromBetsList', 'handleBetRemoved', 'delPlayerFromBetList',
                         'clearBets', 'delFromBTTS']);
    }    
    componentWillReceiveProps(props){
        if(props.selectedTab === 'bet'){            
            this.setState({sanfonaActiveItems: []});
        }      
    }    
    handleTabClicked(tab) {        
        this.setState({selectedTab: tab.name});
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
        this.props.setBets(bets);
        setTimeout(()=> console.log(this.state.bets), 0)
    }
    delBetfromBetsList(oldBet){
        let {bets} = this.state;
        bets = bets.filter(bet=>{
            return (!Object.is(bet.name, oldBet.name) || !Object.is(bet.match.name, oldBet.match.name));
        });
        this.setState({bets});
        this.props.setBets(bets);
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
        this.props.setBets(bets);
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
        this.props.setBets(bets);
   }
   delFromBTTS(oldBet){
        let {bets} = this.state;       
       bets = bets.filter((bet)=>{           
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
        this.props.setBets(bets);
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
        //const buildMyOwn = !this.state.buildMyOwn;
        this.setState({bets: [], buildMyOwn: false, selectedTab: "legs", sanfonaActiveItems: [], openedStakePanel: false});
        this.props.handleToBrowse('browse');
        this.props.setBets();
    }
    openStakePanel =(showBets, stake, price, textBetsInStake)=>{
        const {buildMyOwn} = this.state;
        this.setState({openedStakePanel: true, buildMyOwn: false, showBets, stake, /* price, */ textBetsInStake });
        this.props.clickHandler("bet");
    }
    returnToBetsPanel = ()=>{
        this.setState({openedStakePanel: false, buildMyOwn: true});
        this.props.handleToBrowse('build');
    }
    
     render() {
         const { legs, sanfonaActiveItems, bets} = this.state;
         const {openedStakePanel, showBets, stake, price, textBetsInStake, buildMyOwn} = this.state;
         const {selectedTab, matches, match} = this.props;
         const renderAngle = (index, title)=>{
            let opened = false;
            for (let i=0; i< sanfonaActiveItems.length; i++){
                if (sanfonaActiveItems[i] === index){
                    opened = true;
                }
            }
            const darkOrLight = opened ? '-dark.png' : '-light.png'
            const imgSrc = 'img/' + title + darkOrLight;
            return ((opened) ? 
                        <div className="react-sanfona-item-wrap">
                           <div className = {s['title-img']}>
                                <img  style={{display: 'block'}} src={'img/' + title + '-dark.png'}/>
                                <img  style={{display: 'none'}} src={'img/' + title + '-light.png'}/>
                            </div>  
                            <div className="react-sanfona-item-title" style={{cursor: 'pointer', margin: '0px'}}>
                                <div className={s["wrap-item-title"]}>
                                    <div className={s['sanfona-title']}>{title}</div>
                                    <div className={s['b-angle']}>
                                        <FaAngleDoubleUp/>
                                    </div>  
                                </div>
                            </div>
                        </div>                       
                        :
                        <div className="react-sanfona-item-wrap">
                            <div className = {s['title-img']}>
                                <img  style={{display: 'none'}} src={'img/' + title + '-dark.png'}/>
                                <img  style={{display: 'block'}} src={'img/' + title + '-light.png'}/>
                            </div>                            
                            <div className="react-sanfona-item-title" style={{cursor: 'pointer', margin: '0px'}}>
                                 <div className={s["wrap-item-title"]}>
                                    <div className={s['sanfona-title']}>{title}</div>
                                    <div className={s['b-angle']}>
                                        <FaAngleDoubleDown/>
                                    </div>  
                                </div>
                            </div>
                        </div>
                    );            
         }
        return (
            <div>
                { selectedTab==="bet" ?
                        openedStakePanel ?
                            <StakePanel
                                showBets={showBets}
                                stake = {stake}
                                price = {price}
                                textBetsInStake= {textBetsInStake}
                                toMainMenu = {this.clearBets}
                                returnToBetsPanel={this.returnToBetsPanel}
                                match = {match}
                            />
                            :
                            <MatchBetsPanel
                                        price={this.state.price}
                                        handleBetRemoved={this.handleBetRemoved}
                                        bets= { bets }    
                                        match={ match } 
                                        clearBets={this.clearBets}
                                        openStakePanel={this.openStakePanel}
                                        returnToBetsPanel={this.returnToBetsPanel}
                                        /> 
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
                                            changeHandler= {this.props.handleMatchChanged}
                                            match={match}


                                        />
                                    }
                            />                          
                
                            <Accordion onChange={this.changeBlock} activeItems={sanfonaActiveItems}>
                                {data.matchComponents.map((item, index) => {                               
                                    return (                                    
                                            <AccordionItem  
                                                title={ renderAngle(index, item)}  key={item}
                                                >                                                                                                                                  
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
                                                        <BTTSPanel
                                                            matches={str.MatchResultStruct}
                                                            match={match}
                                                            betResultMatch={this.betResultMatch}                                                            
                                                            bets={this.state.bets}
                                                            delBetfromBetsList={this.delBetfromBetsList}
                                                        /> : null} 
                                                    {index ===  2 ? 
                                                        <GoalScorersPanel 
                                                            matches={matches}
                                                            match={match}
                                                            betResultMatch={this.betResultMatch}                                                            
                                                            bets={this.state.bets}
                                                            delBetfromBetsList={this.delTeamBetfromBetsList}
                                                        /> : null} 
                                                    {index ===  3 ?
                                                        <CornersPanel
                                                            matches={str.MatchResultStruct}
                                                            match={match}
                                                            betResultMatch={this.betResultMatch}                                                            
                                                            bets={this.state.bets}
                                                            delBetfromBetsList={this.delBetfromBetsList}
                                                            />
                                                            : null} 
                                                    {index ===  4 ? 
                                                        <TeamCardsPanel
                                                            matches={str.MatchResultStruct}
                                                            match={match}
                                                            betResultMatch={this.betResultMatch}                                                            
                                                            bets={this.state.bets}
                                                            delBetfromBetsList={this.delBetfromBetsList}
                                                        /> 
                                                        : null} 
                                                    {index ===  5 ? 
                                                    < PlayerCardsPanel 
                                                        matches={matches}
                                                        match={match}
                                                        betResultMatch={this.betResultMatch}                                                            
                                                        bets={this.state.bets}
                                                        delBetfromBetsList={this.delTeamBetfromBetsList}
                                                    />
                                                        : null} 
                                            </AccordionItem>
                                    );
                                })}
                            </Accordion>                          
                        </div>                       
            
                }
                
               </div>
        )
     }
}