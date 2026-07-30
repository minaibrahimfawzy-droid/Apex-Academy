/**
 * finance/payments.js - إدارة المدفوعات والتحصيل
 */
import { todayAr, generateId } from '../../core/helpers.js';
import { syncStorage } from '../../core/storage.js';

/**
 * تسجيل دفعة اشتراك جديدة
 * @param {object} store
 * @param {object} paymentData - { studentId, amount, month }
 * @returns {boolean}
 */
export function savePayment(store, paymentData) {
    const student = store.students.find(s => s.id === paymentData.studentId);
    if (!student) return false;

    store.payments.unshift({
        id:   generateId(),
        date: todayAr(),
        ...paymentData,
    });
    syncStorage(store);
    return true;
}

/**
 * إحصائيات المالية للمجموعة
 * @param {object} group
 * @param {Array} students
 * @param {Array} payments
 * @param {Array} attendance
 * @returns {object}
 */
export function getGroupFinanceStats(group, students, payments, attendance) {
    const groupStudents   = students.filter(s => s.group === group.name && s.year === group.year);
    const groupStudentIds = groupStudents.map(s => s.id);
    const stCount         = groupStudents.length;

    const totalRev = payments
        .filter(p => groupStudentIds.includes(p.studentId))
        .reduce((s, p) => s + Number(p.amount), 0);

    const todayStr      = todayAr();
    const attendedToday = attendance.filter(a => a.group === group.name && a.date === todayStr).length;
    const absentToday   = Math.max(0, stCount - attendedToday);

    const totalAttendance = attendance.filter(a => a.group === group.name).length;
    const distinctDates   = new Set(attendance.filter(a => a.group === group.name).map(a => a.date)).size || 1;
    const avgAttendance   = stCount > 0
        ? Math.min(100, Math.round((totalAttendance / (stCount * distinctDates)) * 100))
        : 0;

    return { studentCount: stCount, revenue: totalRev, absentToday, avgAttendance };
}
