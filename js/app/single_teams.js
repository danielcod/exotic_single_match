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
    bind: function() {
	this.initLeagues();
	this.initExpiries();
    }
};

