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
    bind: function() {
	// bind leagues
	$("select[name='league']").change(function() {
	    var leaguename=$(this).find("option:selected").val();
	    if (leaguename!='') {
		var row=$("table[name='your_team'] tbody tr:first");
		EEMiniLeagues.initTeams(leaguename, row);
		EEMiniLeagues.initPayoffs(leaguename);
	    };
	});
	// bind teams
	$("select[name='team']").change(function() {
	    console.log("teams");
	});
	// bind payoffs
	$("select[name='payoff']").change(function() {
	    console.log("payoffs")
	});
	// bind expiries
	$("select[name='expiry']").change(function() {
	    console.log("expiries")
	});
	// init leagues
	var row=$("table[name='your_team'] tbody tr:first");
	this.initLeagues(row);
	// init expiries
	this.initExpiries();
    }
};

