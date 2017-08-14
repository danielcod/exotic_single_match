import React from 'react';
import { bindAll } from 'lodash';
import MySelect from '../../atoms/MySelect';
import MyFormComponent from '../../atoms/MyFormComponent';
import AccaPanelTabs from '../../organisms/AccaPanelTabs';
import MatchResult from '../../organisms/MatchResult';
import {matchSorter} from '../../utils'
import { Accordion, AccordionItem } from 'react-sanfona';
import * as data from '../../products';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import classnames from 'classnames';
import FaAngleDoubleDown from 'react-icons/lib/fa/angle-double-down';
import FaAngleDoubleUp from 'react-icons/lib/fa/angle-double-up';
import s from './index.css';
import * as str from  '../../struct';

export default class AccaMatchProductPanel extends React.PureComponent{
    constructor(props){
        super(props);
        this.state={
            matches: [],
            match: {},
            selectedTab: "legs",
            legs: [],
            matchResult: this.initMatchResult(),
            sanfonaActiveItems: []
            
        }
        bindAll(this, ['handleMatchChanged', 'handleTabClicked', 'onChangeRange', 
                        'onTableClick', 'changeText', 'changeBlock', 'handleBuidMyOwn']);
    }
    initMatchResult(){
        return {
                range: [1, 5],
                tableSelectedItem: [0, 1],
                text: ' ',
                showSlider: true,
                buildMyOwn: false
        }
    }
    componentWillMount(){      
        this.props.exoticsApi.fetchMatches(function(struct) {
            let {matches, leagues} = this.state;
            const cutoff=new Date();
            
            matches=struct.filter(function(match) {
                return new Date(match.kickoff) > cutoff;
            }).sort(matchSorter);
            this.setState({
                matches: matches,
                match: matches[0]
            });
        }.bind(this));	          
    }
    handleTabClicked(tab) {        
        /*if (tab.name == "bet") {
            this.props.clickHandler("Bet");
        } else {
            this.props.clickHandler("Edit");
        }*/
        this.setState({selectedTab: tab.name});

    }
    handleMatchChanged(name, value) {  
        const match = this.state.matches.filter(function(product) {
            return product.name==value;
        })[0];
        const matchResult = this.initMatchResult();   
        this.setState({match, matchResult});           
    }
    onChangeRange(range){
        this.state.matchResult.range = range;
    }
    onTableClick(i, y, showSlider){
        this.state.matchResult.tableSelectedItem = [i, y];
        this.state.matchResult.showSlider = showSlider;
    }
    changeText(text){
        this.state.matchResult.text = text;
    }
    changeBlock(value){
        const sanfonaActiveItems = value.activeItems;
        this.setState({sanfonaActiveItems});
    }
    handleBuidMyOwn(){
        const buildMyOwn = !this.state.buildMyOwn;
        this.setState({buildMyOwn});
        this.props.clickHandler("edit");
    }
     render() {
         const {matches, match, legs, sanfonaActiveItems} = this.state;
         const renderAngle = (index, title)=>{
            let opened = false;
            for (let i=0; i< sanfonaActiveItems.length; i++){
                if (sanfonaActiveItems[i] === index){
                    opened = true;
                }
            }                 
            return ((opened) ? 
                                <h3 className="react-sanfona-item-title" style={{cursor: 'pointer', margin: '0px'}}>
                                    {title}
                                    <div className={s['b-angle']}>
                                        <FaAngleDoubleUp/>
                                    </div>  
                                </h3>
                                :
                                <h3 className="react-sanfona-item-title" style={{cursor: 'pointer', margin: '0px'}}>
                                   {title}
                                    <div className={s['b-angle']}>
                                        <FaAngleDoubleDown/>
                                    </div>
                                </h3>);            
         }
        return (
            <div>
                { !this.state.buildMyOwn ?
                    <button className="btn btn-primary" style={{float: 'right'}}
                        onClick={this.handleBuidMyOwn}
                        >Build My Own</button>
                        :
                        <div>
                            <MyFormComponent                        
                            label= "Choose your Match Exotics"
                            component={ <MySelect
                                            className="form-control btn-primary input-lg"
                                            options= {matches.map(function(product) {
                                                            return {
                                                                label: product.label,
                                                                value: product.name
                                                            }
                                                        })
                                                    }
                                            name= "match"
                                            changeHandler= {this.handleMatchChanged}


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
                                <Accordion onChange={this.changeBlock} activeItems={sanfonaActiveItems}>
                                    {data.matchComponents.map((item, index) => {                               
                                        return (
                                        
                                                <AccordionItem  
                                                    title={ renderAngle(index, item)}  key={item}
                                                    >
                                                    <div>                                                                                    
                                                        {index ===  0 ? 
                                                        <MatchResult 
                                                            matches={str.MatchResultStruct}
                                                            match={match}
                                                            legs={legs}
                                                            onChangeRange={this.onChangeRange}
                                                            onTableClick={this.onTableClick}
                                                            matchResult={this.state.matchResult} 
                                                            changeText={this.changeText}                                               
                                                            /> : null}  
                                                        {index ===  1 ? <p>{item}</p> : null} 
                                                        {index ===  2 ? <p>{item}</p> : null} 
                                                        {index ===  3 ? <p>{item}</p> : null} 
                                                        {index ===  4 ? <p>{item}</p> : null} 
                                                        {index ===  5 ? <p>{item}</p> : null} 
                                                    </div>           
                                                </AccordionItem>
                                        );
                                    })}
                                </Accordion>
                            }
                        </div>                       
            
                }
                
               </div>
        )
     }
}