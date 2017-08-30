import React from 'react';
import { bindAll, isEmpty, findIndex, isEqual, remove } from 'lodash';
import PlayerCardsTable from '../PlayerCardsTable';
import MyPaginator from '../../molecules/MyPaginator';
import MyBetTab from '../../templates/MyBetPanel/MyBetTab';
import * as constant from  '../../constant';
import * as products from  '../../products';
import {formatPrice} from  '../../utils';
const productsName = products.matchComponents[3];
import * as struct from  '../../struct';
import s from './index.css';
import classNames from 'classnames';

export default class PlayerCardsPanel extends React.PureComponent {
        constructor(props){
        super(props);
        bindAll(this, ['getCurrentBet', 'initState', 'clickTable', 'applyPaginatorWindow', 
                        'handlePaginatorClicked', 'handleTabClicked', 'getCurrentListPlayer',
                        'formatText', 'isCurrentItemClicked', 'handleCancel']);
        let bet = this.getCurrentBet(this.props); 
        if (isEmpty(bet)) bet = this.initState();
        const comands = this.props.match.name.split(' vs ');
        this.state={            
            price: bet.options.price,
            currentPage: bet.options.currentPage,
            selectedItem: bet.options.selectedItem,
            selectedTeam: bet.options.selectedTeam,
            textValue: bet.options.textValue,
            myBetTab : [
                {name: constant.HOME, label: comands[0]},
                {name: constant.AWAY, label: comands[1]}
            ],
            triggerState: false,
            changes: bet.options.changes
        }        
    }    
    componentWillReceiveProps(props){
        let bet = this.getCurrentBet(props);
        if (isEmpty(bet)) bet = this.initState();
        const comands = props.match.name.split(' vs ');
        const myBetTab = [
                {name: constant.HOME, label: comands[0]},
                {name: constant.AWAY, label: comands[1]}
            ]
        const {selectedTeam, currentPage, selectedItem, price, textValue, changes} = bet.options;   
         this.setState({ myBetTab, selectedTeam, currentPage, selectedItem, price, textValue, changes });   
    }
    initState(){
        return {
            name: productsName,
            match: this.props.match,
            options:{
                selectedTeam: constant.HOME,
                currentPage: 0,
                selectedItem: [],
                textValue:  [],
                price: 26.5,
                changes: false
        }}
    }
    getCurrentBet(props){
        const {bets, match} = props;
        let currentBet = {};
        bets.map(bet=>{            
            if (bet.name === productsName && bet.match.name === match.name){
                currentBet = bet;
            }
        });
        return currentBet;
    }
    setToParrenState(selectedItem, currentPage, selectedTeam, textValue){       
       const { price } = this.state;
       const bet = {
           name: productsName,
           match: this.props.match,
           options:{
               currentPage,
               selectedItem,
               selectedTeam,
               textValue,               
               price,
               changes: true
           }           
       }
       this.props.betResultMatch(bet);
    }
    clickTable(id, key){        
        let {selectedItem, currentPage, selectedTeam} = this.state;
        const triggerState = !this.state.triggerState;
        const {match, matches} = this.props;           
        const selected = {
            matchName: match.name,
            page:   currentPage, 
            item:   [id, key],
            selectedTeam:  selectedTeam
        };
        selected.player = this.getPlayer(matches, selected); 
        const selectedInCurrentPage = this.getCurrentListPlayer();
        const index = this.isCurrentItemClicked(id, key, selectedInCurrentPage)
        if (index > -1){
            selectedItem.splice(index, 1);
        }else{
            switch(key){
                    case constant.SELCTED_TWO:    //AnyTime                                         
                        selectedItem = selectedItem.filter((value, idx)=> {  
                            if(value.matchName === match.name && value.selectedTeam === selectedTeam 
                                && value.page === currentPage){
                                    if (value.item[0] !== id){ 
                                        return value;
                                    }
                            }else{
                                return value;
                            }                                                   
                        });                        
                        break;                   
                    case constant.SELCTED_THREE:       //1stGame 
                        selectedItem = selectedItem.filter((value, idx)=> {                                               
                            if (value.item[0] === id && value.matchName === match.name 
                                && value.selectedTeam === selectedTeam && value.page === currentPage){
                                if (value.item[1] === constant.SELCTED_FIVE ){
                                    return value;
                                }                              
                            }else{
                                 if (value.matchName !== match.name ||
                                    value.matchName === match.name && value.selectedTeam !== selectedTeam && value.item[1] !== constant.SELCTED_THREE ||
                                    value.matchName === match.name && value.selectedTeam === selectedTeam && value.item[1] !== constant.SELCTED_FOUR &&
                                    value.matchName === match.name && value.selectedTeam === selectedTeam && value.item[1] !== constant.SELCTED_THREE ){          
                                        return value;    
                                    }                
                            }                                
                        });  
                        break;
                    case constant.SELCTED_FOUR:  //1stTeam
                        selectedItem = selectedItem.filter((value, idx)=> {                            
                            if (value.item[0] === id  && value.matchName === match.name     
                                && value.selectedTeam === selectedTeam && value.page === currentPage){
                                if (value.item[1] === constant.SELCTED_FIVE){
                                    return value;
                                }                              
                            }else{
                                if (value.matchName !== match.name ||
                                    value.matchName === match.name && value.selectedTeam !== selectedTeam ||
                                    value.matchName === match.name && value.selectedTeam === selectedTeam && value.item[1] !== constant.SELCTED_FOUR &&
                                    value.matchName === match.name && value.selectedTeam === selectedTeam && value.item[1] !== constant.SELCTED_THREE ||
                                    value.matchName === match.name && value.selectedTeam === selectedTeam && value.item[1] !== constant.SELCTED_FOUR &&
                                    value.matchName === match.name && value.selectedTeam === selectedTeam && value.item[1] !== constant.SELCTED_THREE    ){          
                                        return value;    
                                    }   
                            }                                
                        });               
                    case constant.SELCTED_FIVE: //3+
                         selectedItem = selectedItem.filter((value, idx)=> {
                            if (value.item[0] === id && value.item[1] !== constant.SELCTED_TWO || value.item[0] !== id){                                
                                    return value;                                
                            }                              
                        });
                        break;
                }           
            selectedItem.push(selected);                         
        }            
        const textValue = this.formatText(selectedItem, currentPage, selectedTeam);
        this.setToParrenState(selectedItem, currentPage, selectedTeam, textValue);        
    }
    isCurrentItemClicked(id, key, selectedInCurrentPage){   
        const { selectedItem, selectedTeam, currentPage} = this.state;
        const {match} = this.props;
        let selectedView = -1;
        selectedItem.map((value, idx)=>{            
            const is = isEqual(value.item, [id, key] );
            if(value.matchName === match.name && value.selectedTeam === selectedTeam &&
                value.page === currentPage && is){                    
                selectedView = idx;
            }      
        })        
        return selectedView;
    }

    isPlayerClicked(id, selectedInCurrentPage){
        const selectedView = findIndex(selectedInCurrentPage, (value) => { 
            return value[0] === id ; 
        });
        return selectedView  > -1 ? true : false;
    }
    formatText(selectedItem, currentPage, selectedTeam){
        let  first = '', two = '', three = '', four = '', textValue = '';

       // const {selectedItem, currentPage, selectedTeam} = this.state;
        const {matches, match} = this.props;
        selectedItem.map((value, key)=>{
            const player = this.getPlayer(matches, value);  
            const selectedCountGoals = value.item[1];
            switch(selectedCountGoals){
                    case constant.SELCTED_TWO:     
                        first = first + ' ' + player.name;
                        break;                   
                    case constant.SELCTED_THREE:                        
                        two = two + ' ' + player.name;
                        break;
                    case constant.SELCTED_FOUR: 
                        three = three + ' ' + player.name;
                         break;          
                    case constant.SELCTED_FIVE:
                         four = four + ' ' + player.name;
                        break;
                }           
        });
        textValue = [
            '\'Any Card\'' +  ' - ' + first,
            '\'1st Game\''+ ' - ' + two,
            '\'1st Team\''+ ' - ' + three,
            '\'Sent Off\''+ ' - ' + four,

        ];       
        return textValue;        
    }
    getPlayer(matches, selected){
        let player = '';
        matches.map((val)=>{
            if (val.name === selected.matchName){
                if (constant.HOME === selected.selectedTeam){
                    const idPlayer = selected.item[0]+(selected.page)*8;
                    player = val.squads[0][idPlayer];
                }else if(constant.AWAY === selected.selectedTeam){
                    const idPlayer = selected.item[0]+(selected.page)*8;
                    player = val.squads[1][idPlayer];
                }
            }
        })
        return player;
    }
    handlePaginatorClicked(item) {
        const currentPage = item.value;        
        this.setState({currentPage});
    }
    applyPaginatorWindow(items) {
        var rows = constant.COUNT_PLAYER_ROWS;
        var i = this.state.currentPage * rows;
        var j = (this.state.currentPage + 1) * rows;
        return items.slice(i, j);
    }
    comparePrice(a, b) {
        const aPrice = parseFloat(a.price);
        const bPrice = parseFloat(b.price);
        if (aPrice > bPrice) return 1;
        if (aPrice < bPrice) return -1;
    }
    handleTabClicked(tab) {
        this.setState({selectedTeam: tab.name, changes: true});
    }
    getCurrentListPlayer(){                                               
        let selected = []
         const {selectedItem, currentPage, selectedTeam}   = this.state;
        selectedItem.map((value)=>{     
            if (value.page === currentPage && value.selectedTeam === selectedTeam
                && value.matchName === this.props.match.name)
                selected.push( value.item );
        });
        return selected;
    }
    handleCancel(){
         const props = this.props;
         const bet  = this.getCurrentBet(props);
         this.props.delBetfromBetsList(productsName, props.match.name);        
    }
    render(){
        let squads =  [];    
        const {selectedItem, currentPage, selectedTeam, textValue}   = this.state;
        const {match}  = this.props;
        const selectedInCurrentPage = this.getCurrentListPlayer();
        if (match) {           
            if (selectedTeam === 'home') squads = match.squads[0];
            else squads = match.squads[1];
        }
        return(
            <div>
                <div className={s['wrap-mybettab']}>
                    <MyBetTab
                        forTeamName={true}
                        tabs={this.state.myBetTab}
                        selected={this.state.selectedTeam}
                        clickHandler={this.handleTabClicked}
                    />
                </div>
                <PlayerCardsTable
                            squads={ this.applyPaginatorWindow(squads) }
                            legs= {this.props.legs}
                            clickHandler = {this.clickTable}
                            selected={selectedInCurrentPage}/>
                            {
                                (squads.length > constant.COUNT_PLAYER_ROWS) ?
                                    <MyPaginator
                                        product={{rows : constant.COUNT_PLAYER_ROWS}}
                                        data={squads}
                                        clickHandler={this.handlePaginatorClicked}
                                        currentPage={this.state.currentPage}
                                    />
                                    : null
                            }               
                <div className={classNames("bet-submit-btns", s['btn-group'])}>
                    <button
                        className="btn btn-primary bet-cancel-btn"
                        onClick={() => this.handleCancel()}>Clear                   </button>
                </div>
            </div>
        );
    }
}