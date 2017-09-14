import React from 'react';
import { bindAll } from 'lodash';
import StakeTable from '../../organisms/StakeTable';
import MyPaginator from '../../molecules/MyPaginator';
import {formatCurrentPrice, getCurrentTimeFormatter, getLegsFromBet} from '../../utils';
import * as constant from  '../../constant';
import classnames from 'classnames'
import * as s from './index.css';

export default class StakePanel extends React.PureComponent {
    constructor(props){
        super(props);
        this.state={
            currentPage: 0
        }
         bindAll(this, ['applyPaginatorWindow', 'sortLegs']);
    }

     getCurrentTimeFormatter() {
        var dt = new Date();
        var monthNames = [
            "January", "February", "March",
            "April", "May", "June", "July",
            "August", "September", "October",
            "November", "December"
        ];
        var month = monthNames[dt.getMonth()];
        var day = dt.getDate().toString();
        var hour = dt.getHours().toString();
        var minutes = dt.getMinutes() > 10 ? dt.getMinutes().toString() : "0" + dt.getMinutes().toString();
        var mid = dt.getHours() >= 12 ? "pm" : "am";
        return <span className="bet-saved-date">{hour + ":" + minutes + " " + mid + " " + day}<sup>th</sup>{" " + month}</span>
    }
    dateformater(date){
        var dt = new Date(date);
        var monthNames = [
            "January", "February", "March",
            "April", "May", "June", "July",
            "August", "September", "October",
            "November", "December"
        ];
        var month = monthNames[dt.getMonth()];
        var day = dt.getDate().toString();
        return <div className="bet-saved-date">{"( " + day + "th " + month + ' )'}</div>
    }
    applyPaginatorWindow (items) {
        var rows = constant.COUNT_PLAYER_ROWS;
        var i = this.state.currentPage * rows;
        var j = (this.state.currentPage + 1) * rows;
        return items.slice(i, j);
    }
    sortLegs (legs){
        var sortFn = function (i0, i1) {
            if (i0.match.kickoff < i1.match.kickoff) {
                return -1;
            } else if (i0.match.kickoff > i1.match.kickoff) {
                return 1;
            } else {
                if (i0.description < i1.description) {
                    return -1
                } else if (i0.description > i1.description) {
                    return 1
                } else {
                    return 0;
                }
            }
        };
        return legs.sort(sortFn);
    }
     handlePaginatorClicked = (item)=> {
        const currentPage = item.value;        
        this.setState({currentPage});
    } 
    render(){        
        const {stake, showBets, price, textBetsInStake, match} = this.props;
        return(
           <div className="bet-confirm-container">
               <div className="form-group">
                   <h3 className="bet-placed-text">
                       <span className="glyphicon glyphicon-ok"></span>
                           Your bet has been placed!
                    </h3>
                </div>
                <div className="form-group">
                    <div className={classnames( s["bet-placed-product"])}>
                        MATCH EXOTIC
                    </div>
                    <div className={classnames( s["bet-match"])}>
                       {match.name}
                    </div>      
                    <div className={classnames( s["bet-match-date"])}>              
                        {this.dateformater(match.kickoff)}  
                    </div>  
                </div>
                <div className={classnames(s['in-legs'], "form-group")}>
                        <span>{textBetsInStake}</span> 
                        <span> legs to win</span> 
                </div>
                <div className="form-group">
                    <div className="bet-legs">
                        <StakeTable
                            bets={this.applyPaginatorWindow(this.sortLegs(showBets))}                           
                            match={match}
                        />
                    {
                        (showBets.length > constant.COUNT_PLAYER_ROWS) ?
                            <div className={classnames(s['wrap-pagitaor'])}>
                                <MyPaginator
                                    product={{rows : constant.COUNT_PLAYER_ROWS}}
                                    data={showBets}
                                    clickHandler={this.handlePaginatorClicked}
                                    currentPage={this.state.currentPage}
                                />
                            </div>                            
                            : null
                    }
                        
                    </div>
                </div>
                <div className="form-group">
                    <h3 className="bet-placed-price">
                        €{parseFloat(stake).toFixed(2)} @ <span>{formatCurrentPrice(price)}</span>
                    </h3>
                </div>
                <div className="form-group">
                    <div className={classnames(s['in-legs'], "bet-placed-result")}>
                        <span>To win € {formatCurrentPrice(stake * price)}</span>
                        <span>Result = ?</span>
                    </div>
                </div>
                <div className="form-group">
                    <a className="site-url" href="http://www.URLtoinset.com">www.URLtoinset.com</a>
                    {this.getCurrentTimeFormatter()}
                </div>
                <div className="form-group">
                    <div className={classnames("main-menu-container", s['main-menu-btn-container'])}>  
                        <div className={s['wrap-main-menu-btn']}>
                            <button
                                className={classnames("btn btn-primary", s['main-menu-btn'])}
                                onClick={this.props.returnToBetsPanel}>
                                KEEP SELECTIONS
                            </button>
                        </div>                      
                        <div className={s['wrap-main-menu-btn']}>
                            <button
                                className={classnames("btn btn-primary", s['main-menu-btn'])}
                                onClick={this.props.toMainMenu}>
                                MAIN MENU
                            </button>
                        </div>                        
                    </div>                    
                </div>
           </div>
            
        );
    }
}