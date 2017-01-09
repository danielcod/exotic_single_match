var EEMiniLeagues={
    initLeagues: function(row) {
	$.ajax({
	    dataType: "json",
	    url: "/api/leagues",
	    success: function(struct) {
		var select=$(row).find("select[name='league']");
		$(select).find("option").not(":first").remove();
		$(select).find("option:first").prop("disabled", false).prop("selected", true);
		$.each(struct, function(i, league) {
		    var option=$("<option>").prop("value", league["name"]).text(league["name"]);
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
		$(select).find("option:first").prop("disabled", false).prop("selected", true);
		$.each(struct, function(i, expiry) {
		    var option=$("<option>").prop("value", expiry["value"]).text(expiry["label"]);
		    $(select).append(option);
		});
	    }
	});
    },
    initTeams: function(leaguename, row) {
	$.ajax({
	    dataType: "json",
	    url: "/api/teams?league="+leaguename,
	    success: function(struct) {
		var select=$(row).find("select[name='team']");
		$(select).find("option").not(":first").remove();
		$(select).find("option:first").prop("disabled", false).prop("selected", true);
		$.each(struct, function(i, team) {
		    var option=$("<option>").prop("value", team["name"]).text(team["name"]);
		    $(select).append(option);
		});
	    }
	});
    },
    initPayoffs: function(leaguename) {
	$.ajax({
	    dataType: "json",
	    url: "/site/mini_leagues/payoff?league="+leaguename,
	    success: function(struct) {
		var select=$("select[name='payoff']");
		$(select).find("option").not(":first").remove();
		$(select).find("option:first").prop("disabled", false).prop("selected", true);
		$.each(struct, function(i, payoff) {
		    var option=$("<option>").prop("value", payoff["name"]).text(payoff["name"]);
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
	var struct={"product": "single_teams", // TEMP
		    "query": params};
	$.ajax({
	    type: "POST",
	    url: "/api/pricing",
	    data: JSON.stringify(struct),
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
	    $(this).find("option:first").prop("disabled", true);
	    var leaguename=$(this).find("option:selected").val();
	    if (leaguename!='') {
		var row=$("table[name='your_team'] tbody tr:first");
		EEMiniLeagues.initTeams(leaguename, row);
		EEMiniLeagues.initPayoffs(leaguename);
	    };
	});
	// bind teams
	$("select[name='team']").change(function() {
	    $(this).find("option:first").prop("disabled", true);
	    if (EEMiniLeagues.isFormComplete()) {
		var params=EEMiniLeagues.serialiseForm();
		EEMiniLeagues.updatePrice(params);
	    };
	});
	// bind payoffs
	$("select[name='payoff']").change(function() {
	    $(this).find("option:first").prop("disabled", true);
	    if (EEMiniLeagues.isFormComplete()) {
		var params=EEMiniLeagues.serialiseForm();
		EEMiniLeagues.updatePrice(params);
	    };
	});
	// bind expiries
	$("select[name='expiry']").change(function() {
	    $(this).find("option:first").prop("disabled", true);
	    if (EEMiniLeagues.isFormComplete()) {
		var params=EEMiniLeagues.serialiseForm();
		EEMiniLeagues.updatePrice(params);
	    };
	});
	// init leagues
	var row=$("table[name='your_team'] tbody tr:first");
	this.initLeagues(row);
	// init expiries
	this.initExpiries();
    }
};

