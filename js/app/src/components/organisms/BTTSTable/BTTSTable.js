import React from 'react';
import { bindAll } from 'lodash';
import * as constant from  '../../constant';
import classNames from 'classnames';
import * as s from './index.css';

export default class PlayerCardsTable extends React.PureComponent {
    render(){
        const { selectedItem } = this.props;
        const   row = selectedItem[0], 
                column = selectedItem[1];
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
                    <div className={classNames('row', s['row-change-btn'])}>                    
                        <div className={ classNames(s['item'], 'col-xs-4', 'col-md-4') }
                            >
                            {constant.FULL_MATCH}
                        </div>
                        <div className={(row === 0 && column === 0) ? 
                                            classNames(s['item'], s['selected-bet-tab'], 'col-xs-4', 'col-md-4') 
                                            : classNames(s['item'], s['not-selected-bet-tab'], 'col-xs-4', 'col-md-4')}
                            onClick={()=>this.props.changeStateByTab(constant.SELCTED_FIRST, constant.SELCTED_FIRST)}>
                            
                        </div>
                        <div className={(row === 0 && column === 1) ? 
                                            classNames(s['item'], s['selected-bet-tab'], 'col-xs-4', 'col-md-4') 
                                            : classNames(s['item'], s['not-selected-bet-tab'], 'col-xs-4', 'col-md-4')}
                            onClick={()=>this.props.changeStateByTab(constant.SELCTED_FIRST, constant.SELCTED_TWO)}>
                            
                        </div>
                    </div>
                    <div className={classNames('row', s['row-change-btn'])}>
                        <div className={classNames(s['item'], 'col-xs-4', 'col-md-4')}
                            >
                            {constant.BOTH_HALVES}
                        </div>
                        <div className={(row === 1 && column === 0) ? 
                                            classNames(s['item'], s['selected-bet-tab'], 'col-xs-4', 'col-md-4') 
                                            : classNames(s['item'], s['not-selected-bet-tab'], 'col-xs-4', 'col-md-4')}
                            onClick={()=>this.props.changeStateByTab( constant.SELCTED_TWO, constant.SELCTED_FIRST)}>
                            
                        </div>
                        <div className={(row === 1 && column === 1) ? 
                                            classNames(s['item'], s['selected-bet-tab'], 'col-xs-4', 'col-md-4') 
                                            : classNames(s['item'], s['not-selected-bet-tab'], 'col-xs-4', 'col-md-4')}
                            onClick={()=>this.props.changeStateByTab( constant.SELCTED_TWO, constant.SELCTED_TWO)}>
                            
                        </div>                   
                        
                    </div>
                    <div className={classNames('row', s['row-change-btn'])}>
                        <div className={classNames(s['item'], 'col-xs-4', 'col-md-4')}
                            >
                            {constant.EITHER_HALF}
                        </div>
                        <div className={(row === 2 && column === 0) ? 
                                            classNames(s['item'], s['selected-bet-tab'], 'col-xs-4', 'col-md-4') 
                                            : classNames(s['item'], s['not-selected-bet-tab'], 'col-xs-4', 'col-md-4')}
                            onClick={()=>this.props.changeStateByTab( constant.SELCTED_THREE, constant.SELCTED_FIRST)}>
                            
                        </div>
                        <div className={(row === 2 && column === 1) ? 
                                            classNames(s['item'], s['selected-bet-tab'], 'col-xs-4', 'col-md-4') 
                                            : classNames(s['item'], s['not-selected-bet-tab'], 'col-xs-4', 'col-md-4')}
                            onClick={()=>this.props.changeStateByTab( constant.SELCTED_THREE, constant.SELCTED_TWO)}>
                            
                        </div>                   
                        
                    </div>
                </div>
        );
    }
}