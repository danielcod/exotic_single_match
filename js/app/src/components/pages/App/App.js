import React from 'react'
import AccaMatchMainPanel from '../../templates/AccaMatchMainPanel'

export default class App extends React.PureComponent {

    render() {
        return (
            <div>
                <div className="header clearfix">
                    <img className="img-responsive" src="img/logo.png" alt="logo"/>
                </div>
                <AccaMatchMainPanel
                    exoticsApi={this.props.exoticsApi}
                />
                <footer className="footer">
                    Powered by
                    <img className="img-responsive" src="img/iosport.png" alt="ioSport"/>
                </footer>
            </div>
        )
    }
}