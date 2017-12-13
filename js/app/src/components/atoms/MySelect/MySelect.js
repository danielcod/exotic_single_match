import React from 'react'

export default class MySelect extends React.PureComponent {
    constructor(props) {
        super(props)
        this.changeSelect = this.changeSelect.bind(this)
    }

    changeSelect(event) {
        this.props.changeHandler(this.props.name, event.target.value)
    }

    render() {
        const {match, name} = this.props
        return (
            <select
                style={name === 'league' ? {paddingLeft: '26%', backgroundColor: '#d99c41'} : {}}
                className={this.props.className || "form-control"}
                onChange={this.changeSelect}
                value={name === 'match' ? match.match_id : match.league}>
                {
                    this.props.options.map((option, key) => {
                        return <option
                            key={key} value={option.value}>
                            {option.label || option.value}
                        </option>
                    })
                }
            </select>
        )
    }
};
