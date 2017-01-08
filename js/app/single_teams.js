var EESingleTeams={
    initLeagues: function() {
	$.ajax({
	    dataType: "json",
	    url: "/api/leagues",
	    success: function(struct) {
		var select=$("select[name='league']");
		$(select).find("option").not(":first").remove();
		$.each(struct, function(i, league) {
		    var option=$("<option>").attr("value", league["name"]).text(league["name"]);
		    $(select).append(option);
		});
	    }
	});
    },
    initExpiries: function() {
	$.ajax({
	    dataType: "json",
	    url: "/api/expiries",
	    success: function(struct) {
		var select=$("select[name='expiry']");
		$(select).find("option").not(":first").remove();
		$.each(struct, function(i, expiry) {
		    var option=$("<option>").attr("value", expiry["value"]).text(expiry["label"]);
		    $(select).append(option);
		});
	    }
	});
    },
    initTeams: function(leaguename) {
	$.ajax({
	    dataType: "json",
	    url: "/api/teams?league="+leaguename,
	    success: function(struct) {
		var select=$("select[name='team']");
		$(select).find("option").not(":first").remove();
		$.each(struct, function(i, team) {
		    var option=$("<option>").attr("value", team["name"]).text(team["name"]);
		    $(select).append(option);
		});
	    }
	});
    },
    initPayoffs: function(leaguename) {
	$.ajax({
	    dataType: "json",
	    url: "/api/quant/positions/single_teams/payoff?league="+leaguename,
	    success: function(struct) {
		var select=$("select[name='payoff']");
		$(select).find("option").not(":first").remove();
		$.each(struct, function(i, payoff) {
		    var option=$("<option>").attr("value", payoff["name"]).text(payoff["name"]);
		    $(select).append(option);
		});
	    }
	});
    },
    isFormComplete: function() {
	var complete=true;
	$.each(["league", "team", "payoff", "expiry"], function(i, attr) {
	    var value=$("select[name='"+attr+"'] option:selected").val();
	    if (value=='') {
		complete=false;
	    };
	});
	return complete;
    },
    serialiseForm: function() {
	var params={};
	$.each(["league", "team", "payoff", "expiry"], function(i, attr) {
	    params[attr]=$("select[name='"+attr+"'] option:selected").val();
	});
	return params;
    },
    updatePrice: function(params) {
	$("span[name='price']").text("[updating ..]");
	$.ajax({
	    type: "POST",
	    url: "/api/quant/positions/single_teams/price",
	    data: JSON.stringify(params),
	    contentType: "application/json",
	    dataType: "json",
	    success: function(struct) {
		if (struct["decimal_price"]==null) {
		    $("span[name='price']").text("[no price; sorry]");
		} else {
		    $("span[name='price']").text(struct["decimal_price"])
		};
	    }
	});
    },
    bind: function() {
	// bind leagues
	$("select[name='league']").change(function() {
	    $("span[name='price']").text("[...]");
	    $("select[name='team'] option").not(":first").remove();
	    $("select[name='payoff'] option").not(":first").remove();	    
	    var leaguename=$(this).find("option:selected").val();
	    if (leaguename!='') {
		EESingleTeams.initTeams(leaguename);
		EESingleTeams.initPayoffs(leaguename);
	    };
	});
	// bind teams
	$("select[name='team']").change(function() {
	    if (EESingleTeams.isFormComplete()) {
		var params=EESingleTeams.serialiseForm();
		EESingleTeams.updatePrice(params);
	    };
	});
	// bind payoffs
	$("select[name='payoff']").change(function() {
	    if (EESingleTeams.isFormComplete()) {
		var params=EESingleTeams.serialiseForm();
		EESingleTeams.updatePrice(params);
	    };
	});
	// bind expiries
	$("select[name='expiry']").change(function() {
	    if (EESingleTeams.isFormComplete()) {
		var params=EESingleTeams.serialiseForm();
		EESingleTeams.updatePrice(params);
	    };
	});
	// init leagues
	this.initLeagues();
	// init expiries
	this.initExpiries();
    }
};

