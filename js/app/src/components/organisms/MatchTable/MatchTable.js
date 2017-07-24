import React from 'react';
import MatchRow from '../../molecules/MatchRow';

export default class MatchTable extends React.PureComponent {
    
    addLegState(matches, legs) {
        // initialise selected
        var selected={};
        for (var i=0; i < legs.length; i++) {
            var leg=legs[i];
            selected[leg.match.name]=true;
        }
        // update selected params
        for (var i=0; i < matches.length; i++) {
            var match=matches[i];
            match.selected=selected[match.name];
        }
        return matches;
    }

    render() {
        const {clickHandler, matches, legs} = this.props;
        return (            
            <table className= "table table-condensed table-striped">
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
                         this.addLegState(matches, legs).map(function(match, key) {
                                return (
                                    <MatchRow
                                        key={key}
                                        match={match}
                                        clickHandler={clickHandler}
                                        />
                                )
                            })
                    }
                </tbody>
            </table>
        )        
    }
}