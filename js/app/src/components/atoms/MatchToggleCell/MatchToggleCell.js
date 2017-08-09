import React from 'react';

export default class MatchToggleCell extends React.PureComponent{
    render(){
        return (
            <td style={{ backgroundColor: (this.props.selected ? "#ec644b" : "") }}
            onClick= {this.props.clickHandler} >
            {this.props.value}
        </td>
        )        
    }
}
