import React from 'react';
import { bindAll, isEmpty, isEqual, findIndex} from 'lodash';
import {formatPrice} from  '../../utils';
import MatchPriceCell from '../../atoms/MatchPriceCell';
import classNames from 'classnames';
import * as s from './index.css';


export default class GoalScorersTable extends React.PureComponent {
        constructor(props){
        super(props);   
        
        bindAll(this, ['choicePrice', 'isSelectedItem']);    
    }   
    componentWillReceiveProps(props){
        const selected = props.selected;               
    }
    choicePrice(id, key){
        this.props.clickHandler(id, key);       
    }
    isSelectedItem(id, i){
        const {selected} = this.props; 
        const selectedView = findIndex(selected, (value) => { return isEqual(value, [id, i] ); });
        return (selectedView > -1 ? true : false);
    }
    render(){
        const {squads} = this.props;
        const row = (player, id)=>{
                            let row = [];                            
                            for(let i = 0; i < 5; i++){
                                if (i === 0){                                                        
                                    row.push(
                                            <td key={i} className={s['name_td']}>
                                                <span className='match-name'>
                                                    { player.name} 
                                                </span> 
                                            </td>
                                        )
                                }else{
                                    const selected = this.isSelectedItem(id, i);
                                    row.push(
                                        <MatchPriceCell 
                                            key={i}
                                            value={formatPrice(player.price)}
                                            selected={selected}
                                            clickHandler={()=>this.choicePrice(id, i)}                                        
                                        />
                                    )
                                }
                                
                            }
                            
                            return row;
                        }
        return(
            <table className= {classNames(s[''], "table table-condensed table-striped table-not-bordered")}>
                <thead>
                    <tr>
                        {
                            ["", "1st", "Any time", "2+", "3+"].map(function(label, key) {
                                return (
                                    <th key={key} className={classNames(s['player-table-header-item'], "text-center")}>
                                        {label}
                                    </th>
                                )
                            })   
                        }
                    </tr>                    
                </thead>
                <tbody>
                    {
                                                                                                                                   
                            squads.map((player, key)=> {
                                return(
                                        <tr key={key} className= "text-center match"> 
                                            {row(player, key)}                                            
                                        </tr>
                                    )                                   
                                })   
                            
                    }
                </tbody>
            </table>
        );
    }
}
