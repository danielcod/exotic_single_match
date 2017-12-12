export const DateUtils = {
    formatMonth: function (date) {
        let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        return months[date.getMonth()] // NB JS months indexed at zero
    },
    formatDaySuffix: function (date) {
        let day = date.getDate()
        if ((day === 1) || (day === 21) || (day === 31)) {
            return "st"
        } else if ((day === 2) || (day === 22)) {
            return "nd"
        } else if ((day === 3) || (day === 23)) {
            return "rd"
        } else {
            return "th"
        }
    },
    formatDate: function (date) {
        let month = this.formatMonth(date)
        let day = date.getDate()
        let suffix = this.formatDaySuffix(date)
        return month + " " + day + suffix
    },
    formatMinutes: function (date) {
        let minutes = date.getMinutes()
        return (minutes < 10) ? '0' + minutes : minutes
    },
    formatTime: function (date) {
        return date.getHours() + ":" + this.formatMinutes(date)
    },
    formatHour: function (date) {
        let hours = date.getHours()
        let suffix = hours >= 12 ? 'pm' : 'am'
        hours = hours > 12 ? hours - 12 : hours
        return hours + suffix
    },
    formatRemainedDays: function (currentDate, futureDate) {
        let diff = futureDate.getTime() - currentDate.getTime()
        if (diff > 0) {
            return "+" + Math.round((futureDate.getTime() - currentDate.getTime()) / (24 * 60 * 60 * 1000)) + "d"
        } else {
            return Math.round((futureDate.getTime() - currentDate.getTime()) / (24 * 60 * 60 * 1000)) + "d"
        }
    }
}