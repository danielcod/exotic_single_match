import React from 'react';

export default class MatchTeamToggleCell extends React.PureComponent {
    render() {       
        const {selected, clickHandler, value, place}  = this.props;
        return (            
            <td className = "round-cell"
                onClick= {clickHandler} >
                <button type="button" className="btn round-cell-btn"
                        style={{ backgroundColor: (selected[place] ? "#ec644b" : "") }}>
                    {value}
                </button>
            </td>
        )
    }
}