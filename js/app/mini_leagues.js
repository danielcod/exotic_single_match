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
    isFormComplete: function() {
	var league0=$("table[name='your_team']").find("select[name='league'] option:selected").val();
	if (league0=='') {
	    return false;
	};
	var team0=$("table[name='your_team']").find("select[name='team'] option:selected").val();
	if (team0=='') {
	    return false;
	};
	var payoff=$("select[name='payoff'] option:selected").val();
	if (payoff=='') {
	    return false;
	};
	var league1=$("table[name='versus']").find("select[name='league'] option:selected").val();
	if (league1=='') {
	    return false;
	};
	var team1=$("table[name='versus']").find("select[name='team'] option:selected").val();
	if (team1=='') {
	    return false;
	};
	var expiry=$("select[name='expiry'] option:selected").val();
	if (expiry=='') {
	    return false;
	};
	return true;
    },
    serialiseForm: function() {
	var league0=$("table[name='your_team']").find("select[name='league'] option:selected").val();
	var team0=$("table[name='your_team']").find("select[name='team'] option:selected").val();
	var league1=$("table[name='versus']").find("select[name='league'] option:selected").val();
	var team1=$("table[name='versus']").find("select[name='team'] option:selected").val();
	var payoff=$("select[name='payoff'] option:selected").val();
	var expiry=$("select[name='expiry'] option:selected").val();
	return {"teams": [{"league": league0,
			   "name": team0,
			   "selected": true},
			  {"league": league1,
			   "name": team1}],
		"payoff": payoff,
		"expiry": expiry};
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
	    if (EEMiniLeagues.isFormComplete()) {
		var struct=EEMiniLeagues.serialiseForm();
		console.log(JSON.stringify(struct));
	    } else {
		$("span[name='price']").text("[...]");
	    };
	});
    },
    bindRow: function(row) {
	this.bindLeague(row);
	this.bindTeam(row);
	this.initLeagues(row);	
    },
    bind: function() {
	// init your team
	var yourTeamRow=$("table[name='your_team'] tbody tr:first");
	this.bindRow(yourTeamRow);
	// init payoffs
	$("select[name='payoff']").change(function() {
	    if (EEMiniLeagues.isFormComplete()) {
		var struct=EEMiniLeagues.serialiseForm();
		console.log(JSON.stringify(struct));
	    } else {
		$("span[name='price']").text("[...]");
	    };
	});
	this.initPayoffs();
	// init versus[0]
	var versusRow=$("table[name='versus'] tbody tr:first");
	this.bindRow(versusRow);
	// bind expiries
	$("select[name='expiry']").change(function() {
	    if (EEMiniLeagues.isFormComplete()) {
		var struct=EEMiniLeagues.serialiseForm();
		console.log(JSON.stringify(struct));
	    } else {
		$("span[name='price']").text("[...]");
	    };
	});
	this.initExpiries();
    }
};

