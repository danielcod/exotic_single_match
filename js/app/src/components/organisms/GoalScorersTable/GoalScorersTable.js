import React from 'react';
import { bindAll, isEmpty, isEqual} from 'lodash';
import {formatPrice} from  '../../utils';
import MatchPriceCell from '../../atoms/MatchPriceCell';
import * as s from './index.css';


export default class GoalScorersTable extends React.PureComponent {
        constructor(props){
        super(props);   
        this.state={           
            selected: this.props.selected
        } 
        bindAll(this, ['choicePrice']);    
    }   
    componentWillReceiveProps(props){
        const selected = props.selected;
        this.setState({selected});        
    }
    choicePrice(id, key){
        this.props.clickHandler(id, key);
        this.setState({selected: [id, key]})
    }
    render(){
        const {squads, selected} = this.props;
        console.log(selected)
        const row = (player, id)=>{
                            let row = [];                            
                            for(let i = 0; i < 5; i++){    
                                let selected; 
                                this.state.selected.map(value=> {
                                    let worked = false;
                                    if (!worked) selected = isEqual(value, [id, i] )
                                    if (selected) worked = true; 
                                       //console.log(value)
                                }); 
                                             //console.log(selected, this.state.selected)                              
                                if (i === 0){                                                        
                                    row.push(
                                            <td key={i} className={s['name_td']}>
                                                <span className='match-name'>
                                                    { player.name} 
                                                </span> 
                                            </td>
                                        )
                                }else{
                                    row.push(
                                        <MatchPriceCell 
                                            key={i}
                                            value={formatPrice(player.price)}
                                            selected={selected}
                                            clickHandler={()=>this.choicePrice(id, i)}                                        
                                        />
                                    )
                                }
                                //console.log(selected, id, i, row) 
                            }
                            
                            return row;
                        }
        return(
            <table className= "table table-condensed table-striped table-not-bordered">
                <thead>
                    <tr>
                        {
                            ["", "1st", "1+", "2+", "3+"].map(function(label, key) {
                                return (
                                    <th key={key} className= "text-center" style={{paddingBottom: "5px"}}>
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
