/**
 * teachers/crud.js - إدارة المعلمين
 */
import { generateId } from '../../core/helpers.js';
import { syncStorage } from '../../core/storage.js';

/**
 * حفظ معلم (إضافة أو تعديل)
 */
export function saveTeacher(store, data, id) {
    if (!data.name || !data.name.trim()) return false;

    if (id) {
        const idx = store.teachers.findIndex(t => t.id === id);
        if (idx !== -1) {
            store.teachers[idx] = { ...store.teachers[idx], ...data };
            syncStorage(store);
            return true;
        }
        return false;
    }

    store.teachers.push({ id: generateId(), ...data });
    syncStorage(store);
    return true;
}

/**
 * التحقق من إمكانية حذف معلم
 * @returns {{ canDelete: boolean, reason?: string, teacher?: object }}
 */
export function checkCanDeleteTeacher(store, id) {
    const tObj = store.teachers.find(t => t.id === id);
    if (!tObj) return { canDelete: false, reason: 'المعلم غير موجود' };

    const hasGroups = store.groups.some(g => g.teacherId === tObj.id);
    if (hasGroups) {
        return { canDelete: false, reason: 'لا يمكن حذف المعلم لارتباطه بمجموعات نشطة!' };
    }
    return { canDelete: true, teacher: tObj };
}

/**
 * حذف معلم (بعد التحقق والتأكيد)
 */
export function performDeleteTeacher(store, id) {
    const tObj = store.teachers.find(t => t.id === id);
    if (!tObj) return null;
    store.teachers = store.teachers.filter(t => t.id !== id);
    syncStorage(store);
    return tObj.name;
}

/**
 * إحصائيات معلم
 */
export function getTeacherStats(t, groups, students, attendance) {
    const groupsTaught = groups.filter(g => g.teacherId === t.id);
    const groupCount   = groupsTaught.length;
    const studentCount = groupsTaught.reduce(
        (s, g) => s + students.filter(st => st.group === g.name && st.year === g.year).length, 0
    );
    const groupNames    = groupsTaught.map(g => g.name);
    const sessionsCount = new Set(
        attendance.filter(a => groupNames.includes(a.group)).map(a => a.date)
    ).size;

    return { groupCount, studentCount, sessionsCount };
}
