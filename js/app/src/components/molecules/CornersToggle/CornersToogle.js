import React from 'react';

export default class CornersToogle extends React.PureComponent{ 
    render(){
	return (
            <ul className= "list-inline text-center">
                <li onClick={this.props.clickHandlers.decrement}>
                    <a className= "btn btn-secondary">
                        <i className="glyphicon glyphicon-minus-sign"></i>
                    </a>
                </li>
                <li>
                    <h4 className= "text-muted" style={{color: "#fff"}}>
                        {this.props.value}
                    </h4>
                </li>
                <li onClick={this.props.clickHandlers.increment}>
                    <a className= "btn btn-secondary">
                        <i className="glyphicon glyphicon-plus-sign"></i>
                    </a>
                </li>

            </ul>
        )    
    }
}