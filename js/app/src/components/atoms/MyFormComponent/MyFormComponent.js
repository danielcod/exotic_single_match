import React from 'react';

export default class MyFormComponent extends React.PureComponent{
    render() {
	return (
        <div className= "form-group">
	        <label  style={{width: '100%'}}  className= "text-center">
                {this.props.label}
            </label>		    
		    {this.props.component}
		</div>	
    )}
}