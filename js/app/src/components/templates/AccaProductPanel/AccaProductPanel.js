import React from 'react'
import {bindAll, isEmpty, isEqual} from 'lodash'
import AccaProductPanelList from './AccaProductPanelList'

export default class AccaProductPanel extends React.PureComponent {
    constructor(props) {
        super(props)
        const previousCurates = JSON.parse(localStorage.getItem("AccaMatchCurates"))
        if (previousCurates) {
            this.state = {
                curates: previousCurates
            }
            localStorage.removeItem("AccaMatchCurates")
        } else {
            this.state = {
                curates: []
            }
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
                if (!isEmpty(curates)) {
                    curates = this.getMixedCurates(curates)
                }
                this.setState({
                    curates: curates
                })
            }.bind(this))
        }
    }

    componentWillUnmount() {
        localStorage.setItem('AccaMatchCurates', JSON.stringify(this.state.curates))
    }

    getMixedCurates(curates) {
        const randomLimit = curates.length
        curates.sort(function () {
            // Get a random number
            let temp = parseInt(Math.random() * randomLimit)
            // Get 1 or 0, whether temp is odd or even
            let isOddOrEven = temp % 2
            // Get +1 or -1, whether temp greater or smaller than 5
            let isPosOrNeg = temp > 5 ? 1 : -1
            // Return -1, 0, or +1
            return ( isOddOrEven * isPosOrNeg )
        })
        return curates
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