import React from 'react';
import AppStage from './AppStage';

export default class App extends React.PureComponent {

    render() {
        return (
            <div>
                <div className="header clearfix">
                    <h1>Soccer Exotics</h1>
                </div>
                <AppStage
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