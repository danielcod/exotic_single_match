var ExoticAccaDateUtils={
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

var ExoticAccaDateTimeCell=React.createClass({
    render: function() {
	var value=this.props.value;
	var date=new Date(value);
	var today=new Date();
	var tmrw=new Date(today.getTime()+24*60*60*1000);
	if ((date.getMonth()==today.getMonth()) &&
	    (date.getDate()==today.getDate())) {
	    return React.DOM.span({
		className: "label label-warning",
		children: "Today"+((this.props.col.type=="datetime") ? (" "+ExoticAccaDateUtils.formatTime(date)) : "")
	    });
	} else if ((date.getMonth()==tmrw.getMonth()) &&
		   (date.getDate()==tmrw.getDate())) {
	    return React.DOM.span({
		className: "label label-info",
		children: "Tomorrow"
	    });
	} else {
	    return React.DOM.span({
		children: ExoticAccaDateUtils.formatDate(date)
	    });
	}
    }
});

var ExoticAccaSelectorTabs=React.createClass({
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

var ExoticAccaBetSelectionRow=React.createClass({
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

var ExoticAccaBetSelectionTable=React.createClass({
    uuid: function() {
	return Math.round(Math.random()*1e16);
    },
    initItems: function(items) {
	if (items.length==0) {
	    items.push({});
	}
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
			    return React.createElement(ExoticAccaBetSelectionRow, {
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

var ExoticAccaTeamSelectionCell=React.createClass({
    render: function() {
	return React.DOM.td({
	    children: this.props.selected ? React.DOM.span({
		className: "label label-info",
		children: React.DOM.b({
		    children: this.props.value
		})
	    }) : this.props.value,
	    onClick: this.props.clickHandler
	});
    }
});

var ExoticAccaTeamSelectionRow=React.createClass({
    getInitialState: function() {
	return {
	    teamnames: this.props.match.match.split(" vs "),
	    selected: {
		home: false,
		away: false
	    }
	}
    },
    handleCellClicked: function(attr) {	
	var state=this.state;
	state.selected[attr]=!state.selected[attr];
	var altAttr=(attr=="home") ? "away" : "home";
	if (state.selected[altAttr]) {
	    state.selected[altAttr]=false;
	}
	this.setState(state);
    },
    componentWillReceiveProps: function(nextProps) {
	if (nextProps.match.match!=this.props.match.match) {
	    var state=this.state;
	    state.teamnames=nextProps.match.match.split(" vs ");
	    state.selected={
		home: false,
		away: false
	    }
	    this.setState(state);
	}
    },
    render: function() {
	return React.DOM.tr({
	    className: "text-center",
	    children: [
		React.DOM.td({
		    children: React.createElement(ExoticAccaDateTimeCell, {
			value: this.props.match.kickoff
		    })
		}),
		React.createElement(ExoticAccaTeamSelectionCell, {
		    value: this.state.teamnames[0],
		    selected: this.state.selected.home,
		    clickHandler: function() {
			this.handleCellClicked("home")
		    }.bind(this)
		}),
		React.DOM.td({
		    children: " vs "
		}),
		React.createElement(ExoticAccaTeamSelectionCell, {
		    value: this.state.teamnames[1],
		    selected: this.state.selected.away,
		    clickHandler: function() {
			this.handleCellClicked("away")
		    }.bind(this)
		})
	    ]
	});
    }
});

var ExoticAccaTeamSelectionTable=React.createClass({
    render: function() {
	return React.DOM.table({
	    className: "table table-condensed table-striped",
	    children: React.DOM.tbody({
		children: this.props.matches.map(function(match) {
		    return React.createElement(ExoticAccaTeamSelectionRow, {
			match: match
		    })
		})
	    })
	});
    }
});

var ExoticAccaTeamSelectionPaginator=React.createClass({
    getInitialState: function() {
	return {};
    },
    initPaginatorItems: function(tableData, nTableRows) {
	var n=Math.floor(tableData.length/nTableRows);
	if (0 != tableData.length % nTableRows) {
	    n+=1;
	}
	var items=[];
	for (var i=0; i < n; i++) {
	    var item={
		value: i,
		label: i+1
	    }
	    items.push(item);
	}
	return items;
    },
    render: function() {
	return React.DOM.div({
	    className: "text-center",
	    children: React.DOM.ul({
		className: "pagination",
		children: this.initPaginatorItems(this.props.data, this.props.config.rows).map(function(item) {
		    return React.DOM.li({
			className: (item.value==this.props.currentPage) ? "active" : "",
			onClick: this.props.clickHandler.bind(null, item),
			children: React.DOM.a({
			    children: item.label
			})
		    })
		}.bind(this))
	    })
	});
    }
});

var ExoticAccaTeamSelectionPanel=React.createClass({
    filterLeagues: function(matches) {
	var names=[];
	for (var i=0; i < matches.length; i++) {
	    var match=matches[i];
	    if (names.indexOf(match.league)==-1) {
		names.push(match.league);
	    }
	}
	return names.sort();
    },
    getInitialState: function() {
	return {
	    leagues: this.filterLeagues(this.props.matches),
	    league: this.filterLeagues(this.props.matches)[0],
	    currentPage: 0
	}
    },
    changeHandler: function(name, value) {
	console.log(name+"="+value);
	var state=this.state;
	state.league=value;
	this.setState(state);
    },
    applyPaginatorWindow: function(items) {
	var rows=this.props.paginator.rows;
	var i=this.state.currentPage*rows;
	var j=(this.state.currentPage+1)*rows;
	return items.slice(i, j);
    },
    handlePaginatorClicked: function(item) {
	var state=this.state;
	state.currentPage=item.value;
	this.setState(state);	
    },
    render: function() {
	return React.DOM.div({
	    children: [
		React.DOM.div({
		    style: {
			"margin-left": "100px",
			"margin-right": "100px"
		    },
		    children: React.createElement(MySelect, {
			options: this.state.leagues.map(function(league) {
			    return {
				value: league
			    };
			}),
			value: this.state.league,
			label: "League",
			name: "league",
			changeHandler: this.changeHandler
		    })
		}),
		React.createElement(ExoticAccaTeamSelectionTable, {
		    matches: this.applyPaginatorWindow(this.props.matches.filter(function(match) {
			return match.league==this.state.league;
		    }.bind(this)))
		}),
		React.createElement(ExoticAccaTeamSelectionPaginator, {
		    config: this.props.paginator,
		    data: this.props.matches.filter(function(match) {
			return match.league==this.state.league;
		    }.bind(this)),
		    clickHandler: this.handlePaginatorClicked,
		    currentPage: this.state.currentPage
		})
	    ]
	});
    }
});

var ExoticAccaConditions=[
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

var ExoticAccaNTeamsSlider=React.createClass({
    getInitialState: function() {
	return {
	    value: 1
	}
    },
    componentDidMount: function() {
	var initSliderTicks=function() {
	    var ticks=[];
	    for (var i=this.props.min; i <= this.props.max; i++) {
		ticks.push(i);
	    }
	    return ticks;
	}.bind(this);
	$('#slider').slider({
	    ticks: initSliderTicks(),
	    formatter: function(value) {
		return value;
	    },
	}).on("change", function(event, ui) {
	    var value=parseInt($("#slider").data("slider").getValue());
	    this.props.changeHandler("n_teams", value);
	}.bind(this));	
    },
    render: function() {
	return React.DOM.div({
	    className: "form-group",
	    style: {
		"margin-top": "20px",
		"margin-bottom": "30px"
	    },
	    children: [
		React.DOM.label({
		    children: "Number of Teams"
		}),
		React.DOM.div({
		    style: {
			"margin-left": "20px",
			"margin-right": "20px",
		    },
		    children: React.DOM.input({
			style: {
			    width: "100%"
			},
			id: "slider",
			type: "text",
			"data-slider-min": this.props.min,
			"data-slider-max": this.props.max,
			"data-slider-step": 1,
			"data-slider-value": this.state.value
		    })
		})
	    ]
	})	
    }
});

var ExoticAccaNTeamsToggle=React.createClass({
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

var ExoticAccaForm=React.createClass({
    initBet: function(bet) {
	if (bet.params.result==undefined) {
	    bet.params.result="win"; // TEMP
	}
	if (bet.params.teams==undefined) {
	    bet.params.teams=[];
	}	
	return bet;
    },
    getInitialState: function() {
	return {
	    bet: this.initBet(this.props.bet),
	    slider: {
		min: 1
	    },
	    selectedTab: "bet",
	    matches: []
	};
    },
    teamsChangeHandler: function(teams) {
	var state=this.state;
	state.bet.params.teams=teams;
	this.setState(state);
	this.updatePrice(this.state.bet);
    },
    changeHandler: function(name, value) {
	console.log(name+" -> "+value);
	if (this.state.bet.params[name]!=value) {
	    var state=this.state;
	    if (name=="n_teams") {
		state.bet.params[name]=parseInt(value);
	    } else {
		state.bet.params[name]=value;
	    }
	    this.setState(state);
	    this.updatePrice(this.state.bet);
	}
    },
    isComplete: function(bet) {
	// check scalar fields
	if ((bet.params.teams_condition==undefined) ||
	    (bet.params.n_teams==undefined)) {
	    return false;
	}
	// check undefined teams fields
	for (var i=0; i < bet.params.teams.length; i++) {
	    var item=bet.params.teams[i];
	    if ((item.league==undefined) ||
		(item.team==undefined)) {
		return false;
	    }
	}
	// check unique team names
	var teamnames=[];	
	for (var i=0; i < bet.params.teams.length; i++) {
	    var item=bet.params.teams[i];
	    if (teamnames.indexOf(item.team)==-1) {
		teamnames.push(item.team);
	    }
	}
	if (teamnames.length!=(bet.params.teams.length)) {
	    return false
	}
	return true;
    },
    updatePrice: function(bet) {
	if (this.isComplete(bet)) {
	    this.props.updatePriceHandler(bet)
	} else {
	    this.props.resetPriceHandler();
	}
    },
    componentDidMount: function() {
	// update price
	this.updatePrice(this.state.bet);
	// load matches
	this.props.exoticsApi.fetchBlob("app/matches", function(struct) {
	    var state=this.state;
	    state.matches=struct;
	    this.setState(state);
	}.bind(this));	
    },
    render: function() {
	return React.DOM.div({
	    children: [
		React.createElement(ExoticAccaSelectorTabs, {
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
		(this.state.selectedTab=="bet") ? React.createElement(ExoticAccaBetSelectionTable, {
			items: this.state.bet.params.teams,
			exoticsApi: this.props.exoticsApi,
			changeHandler: this.teamsChangeHandler,
			label: "Teams"
		}) : undefined,
		(this.state.selectedTab=="matches") ? React.createElement(ExoticAccaTeamSelectionPanel, {
		    matches: this.state.matches,
		    paginator: {
			rows: 8
		    }
		}) : undefined,
		React.createElement(MySelect, {
		    label: "Condition",
		    name: "teams_condition",
		    value: this.state.bet.params.teams_condition,
		    changeHandler: this.changeHandler,
		    options: ExoticAccaConditions,
		    blankStyle: this.props.blankStyle,
		    defaultOption: {
			label: "Select"
		    }
		}),
		/*
		React.createElement(ExoticAccaNTeamsSlider, {
		    min: this.state.slider.min,
		    max: this.state.bet.params.teams.length,
		    changeHandler: this.changeHandler
		}),
		*/
		React.createElement(ExoticAccaNTeamsToggle, {
		})
	    ]
	})
    }
});



