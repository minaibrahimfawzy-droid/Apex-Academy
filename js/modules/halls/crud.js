/**
 * halls/crud.js - إدارة القاعات
 */
import { generateId } from '../../core/helpers.js';
import { syncStorage } from '../../core/storage.js';

/**
 * حفظ قاعة (إضافة أو تعديل)
 */
export function saveHall(store, data, id) {
    if (!data.name || !data.name.trim()) return false;

    if (id) {
        const idx = store.halls.findIndex(h => h.id === id);
        if (idx !== -1) {
            store.halls[idx] = { ...store.halls[idx], ...data };
            syncStorage(store);
            return true;
        }
        return false;
    }

    store.halls.push({ id: generateId(), ...data });
    syncStorage(store);
    return true;
}

/**
 * التحقق من إمكانية حذف قاعة
 * @returns {{ canDelete: boolean, reason?: string, hall?: object }}
 */
export function checkCanDeleteHall(store, id) {
    const hallObj = store.halls.find(h => h.id === id);
    if (!hallObj) return { canDelete: false, reason: 'القاعة غير موجودة' };

    const hasGroups = store.groups.some(g => g.hallId === hallObj.id);
    if (hasGroups) {
        return { canDelete: false, reason: 'لا يمكن حذف القاعة لوجود مجموعات نشطة مستخدمة لها!' };
    }
    return { canDelete: true, hall: hallObj };
}

/**
 * حذف قاعة (بعد التحقق والتأكيد)
 */
export function performDeleteHall(store, id) {
    const hallObj = store.halls.find(h => h.id === id);
    if (!hallObj) return null;
    store.halls = store.halls.filter(h => h.id !== id);
    syncStorage(store);
    return hallObj.name;
}

/**
 * إحصائيات قاعة
 */
export function getHallStats(h, groups, students) {
    const groupsInHall = groups.filter(g => g.hallId === h.id);
    const groupCount   = groupsInHall.length;
    const studentCount = groupsInHall.reduce(
        (s, g) => s + students.filter(st => st.group === g.name && st.year === g.year).length, 0
    );
    const cap       = Number(h.capacity) || 1;
    const occupancy = Math.min(100, Math.round((studentCount / cap) * 100));
    return { groupCount, studentCount, occupancy };
}
