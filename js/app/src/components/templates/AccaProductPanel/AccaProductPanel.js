import React from 'react'
import {bindAll, isEmpty, isEqual} from 'lodash'
import AccaProductPanelList from './AccaProductPanelList'

export default class AccaProductPanel extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            accaProductPanelState: "list",
            curates: []
        }
        bindAll(this, [])
    }

    componentDidMount() {
        if (isEmpty(this.state.curates)) {
            this.props.exoticsApi.fetchCurates(function (struct) {
                let {curates} = this.state
                curates = Object.values(struct).filter(function (curate) {
                    return curate
                })
                this.setState({
                    curates: curates
                })
            }.bind(this))
        }
    }

    render() {
        const {buildYourOwnExotic, legsPaginator, setCurate} = this.props
        const {curates} = this.state
        return (
            <div id="exotic-acca">
                <div id="build-your-own-exotic">
                    <div className="form-group">
                        <button
                            className="btn btn-primary"
                            onClick={() => buildYourOwnExotic({name: "build"})}>Build Your Own EXOTIC
                        </button>
                    </div>
                    <div className="form-group">
                        <span>....or edit one of the popular bets other people have chosen:</span>
                    </div>
                </div>
                <AccaProductPanelList
                    curates={curates}
                    legsPaginator={legsPaginator}
                    clickHandler={setCurate}
                />
            </div>
        )
    }
}