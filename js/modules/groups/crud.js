/**
 * groups/crud.js - إدارة المجموعات الدراسية
 */
import { generateId } from '../../core/helpers.js';
import { syncStorage } from '../../core/storage.js';

/**
 * حفظ مجموعة (إضافة أو تعديل)
 * @param {object} store
 * @param {object} data
 * @param {number|null} id
 * @returns {boolean}
 */
export function saveGroup(store, data, id) {
    if (!data.name || !data.name.trim() || !data.year) return false;

    if (id) {
        const idx = store.groups.findIndex(g => g.id === id);
        if (idx !== -1) {
            store.groups[idx] = { ...store.groups[idx], ...data };
            syncStorage(store);
            return true;
        }
        return false;
    }

    store.groups.push({ id: generateId(), ...data });
    syncStorage(store);
    return true;
}

/**
 * التحقق من إمكانية حذف مجموعة (دون حذف فعلي)
 * @param {object} store
 * @param {number} id
 * @returns {{ canDelete: boolean, reason?: string, group?: object }}
 */
export function checkCanDeleteGroup(store, id) {
    const groupObj = store.groups.find(g => g.id === id);
    if (!groupObj) return { canDelete: false, reason: 'المجموعة غير موجودة' };

    const hasStudents = store.students.some(
        s => s.group === groupObj.name && s.year === groupObj.year
    );
    if (hasStudents) {
        return { canDelete: false, reason: 'لا يمكن حذف المجموعة لوجود طلاب مسجلين بها!' };
    }
    return { canDelete: true, group: groupObj };
}

/**
 * حذف مجموعة بشكل مباشر (بعد التحقق والتأكيد)
 * @param {object} store
 * @param {number} id
 * @returns {string|null} اسم المجموعة المحذوفة
 */
export function performDeleteGroup(store, id) {
    const groupObj = store.groups.find(g => g.id === id);
    if (!groupObj) return null;
    store.groups = store.groups.filter(g => g.id !== id);
    syncStorage(store);
    return groupObj.name;
}

/**
 * إحصائيات مجموعة
 */
export function getGroupStats(g, students, payments, attendance) {
    const groupStudents   = students.filter(s => s.group === g.name && s.year === g.year);
    const groupStudentIds = groupStudents.map(s => s.id);
    const stCount         = groupStudents.length;

    const totalRev = payments
        .filter(p => groupStudentIds.includes(p.studentId))
        .reduce((s, p) => s + Number(p.amount), 0);

    const todayStr      = new Date().toLocaleDateString('ar-EG');
    const attendedToday = attendance.filter(a => a.group === g.name && a.date === todayStr).length;
    const absentToday   = Math.max(0, stCount - attendedToday);

    const totalAttForGroup = attendance.filter(a => a.group === g.name).length;
    const distinctDates    = new Set(attendance.filter(a => a.group === g.name).map(a => a.date)).size || 1;
    const avgAttendance    = stCount > 0
        ? Math.min(100, Math.round((totalAttForGroup / (stCount * distinctDates)) * 100))
        : 0;

    return { studentCount: stCount, revenue: totalRev, absentToday, avgAttendance };
}
