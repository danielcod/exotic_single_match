import React from 'react';
import { bindAll } from 'lodash';
import * as constant from  '../../constant';
import classNames from 'classnames';
import * as s from './index.css';

export default class PlayerCardsTable extends React.PureComponent {
    render(){
        const { selectedItem, match } = this.props;
        const   row = selectedItem[0], 
                column = selectedItem[1];
        let BTTS = {};
        if (match) BTTS = match.BTTS;
        return(
            <div className={s['cornersTable']}>
                <div className={classNames('row')}> 
                    <div className={ classNames( s['table-title'], 'col-xs-12', 'col-md-12') }>                            
                            Both Team To Score?
                        </div>
                </div>
                    <div className={classNames('row', s['row-change-btn'])}>   
                        
                        <div className={ classNames('col-xs-4', 'col-md-4', s['column-tile']) }>                            

                        </div>
                        <div className={ classNames('col-xs-4', 'col-md-4', s['column-tile'])}>
                            YES
                        </div>
                        <div className={ classNames( 'col-xs-4', 'col-md-4', s['column-tile'])}>
                            NO
                        </div>
                    </div> 
                    {
                        BTTS.map((value, key)=>{
                            return(
                                <div key ={key} className={classNames('row', s['row-change-btn'])}>                    
                                    <div className={ classNames(s['first-item'], 'col-xs-4', 'col-md-4') }
                                        >
                                        {value.name}
                                    </div>
                                    <div className={(row === key && column === constant.SELCTED_FIRST) ? 
                                                        classNames(s['item'], s['selected-bet-tab'], 'col-xs-4', 'col-md-4') 
                                                        : classNames(s['item'], s['not-selected-bet-tab'], 'col-xs-4', 'col-md-4')}
                                        onClick={()=>this.props.changeStateByTab(key, constant.SELCTED_FIRST, value.YES)}>
                                        {value.YES}
                                    </div>
                                    <div className={(row === key && column === constant.SELCTED_TWO) ? 
                                                        classNames(s['item'], s['selected-bet-tab'], 'col-xs-4', 'col-md-4') 
                                                        : classNames(s['item'], s['not-selected-bet-tab'], 'col-xs-4', 'col-md-4')}
                                        onClick={()=>this.props.changeStateByTab(key, constant.SELCTED_TWO, value.NO)}>
                                        {value.NO}
                                    </div>
                                </div>
                            );
                        })
                    }                   
                </div>
        );
    }
}