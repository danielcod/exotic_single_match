import React from 'react';

export default class MatchToggleCell extends React.PureComponent {
    render() {
        return (
            <td className="round-cell"
                onClick={this.props.clickHandler}>
                <button type="button"
                        className="btn round-cell-btn"
                        style={{backgroundColor: (this.props.selected ? "#ec644b" : "")}}>
                    {this.props.value}
                </button>
            </td>
        )
    }
}
