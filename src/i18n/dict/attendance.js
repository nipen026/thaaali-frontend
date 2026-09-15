// AttendancePage.jsx — check-in/out widget, team roster, and the owner's attendance report.
// English-only for now (same precedent as auth.js/landing.js) — translate() already falls
// back lang -> English -> the inline fallback string, so nothing breaks in other languages.
export default {
  en: {
    'attendance.status.not_checked_in': 'Not checked in', 'attendance.status.checked_in': 'Checked in',
    'attendance.status.on_break': 'On break', 'attendance.status.checked_out': 'Checked out',
    'attendance.readyToStart': 'Ready to start your shift?', 'attendance.checkedInSince': 'Checked in at {t}',
    'attendance.onBreakNote': "Break started — end it when you're back", 'attendance.checkedOutAt': 'Checked out at {t}',
    'attendance.workedToday': 'worked today', 'attendance.requiredSuffix': '{h} required',
    'attendance.checkIn': 'Check In', 'attendance.checkOut': 'Check Out',
    'attendance.startBreak': 'Start Break', 'attendance.endBreak': 'End Break',
    'attendance.doneForToday': "You're done for today. See you tomorrow!",
    'attendance.checkedInToast': 'Checked in!', 'attendance.checkedOutToast': 'Checked out',
    'attendance.breakStartedToast': 'Break started', 'attendance.breakEndedToast': 'Break ended',
    'attendance.staffCheckedIn': '{n} checked in', 'attendance.staffCheckedOut': '{n} checked out',
    'attendance.somethingWrong': 'Something went wrong',
    'attendance.teamRosterToday': 'Team Roster — Today', 'attendance.noActiveStaff': 'No active staff members',
    'attendance.thisMonth': 'This Month', 'attendance.thisYear': 'This Year', 'attendance.customRange': 'Custom Range', 'attendance.to': 'to',
    'attendance.staffTracked': 'Staff Tracked', 'attendance.avgHoursPerDay': 'Avg Hours/Day',
    'attendance.totalOvertime': 'Total Overtime', 'attendance.totalShortfall': 'Total Shortfall',
    'attendance.reportTitle': 'Attendance Report', 'attendance.noStaffToReport': 'No staff to report on',
    'attendance.colStaff': 'Staff', 'attendance.colDays': 'Days', 'attendance.colWorked': 'Worked', 'attendance.colBreak': 'Break',
    'attendance.colRequired': 'Required', 'attendance.colVariance': 'Variance', 'attendance.colDate': 'Date',
    'attendance.colIn': 'In', 'attendance.colOut': 'Out', 'attendance.colInOut': 'In – Out',
    'attendance.viewDetails': 'View details', 'attendance.detailTitle': '{n} — Daily Breakdown', 'attendance.noRecordsInRange': 'No attendance in this range',
  },
};
