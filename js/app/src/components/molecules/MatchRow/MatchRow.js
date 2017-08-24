import React from 'react';
import {bindAll} from 'lodash';
import DateTimeCellCustom from '../../atoms/DateTimeCellCustom';
import MatchToggleCell from '../../atoms/MatchToggleCell';

export default class MatchRow extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            selected: false
        }
        bindAll(this, ['handleCellClicked']);
    }

    componentWillMount() {
        this.setState({
            selected: this.props.match.selected == true
        })
    }

    handleCellClicked() {
        // update state
        var state = this.state;
        state.selected = !state.selected;
        this.setState(state);
        // pass leg
        var leg = {
            match: this.props.match,
            selection: {
                // START HACK
                /*
                this is a hack designed to make Exotic Acca Draws work
                problem is that quant pricing requires a team, but in this case you have a match
                quick workaround is to force a team in this case; prob of one team drawing is the same as the prop of the other team drawing in a given match (???)
                this won't work for other match- based payoffs!
                real solution is to fix quant pricing to allow draws to be priced off matches rather than teams
                */
                team: this.props.match.name.split(" vs ")[0],
                // END HACK
                name: this.props.match.name
            },
            description: this.props.match.name,
            price: this.props.match["1x2_prices"][1]
        };
        if (state.selected) {
            this.props.clickHandler.add(leg);
        } else {
            this.props.clickHandler.remove(leg);
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.match.name != this.props.match.name) {
            var state = this.state;
            state.selected = nextProps.match.selected;
            this.setState(state);
        }
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

    render() {
        return (
            <tr className="text-center">
                <td>
                    <DateTimeCellCustom
                        value={this.props.match.kickoff}
                        type="datetime"
                    />
                    <div style={{display: "table-cell", width: "100%"}}>
                        <span className='match-name'>
                            {this.props.match.name}
                        </span>
                    </div>
                </td>
                <td>
                    <span style={{color: '#777'}}>
                        {this.formatPrice(this.props.match["1x2_prices"][0])}
                    </span>
                </td>
                <MatchToggleCell
                    value={this.formatPrice(this.props.match["1x2_prices"][1])}
                    selected={this.state.selected}
                    clickHandler={this.handleCellClicked}
                />
                <td>
                    <span style={{color: '#777'}}>
                        {this.formatPrice(this.props.match["1x2_prices"][2])}
                    </span>
                </td>
            </tr>
        )
    }
}