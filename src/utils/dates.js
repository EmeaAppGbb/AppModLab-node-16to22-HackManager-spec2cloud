const { format, parseISO } = require('date-fns');

function formatDate(dateStr) {
  return format(parseISO(dateStr), 'MMM d, yyyy');
}

function formatDateTime(dateStr) {
  return format(parseISO(dateStr), 'MMM d, yyyy h:mm a');
}

function formatHackathonDates(hackathon) {
  hackathon.start_date_formatted = formatDate(hackathon.start_date);
  hackathon.end_date_formatted = formatDate(hackathon.end_date);
  return hackathon;
}

module.exports = { formatDate, formatDateTime, formatHackathonDates };
