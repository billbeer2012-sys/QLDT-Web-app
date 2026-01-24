/*
* D:\QLDT-app\server\utils\weekCalculator.js
* Phiên bản: 27/08/2025
* Tóm tắt:
* - File tiện ích mới chứa hàm tính toán tuần cho TKB.
*/
const moment = require('moment-timezone');

function calculateWeeks(startDate, endDate) {
   const weeks = [];
   let current = moment(startDate).tz('Asia/Ho_Chi_Minh').startOf('isoWeek');
   let weekNumber = 1;

   while (current.isBefore(moment(endDate).tz('Asia/Ho_Chi_Minh'))) {
       const weekStart = current.clone();
       const weekEnd = current.clone().endOf('isoWeek');
       weeks.push({
           week: weekNumber,
           label: `Tuần ${weekNumber}: ${weekStart.format('DD/MM/YYYY')} - ${weekEnd.format('DD/MM/YYYY')}`,
           value: `${weekStart.format('YYYY-MM-DD')}_${weekEnd.format('YYYY-MM-DD')}`
       });
       current.add(1, 'week');
       weekNumber++;
   }
   return weeks;
}

module.exports = calculateWeeks;
