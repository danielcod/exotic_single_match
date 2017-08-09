import React from 'react';
import MatchTeamRow from '../../molecules/MatchTeamRow';

export default class MatchTeamTable extends React.PureComponent{
    addLegState(matches, legs) {
	// initialise selected
        var selected={};
        for (var i=0; i < legs.length; i++) {
            var leg=legs[i];
            selected[leg.match.name]=leg.selection.homeAway;
        }
        // update selected params
        for (var i=0; i < matches.length; i++) {
            var match=matches[i];
            match.selected=selected[match.name];
        }
        return matches;
    }
    render() {
	    return (
            <table className= "table table-condensed table-striped table-bordered">
                <thead>
                    <tr>
                        {
                            ["", "1", "X", "2"].map(function(label, key) {
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
                         this.addLegState(this.props.matches, this.props.legs).map(function(match, key) {
                                return (
                                    <MatchTeamRow
                                        key={key}
                                        match={match}
                                        clickHandler={this.props.clickHandler}
                                        />
                                )
                            }.bind(this))
                    }
                </tbody>
            </table>
        )        
    }
}