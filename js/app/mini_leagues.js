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
    initTeams: function(row, leaguename) {
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
    initPayoffs: function() {
	$.ajax({
	    dataType: "json",
	    url: "/site/mini_leagues/payoff",
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
    bindLeague: function(row) {
	$(row).find("select[name='league']").change(function() {
	    var leaguename=$(this).find("option:selected").val();
	    if (leaguename!='') {
		EEMiniLeagues.initTeams(row, leaguename);
	    };
	});
    },
    bindTeam: function(row) {
	$(row).find("select[name='team']").change(function() {
	    var teamname=$(this).find("option:selected").val();
	    console.log(teamname);
	});
    },
    bindRow: function(row) {
	this.bindLeague(row);
	this.bindTeam(row);
	this.initLeagues(row);	
    },
    bind: function() {
	// init your team
	this.bindRow($("table[name='your_team'] tbody tr:first"));	
	// init payoffs
	$("select[name='payoff']").change(function() {
	    console.log("payoffs")
	});
	this.initPayoffs();
	// bind expiries
	$("select[name='expiry']").change(function() {
	    console.log("expiries")
	});
	this.initExpiries();
    }
};

