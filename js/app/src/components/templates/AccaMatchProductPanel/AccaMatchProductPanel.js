import React from 'react';
import { bindAll } from 'lodash';
import MySelect from '../../atoms/MySelect';
import MyFormComponent from '../../atoms/MyFormComponent';
import AccaPanelTabs from '../../organisms/AccaPanelTabs';
import { Accordion, AccordionItem } from 'react-sanfona';
import * as data from '../../products';

export default class AccaProductPanel extends React.PureComponent{
    constructor(props){
        super(props);
        this.state={
            product: {},
            selectedTab: "legs",
            legs: {}
        }
        bindAll(this, ['handleProductChanged', 'handleTabClicked']);
    }
    componentWillMount(){        
        this.setState({            
            product: this.props.products[0]   
        })
    }
    handleTabClicked(tab) {        
        if (tab.name == "bet") {
            this.props.clickHandler("Bet");
        } else {
            this.props.clickHandler("Edit");
        }
        this.setState({selectedTab: tab.name});

    }
    handleProductChanged(name, value) {  
        const product = this.props.products.filter(function(product) {
            return product.name==value;
        })[0];         
        this.setState({product});           
    }
     render() {
        return (
            <div>
                <MyFormComponent
                        label= "Choose your Match Exotics"
                        component={ <MySelect
                                        className="form-control btn-primary input-lg"
                                        options= {this.props.products.map(function(product) {
                                                        return {
                                                            label: product.label,
                                                            value: product.name
                                                        }
                                                    })
                                                }
                                        name= "product"
                                        changeHandler= {this.handleProductChanged}


                                    />
                                }
                    />
                     <AccaPanelTabs
                        tabs = { [
                                {
                                    name: "legs",
                                    label: "Leg Selector"
                                },
                                {
                                    name: "bet",
                                    label: "Your Bet"
                                }
                        ] }
                        selected= {this.state.selectedTab}
                        clickHandler =  {this.handleTabClicked}
                        legs= { this.state.legs }
                    />
                    {
                    (this.state.selectedTab==="bet") ?
                        <div>
                            not
                        </div>
                        :
                        <Accordion>
                            {data.matchComponents.map((item) => {
                                return (
                                    <AccordionItem 
                                        title={`Item ${ item }`} slug={item} key={item}
                                        onClick={this.clickAccordionItem}>
                                        <div>
                                            {item}                                            
                                        </div>
                                    </AccordionItem>
                                );
                            })}
                        </Accordion>
                    }
            </div>
        )
     }
}