import React from 'react';

export default class AccaNLegsToggle extends React.PureComponent {

    textFormatter(nLegs, Legs) {
        return nLegs + ((nLegs < Legs) ? "+" : "") + " (of " + Legs + ")";
    }

    render() {
        return (
            <ul className="list-inline text-center">
                <li onClick={this.props.clickHandlers.decrement}>
                    <a className="btn btn-secondary">
                        <i className="glyphicon glyphicon-minus-sign"></i>
                    </a>
                </li>
                <li>
                    <h4 className="text-muted" style={{color: "#AAA"}}>
                        {this.textFormatter(this.props.nLegs, this.props.legs.length)}
                    </h4>
                </li>
                <li onClick={this.props.clickHandlers.increment}>
                    <a className="btn btn-secondary">
                        <i className="glyphicon glyphicon-plus-sign"></i>
                    </a>
                </li>

            </ul>
        )
    }
}

