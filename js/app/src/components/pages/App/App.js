import React from 'react';
import AccaProductPanel from '../../templates/AccaProductPanel';
import * as data from '../../products';

export default class App extends React.PureComponent {
    render(){
        return(
            <div>
                <div className="header clearfix">
                    <h1>Team Exotics</h1>
                </div>
                <AccaProductPanel
                    exoticsApi={ this.props.exoticsApi }
                    products = { data.products }
                    legsPaginator= {{ rows: 8 }}
		            betLegsPaginator= {{ rows: 8 }}
                />
                <footer className="footer">
                    Powered by
                    <img  className= "img-responsive"  src= "img/iosport.png" alt= "ioSport"/>
                </footer>
            </div>
        )
    }
}