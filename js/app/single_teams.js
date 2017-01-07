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
    bind: function() {
	// bind leagues
	$("select[name='league']").change(function() {
	    var leaguename=$(this).find("option:selected").val();
	    $("select[name='team'] option").not(":first").remove();
	    EESingleTeams.initTeams(leaguename);
	    $("select[name='payoff'] option").not(":first").remove();
	    EESingleTeams.initPayoffs(leaguename);
	});
	// bind teams
	$("select[name='team']").change(function() {
	    console.log(EESingleTeams.isFormComplete());
	});
	// bind payoffs
	$("select[name='payoff']").change(function() {
	    console.log(EESingleTeams.isFormComplete());
	});
	// bind expiries
	$("select[name='expiry']").change(function() {
	    console.log(EESingleTeams.isFormComplete());
	});
	// init leagues
	this.initLeagues();
	// init expiries
	this.initExpiries();
    }
};

