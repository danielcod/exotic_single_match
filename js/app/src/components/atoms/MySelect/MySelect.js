import React from 'react';

export default class MySelect extends React.PureComponent{
    constructor(props){
        super(props);
         this.changeSelect = this.changeSelect.bind(this);
    }
    changeSelect(event){
        this.props.changeHandler(this.props.name, event.target.value);
    }
    render() {
        return(
            <select 
                className= {this.props.className || "form-control"}
                onChange= {this.changeSelect}>
                {
                    this.props.options.map((option, key)=> {
                        return <option key={key} value={option.value}>
                                    { option.label || option.value}
                                </option>                                  
                    })
                }
            </select>
        )}
};
