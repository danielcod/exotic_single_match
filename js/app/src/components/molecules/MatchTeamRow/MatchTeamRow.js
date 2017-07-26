import React from 'react';
import {bindAll} from 'lodash';
import DateTimeCell from '../../atoms/DateTimeCell';
import MatchTeamToggleCell from '../../atoms/MatchTeamToggleCell';

export default class MatchTeamRow extends React.PureComponent {
    constructor(props){
        super(props);
        this.state={
            teamnames: [],
            selected: {
                home: '',
		        away: ''
            }
        }
        bindAll(this, ['handleCellClicked']);
    }
    componentWillMount(){
        this.setState({
             teamnames: this.props.match.name.split(" vs "),
            selected: {
                home: this.props.match.selected=="home",
                away: this.props.match.selected=="away"
            }
        })
    }
    
    formatDescription(match, homeAway) {
        var teamnames=match.name.split(" vs ");
        var teamname, versus;
        if (homeAway=="home") {
            teamname=teamnames[0];
            versus=teamnames[1];
        } else {
            teamname=teamnames[1];
            versus=teamnames[0];
        }
        return teamname+" (vs "+versus+")";
    }    
    formatPrice(value) {
        if (value < 2) {
            // return value.toFixed(3);
            return value.toFixed(2);
        } else if (value < 10) {
            return value.toFixed(2);
        } else if (value < 100) {
            return value.toFixed(1);
        } else {
            return Math.floor(value);
        }
    }
    handleCellClicked(homeAway) {	
	// update state
        var {selected}=this.state;
        selected[homeAway]=!selected[homeAway];
        this.setState({selected});
        var altHomeAway=(homeAway=="home") ? "away" : "home";
        if (selected[altHomeAway]) {
            selected[altHomeAway]=false;
        }        
        // pass leg
        var leg={
            match: this.props.match,
            selection: {
            team: this.props.match.name.split(" vs ")[(homeAway=="home") ? 0 : 1],
            homeAway: homeAway,
            },
            description: this.formatDescription(this.props.match, homeAway),
            price: this.props.match["1x2_prices"][(homeAway=="home") ? 0 : 2]
        };
        if (selected[homeAway]==true) {
            this.props.clickHandler.add(leg);
        } else {
            this.props.clickHandler.remove(leg);
        }
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.match.name!=this.props.match.name) {
            var state=this.state;
            state.teamnames=nextProps.match.name.split(" vs ");
            state.selected={
            home: nextProps.match.selected=="home",
            away: nextProps.match.selected=="away"
            }
            this.setState(state);
        }
    }
    render() {
        return (
            <tr className= "text-center match">
                <td >
                    <span className='match-name'>
                        {this.props.match.name} 
                    </span>
                    <br/>
                    <DateTimeCell
                        value={this.props.match.kickoff}
                        type= "datetime"
                    />
                </td>                
                <MatchTeamToggleCell 
                    value={this.formatPrice(this.props.match["1x2_prices"][0])}
		            selected={this.state.selected}
		            clickHandler={()=>this.handleCellClicked("home")}
                    place="home"
                />
                <td>
                    <span style={{color: '#777'}}>
                        {this.formatPrice(this.props.match["1x2_prices"][1])} 111
                    </span>
                </td>
                 <MatchTeamToggleCell 
                    value={this.formatPrice(this.props.match["1x2_prices"][2])}
		            selected={this.state.selected}
		            clickHandler={()=>this.handleCellClicked("away")}
                    place="away"
                />
            </tr>
        )        
    }
}