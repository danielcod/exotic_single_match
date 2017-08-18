import React from 'react';
import { bindAll, isEmpty, concat } from 'lodash';
import GoalScorersTable from '../GoalScorersTable';
import MyPaginator from '../../molecules/MyPaginator';
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
        bindAll(this, ['getCurrentBet', 'initState', 'clickTable', 'applyPaginatorWindow', 'handlePaginatorClicked']);
        let bet = this.getCurrentBet(this.props); 
        if (isEmpty(bet)) bet = this.initState();
        this.state={            
            price: 26.5,
            currentPage: bet.options.currentPage,
            selectedItem: bet.options.selectedItem
        }        
    }    
    componentWillReceiveProps(){

    }
    initState(){
        return {
            name: productsName,
            options:{
                currentPage: 0,
                selectedItem: [],
                text: ' ',
        }}
    }
    getCurrentBet(){

    }
    clickTable(id, key){        
        const {selectedItem, currentPage} = this.state;
        const selected = {};
        selected[currentPage] = [id, key];
        selectedItem.push(selected);         
        this.setState({selectedItem: selectedItem});
        setTimeout(()=> console.log('GoalScorersPanel', this.state.selectedItem), 0)
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
    render(){
        let squads =  [], selected = [];    
        const {selectedItem, currentPage}   = this.state;
        const selectedInCurrentPage = selectedItem
                                        .filter((value)=>{                                           
                                            value[currentPage];
                                        })
                                         .map((value)=>{                                                
                                            selected.push(value[currentPage]);
                                        });
       
        if (this.props.match) {
            const homeTeam  = this.props.match.squads[0].map(value=> {                
                const first = value.name.slice(0, 4);
                if (first !== constant.FROM_HOME) value.name =  constant.FROM_HOME + value.name;
                return value;
            });
            const awayTeam  = this.props.match.squads[1].map(value=>{ 
                const first = value.name.slice(0, 4);
                if (first !== constant.FROM_AWAY) value.name =  constant.FROM_AWAY + value.name;
                return value;    
            });
            squads = concat(homeTeam, awayTeam);
        }
        return(
            <div>
                <GoalScorersTable
                            squads={ this.applyPaginatorWindow(squads) }
                            legs= {this.props.legs}
                            clickHandler = {this.clickTable}
                            selected={selected}/>
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
            </div>
        );
    }
}


