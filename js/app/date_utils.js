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
