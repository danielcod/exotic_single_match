import React from 'react';

export default class MatchTeamToggleCell extends React.PureComponent {
    render() {       
        const {selected, clickHandler, value, place}  = this.props;
        return (            
            <td className = "round-cell"
            	style={{ backgroundColor: (selected[place] ? "#ec644b" : "") }}
                onClick= {clickHandler} >
                {value}
            </td>
        )
    }
}