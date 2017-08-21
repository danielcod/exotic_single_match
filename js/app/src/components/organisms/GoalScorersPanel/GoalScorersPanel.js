import React from 'react';
import { bindAll, isEmpty, findIndex, isEqual, remove } from 'lodash';
import GoalScorersTable from '../GoalScorersTable';
import MyPaginator from '../../molecules/MyPaginator';
import MyBetTab from '../../templates/MyBetPanel/MyBetTab';
import * as constant from  '../../constant';
import * as products from  '../../products';
import {formatPrice} from  '../../utils';
const productsName = products.matchComponents[4];
import * as struct from  '../../struct';
import s from './index.css';
import classNames from 'classnames';

export default class GoalScorersPanel extends React.PureComponent {
        constructor(props){
        super(props);
        bindAll(this, ['getCurrentBet', 'initState', 'clickTable', 'applyPaginatorWindow', 
                        'handlePaginatorClicked', 'handleTabClicked', 'getCurrentListPlayer',
                        'formatText', 'isCurrentItemClicked']);
        let bet = this.getCurrentBet(this.props); 
        if (isEmpty(bet)) bet = this.initState();
        const comands = this.props.match.name.split(' vs ');
        this.state={            
            price: 26.5,
            currentPage: bet.options.currentPage,
            selectedItem: bet.options.selectedItem,
            selectedTab: bet.options.selectedTab,
            textValue: bet.options.textValue,
            myBetTab : [
                {name: constant.HOME, label: comands[0]},
                {name: constant.AWAY, label: comands[1]}
            ],
            triggerState: false
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
        //const {selectedTab, sliderOptions, toogleValue, selectedBetTab, textValue, changes} = bet.options;   
         this.setState({ myBetTab });   
    }
    initState(){
        return {
            name: productsName,

            options:{
                selectedTab: constant.HOME,
                currentPage: 0,
                selectedItem: [],
                textValue:  [],
        }}
    }
    getCurrentBet(){

    }
    clickTable(id, key){        
        let {selectedItem, currentPage, selectedTab} = this.state;
        const triggerState = !this.state.triggerState;
        const {match} = this.props;
        const selected = {
            matchName: this.props.match.name,
            page:   currentPage, 
            item:   [id, key],
            selectedTeam:  selectedTab
        };
        const selectedInCurrentPage = this.getCurrentListPlayer();
        const index = this.isCurrentItemClicked(id, key, selectedInCurrentPage)
        if (index > -1){
            selectedItem.splice(index, 1);
        }else{
            if(this.isPlayerClicked(id, selectedInCurrentPage)){
                switch(key){
                    case constant.SELCTED_TWO:     
                        selectedItem = selectedItem.filter((value, idx)=> {
                            if (value.item[0] === id && value.matchName === match.name 
                                && value.selectedTeam === selectedTab && value.page === currentPage){
                                if (value.item[1] !== constant.SELCTED_THREE){
                                    return value;
                                }                              
                            }else{
                                return value;
                            }                                
                        });  
                        break;                   
                    case constant.SELCTED_THREE:                        
                        selectedItem = selectedItem.filter((value, idx)=> {  
                            if(value.matchName === match.name && value.selectedTeam === selectedTab 
                                && value.page === currentPage){
                                    if (value.item[0] !== id){ 
                                        return value;
                                    }
                            }else{
                                return value;
                            }                                                   
                        });
                        break;
                    case constant.SELCTED_FOUR:  
                        selectedItem = selectedItem.filter((value, idx)=> {                            
                            if (value.item[0] === id  && value.matchName === match.name 
                                && value.selectedTeam === selectedTab && value.page === currentPage){
                                if (value.item[1] !== constant.SELCTED_THREE
                                    && value.item[1] !== constant.SELCTED_FIVE){
                                    return value;
                                }                              
                            }else{
                                return value;
                            }                                
                        });               
                    case constant.SELCTED_FIVE:
                         selectedItem = selectedItem.filter((value, idx)=> {
                            if (value.item[0] === id){
                                if (value.item[1] !== constant.SELCTED_THREE
                                    && value.item[1] !== constant.SELCTED_FOUR){
                                    return value;
                                }                              
                            }else{
                                return value;
                            }                                
                        });
                        break;
                }                
            }
            selectedItem.push(selected);                         
        }       
        this.setState({selectedItem, triggerState });
        setTimeout(()=> this.formatText());
        setTimeout(()=> console.log('GoalScorersPanel', this.state.selectedItem), 0)
    }
    isCurrentItemClicked(id, key, selectedInCurrentPage){   
        const { selectedItem, selectedTab, currentPage} = this.state;
        const {match} = this.props;
        let selectedView = -1;
        selectedItem.map((value, idx)=>{
            selectedInCurrentPage.map(val=>{
                const is = isEqual(val, [id, key] );
                if(value.matchName === match.name && value.selectedTeam === selectedTab &&
                    value.page === currentPage && is){                    
                    selectedView = idx;
                }
            })          
        })        
        return selectedView;
    }

    isPlayerClicked(id, selectedInCurrentPage){
        const selectedView = findIndex(selectedInCurrentPage, (value) => { 
            return value[0] === id ; 
        });
        return selectedView  > -1 ? true : false;
    }
    formatText(){
        let  first = '', two = '', three = '', four = '';
        const {selectedItem, currentPage, selectedTab} = this.state;
        const {matches, match} = this.props;
        selectedItem.map((value, key)=>{
            const player = this.getPlayer(matches, value);  
            const selectedCountGoals = value.item[1];
            switch(selectedCountGoals){
                    case constant.SELCTED_TWO:     
                        first = first + ' ' + player.name + ',';
                        break;                   
                    case constant.SELCTED_THREE:                        
                        two = two + ' ' + player.name + ',';
                        break;
                    case constant.SELCTED_FOUR: 
                        three = three + ' ' + player.name + ',';
                         break;          
                    case constant.SELCTED_FIVE:
                         four = four + ' ' + player.name + ',';
                        break;
                }           
        });
        const textValue = [
            '\'1+\' - ' + first,
            '\'Anytime\' - ' + two,
            '\'2+\' -' + three,
            '\'3+\' - ' + four
        ];
        this.setState({textValue})        
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
        this.setState({selectedTab: tab.name, changes: true});
        //setTimeout(()=>this.formatText(), 0); 
    }
    getCurrentListPlayer(){                                               
        let selected = []
         const {selectedItem, currentPage, selectedTab}   = this.state;
        selectedItem.map((value)=>{     
            if (value.page === currentPage && value.selectedTeam === selectedTab
                && value.matchName === this.props.match.name)
                selected.push( value.item );
        });
        return selected;
    }
    render(){
        let squads =  [];    
        const {selectedItem, currentPage, selectedTab, textValue}   = this.state;
        const {match}  = this.props;
        const selectedInCurrentPage = this.getCurrentListPlayer();
        if (match) {           
            if (selectedTab === 'home') squads = match.squads[0];
            else squads = match.squads[1];
        }
        return(
            <div>
                <div className={s['wrap-mybettab']}>
                    <MyBetTab
                        tabs={this.state.myBetTab}
                        selected={this.state.selectedTab}
                        clickHandler={this.handleTabClicked}
                    />
                </div>
                <GoalScorersTable
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
                <div className={s['wrap-show-text']}>
                    {
                        textValue.map((value, key)=>{
                            return(
                                <div
                                    key = {key}
                                    className={s['show-text']}>
                                    {value}
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        );
    }
}


