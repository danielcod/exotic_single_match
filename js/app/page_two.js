var DateUtils={
    formatMonth: function(date) {
	var months=["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	return months[date.getMonth()]; // NB JS months indexed at zero
    },
    formatDaySuffix: function(date) {
	var day=date.getDate();
	if ((day==1) || (day==21) || (day==31)) {
	    return "st";
	} else if ((day==2) || (day==22)) {
	    return "nd";
	} else if ((day==3) || (day==23)) {
	    return "rd";
	} else {
	    return "th";
	}
    },
    formatDate: function(date) {
	var month=this.formatMonth(date);
	var day=date.getDate();
	var suffix=this.formatDaySuffix(date);
	return month+" "+day+suffix;
    },
    formatMinutes: function(date) {
	var minutes=date.getMinutes();
	return (minutes < 10) ? '0'+minutes : minutes;
    },
    formatTime: function(date) {
	return date.getHours()+":"+this.formatMinutes(date);
    }
};

var DateTimeCell=React.createClass({
    render: function() {
	var value=this.props.value;
	var date=new Date(value);
	var today=new Date();
	var tmrw=new Date(today.getTime()+24*60*60*1000);
	if ((date.getMonth()==today.getMonth()) &&
	    (date.getDate()==today.getDate())) {
	    return React.DOM.span({
		className: "label label-warning",
		children: "Today"+((this.props.col.type=="datetime") ? (" "+DateUtils.formatTime(date)) : "")
	    });
	} else if ((date.getMonth()==tmrw.getMonth()) &&
		   (date.getDate()==tmrw.getDate())) {
	    return React.DOM.span({
		className: "label label-info",
		children: "Tomorrow"
	    });
	} else {
	    return React.DOM.span({
		children: DateUtils.formatDate(date)
	    });
	}
    }
});

var BetConditions=[
    {
	label: "More Than",
	value: ">"
    },
    {
	label: "At Least",
	value: ">="
    },
    {
	label: "Exactly",
	value: "="
    },
    {
	label: "Less Than",
	value: "<"
    },
    {
	label: "At Most",
	value: "<="
    }
];

var BetSelectorTabs=React.createClass({
    render: function() {
	return React.DOM.ul({
	    className: "nav nav-tabs",
	    children: this.props.tabs.map(function(tab) {
		return React.DOM.li({
		    className: (tab.name==this.props.selected) ? "active" : "",
		    onClick: this.props.clickHandler.bind(null, tab),
		    children: React.DOM.a({
			children: tab.label
		    })
		});				    
	    }.bind(this))
	});
    }
});

var BetSelectionRow=React.createClass({
    getInitialState: function() {
	return {
	    item: this.props.item
	};
    },
    deleteHandler: function() {
	this.props.deleteHandler(this.props.item.id);
    },
    componentWillReceiveProps: function(nextProps) {
	if (JSON.stringify(this.state.item)!=
	    JSON.stringify(nextProps.item)) {
	    var state=this.state;
	    state.item=nextProps.item;
	    this.setState(state);
	}
    },
    render: function() {
	return React.DOM.tr({
	    children: [
		React.DOM.td({
		    children: this.state.item.team+" (vs "+this.state.item.versus+")"
		}),		
		React.DOM.td({
		    children: React.DOM.a({
			className: "btn btn-secondary",
			children: React.DOM.i({
			    className: "glyphicon glyphicon-remove"
			}),
			onClick: this.deleteHandler
		    })
		})
	    ]
	})				    
    }
});

var BetSelectionTable=React.createClass({
    uuid: function() {
	return Math.round(Math.random()*1e16);
    },
    initItems: function(items) {
	for (var i=0; i < items.length; i++) {
	    var item=items[i];
	    item.id=this.uuid();
	}
	return items;
    },
    getInitialState: function() {
	return {
	    items: this.initItems(this.props.items)
	}
    },
    deleteHandler: function(id) {
	if (this.state.items.length > 1) {
	    var state=this.state;
	    var items=state.items.filter(function(item) {
		return item.id!=id;
	    });
	    state.items=items;
	    this.setState(state);
	    this.props.changeHandler(state.items);
	}
    },    
    render: function() {
	return React.DOM.div({
	    className: "form-group",
	    children: [
		React.DOM.label({
		    children: this.props.label
		}),
		React.DOM.table({
		    className: "table table-condensed table-striped",
		    style: {
			"margin-top": "0px",
			"margin-bottom": "0px"
		    },
		    children: React.DOM.tbody({
			children: this.state.items.map(function(item) {
			    return React.createElement(BetSelectionRow, {
				selectorClass: this.props.selectorClass,
				item: item,
				exoticsApi: this.props.exoticsApi,
				deleteHandler: this.deleteHandler
			    });
			}.bind(this))
		    })
		})
	    ]
	});		
    }
});

var BetNTeamsToggle=React.createClass({
    getInitialState: function() {
	return {
	    nTeams: 10,
	    counter: 0
	}
    },
    handleIncrement: function() {
	var state=this.state;
	if (state.counter < state.nTeams-1) {
	    state.counter+=1;
	    this.setState(state);
	}	
    },
    handleDecrement: function() {
	var state=this.state
	if (state.counter > 0) {
	    state.counter-=1;
	    this.setState(state);
	}
    },
    render: function() {
	return React.DOM.ul({
	    className: "list-inline text-center",
	    style: {
		"margin-bottom": "20px"
	    },
	    children: [
		React.DOM.li({
		    children: React.DOM.a({
			className: "btn btn-secondary",
			children: React.DOM.i({
			    className: "glyphicon glyphicon-arrow-down"
			}),
			onClick: this.handleDecrement
		    })
		}),
		React.DOM.li({
		    children: React.DOM.h4({
			children: (1+this.state.counter)+" team"+((this.state.counter==0) ? '' : 's')+" out of "+this.state.nTeams
		    })
		}),
		React.DOM.li({
		    children: React.DOM.a({
			className: "btn btn-secondary",
			children: React.DOM.i({
			    className: "glyphicon glyphicon-arrow-up"
			}),
			onClick: this.handleIncrement
		    })
		})
	    ]
	});
    }
});

var ProductPanel=React.createClass({
    getInitialState: function() {
	return {
	    selectedTab: "bet",
	    bet: {
		teams: []
	    },
	    matches: []	    
	};
    },
    teamsChangeHandler: function(teams) {
	var state=this.state;
	state.bet.teams=teams;
	this.setState(state);
    },
    changeHandler: function(name, value) {
	var state=this.state;
	state.bet[name]=value;
	this.setState(state);
    },
    componentDidMount: function() {
	this.props.exoticsApi.fetchBlob("app/matches", function(struct) {
	    var state=this.state;
	    state.matches=struct;
	    this.setState(state);
	}.bind(this));	
    },
    render: function() {
	return React.DOM.div({
	    children: [
		React.createElement(BetSelectorTabs, {
		    tabs: [
			{
			    name: "bet",
			    label: "Your Selections"
			},
			{
			    name: "matches",
			    label: "Team Selector"
			}
		    ],
		    selected: this.state.selectedTab,
		    clickHandler: function(tab) {
			var state=this.state;
			state.selectedTab=tab.name;
			this.setState(state);
		    }.bind(this)
		}),
		(this.state.selectedTab=="bet") ? [
		    React.createElement(BetSelectionTable, {
			items: this.state.bet.teams,
			exoticsApi: this.props.exoticsApi,
			changeHandler: this.teamsChangeHandler,
			label: "Teams"
		    }),
		    React.createElement(MySelect, {
			label: "Condition",
			name: "teams_condition",
			value: this.state.bet.teams_condition,
			changeHandler: this.changeHandler,
			options: BetConditions,
			defaultOption: {
			    label: "Select"
			}
		    }),
		    React.createElement(BetNTeamsToggle, {
		    })
		]: [],
		(this.state.selectedTab=="matches") ? React.createElement(MatchTeamSelectionPanel, {
		    matches: this.state.matches,
		    paginator: {
			rows: 8
		    }
		}) : undefined
	    ]
	})
    }
});

