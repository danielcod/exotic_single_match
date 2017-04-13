var BrowseBetsRow=React.createClass({
    formatPrice: function(probability) {
	return (1/Math.min(0.99, Math.max(0.01, probability))).toFixed(2);
    },
    render: function() {
	return React.DOM.tr({
	    children: [
		React.DOM.td({
		    children: [
			React.DOM.h5({
			    children: [
				this.props.bet.description.selection,
				React.DOM.span({
				    style: {
					"margin-left": (this.props.bet.description.selection!=undefined) ? "10px" : "0px"
				    },
				    className: "label label-"+this.props.bet.description.group.level,
				    children: this.props.bet.description.group.label
				})
			    ]
			}),
			React.DOM.p({
			    dangerouslySetInnerHTML: {
				"__html": this.props.bet.description.market
			    }
			})
		    ]
		}),
		React.DOM.td({
		    className: "text-center",			    
		    children: React.DOM.span({
			className: "price",
			children: this.formatPrice(this.props.bet.probability)
		    })
		}),
		React.DOM.td({
		    children: React.DOM.a({
			className: "btn btn-secondary",
			onClick: function() {
			    this.props.clickHandler(this.props.bet);
			}.bind(this),
			children: React.DOM.i({
			    className: "glyphicon glyphicon-pencil"
			})
		    })
		})
	    ]
	});
    }
});

var BrowseBetsTable=React.createClass({
    getInitialState: function() {
	return {
	    bet: undefined,
	    tab: this.props.tab,
	    bets: []
	};
    },
    betsHandler: function(struct) {
	var state=this.state;
	state.bets=struct;
	this.setState(state);
	this.props.dataLoadedHandler(struct.length);
    },
    componentDidMount: function() {
	this.props.exoticsApi.fetchBlob("products/samples", this.betsHandler);
    },
    componentWillReceiveProps: function(nextProps) {
	var state=this.state;
	var updated=false;
	if (nextProps.tab!=this.props.tab) {
	    state.tab=nextProps.tab;
	    updated=true;
	}
	if (updated) {
	    this.setState(state);
	    this.props.exoticsApi.fetchBlob("products/samples", this.betsHandler);
	}
    },
    handleClicked: function(bet) {
	var state=this.state;
	state.bet=bet;
	this.setState(state);
	this.props.clickHandler(bet);
    },	
    render: function() {
	return React.DOM.table({
	    className: "table table-condensed table-bordered table-striped",
	    children: React.DOM.tbody({
		children: this.state.bets.slice(this.props.rowOffset, this.props.rowOffset+this.props.nRows).map(function(bet) {
		    return React.createElement(BrowseBetsRow, {
			bet: bet,
			clickHandler: this.handleClicked
		    });
		}.bind(this))
	    })
	});
    }
});

var BrowseBetsPanel=React.createClass({
    getInitialState: function() {
	return {
	    tab: "popular",
	    nRows: 5,
	    nItems: undefined,
	    rowOffset: 0,
	    paginatorLength: 5,
	    teams: []
	}
    },
    handleStepClicked: function(bet) {
	this.props.stepChangeHandler(1, bet);
    },
    handleTabClicked: function(tab) {
	var state=this.state;
	state.tab=tab.name;
	this.setState(state);
    },
    handlePaginatorClicked: function(rowOffset) {
	var state=this.state;
	state.rowOffset=rowOffset;
	this.setState(state);
    },
    handleDataLoaded: function(nItems) {
	var state=this.state;
	state.nItems=nItems;
	this.setState(state);
    },
    handleCreateBet: function() {
	this.props.stepChangeHandler(1, undefined);
    },
    render: function() {
	return React.DOM.div({
	    children: [
		React.createElement(ProcessSteps, {
		    steps: this.props.steps,
		    currentStep: 0
		}),
		React.DOM.div({
		    children: React.createElement(Tabs, {
			tabs: [
			    {
				name: "popular",
				label: "Popular"
			    },
			    {
				name: "daily",
				label: "Daily"
			    },
			    {
				name: "jackpots",
				label: "Jackpots"
			    },
			    {
				name: "my_bets",
				label: "My Bets"
			    }
			],
			selected: this.state.tab,
			clickHandler: this.handleTabClicked
		    })
		}),
		React.createElement(InlineList, {
		    items: [
			{
			    item: React.createElement(TeamSelector, {
				exoticsApi: this.props.exoticsApi,
				className: "form-control input-sm btn-secondary",
				item: {},
				defaultOption: {
				    label: "All Teams",
				},
				changeHandler: function(struct) {
				    console.log(JSON.stringify(struct));
				}
			    }),
			    width: 100
			},
			{
			    item: React.createElement(ProductSelector, {
				exoticsApi: this.props.exoticsApi,
				className: "form-control input-sm btn-secondary",
				item: {},
				defaultOption: {
				    label: "All Exotics"
				},
				changeHandler: function(name, value) {
				    console.log(name+"="+value);
				}
			    }),
			    width: 100
			},
			{
			    item: React.DOM.a({
				className: "btn btn-sm btn-primary",
				onClick: this.handleCreateBet,
				children: "Build My Own"
			    }),
			    width: 100,
			    right: true
			}
		    ],
		    style: {
			"margin-right": "7px"
		    }
		}),
		React.createElement(BrowseBetsTable, {
		    exoticsApi: this.props.exoticsApi,
		    clickHandler: this.handleStepClicked,
		    dataLoadedHandler: this.handleDataLoaded,
		    rowOffset: this.state.rowOffset,
		    nRows: this.state.nRows,
		    tab: this.state.tab,
		    team: this.state.team
		}),
		(this.state.nItems!=undefined) ? React.DOM.div({
		    className: "text-center",
		    children: React.createElement(Paginator, {
			table: {
			    nItems:this.state.nItems,
			    nRows: this.state.nRows,
			    offset: this.state.rowOffset
			},
			paginator: {
			    length: this.state.paginatorLength
			},
			clickHandler: this.handlePaginatorClicked
		    })
		}) : null
	    ]
	});
    }
});
