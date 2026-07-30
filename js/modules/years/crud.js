/**
 * years/crud.js - إدارة السنوات الدراسية والأرشفة
 */
import { generateId, todayAr } from '../../core/helpers.js';
import { syncStorage, saveArchivedYears } from '../../core/storage.js';

/**
 * حفظ سنة دراسية
 */
export function saveYear(store, data, id) {
    if (!data.name || !data.name.trim()) return false;

    if (id) {
        const idx = store.years.findIndex(y => y.id === id);
        if (idx !== -1) {
            store.years[idx] = { ...store.years[idx], ...data };
            syncStorage(store);
            return true;
        }
        return false;
    }

    store.years.push({ id: generateId(), ...data });
    syncStorage(store);
    return true;
}

/**
 * التحقق من إمكانية حذف سنة
 * @returns {{ canDelete: boolean, reason?: string, year?: object }}
 */
export function checkCanDeleteYear(store, id) {
    const yearObj = store.years.find(y => y.id === id);
    if (!yearObj) return { canDelete: false, reason: 'السنة غير موجودة' };

    const hasGroups = store.groups.some(g => g.year === yearObj.name);
    if (hasGroups) {
        return { canDelete: false, reason: 'لا يمكن حذف السنة لارتباطها بمجموعات نشطة!' };
    }
    return { canDelete: true, year: yearObj };
}

/**
 * حذف سنة (بعد التحقق والتأكيد)
 */
export function performDeleteYear(store, id) {
    const yearObj = store.years.find(y => y.id === id);
    if (!yearObj) return null;
    store.years = store.years.filter(y => y.id !== id);
    syncStorage(store);
    return yearObj.name;
}

/**
 * أرشفة وترحيل السنة الحالية
 */
export function archiveCurrentYear(store, archiveName) {
    if (!archiveName || !archiveName.trim()) return false;

    const archiveData = {
        id:        generateId(),
        name:      archiveName,
        date:      todayAr(),
        years:     [...store.years],
        groups:    [...store.groups],
        students:  [...store.students],
        attendance:[...store.attendance],
        payments:  [...store.payments],
    };

    store.archivedYears.unshift(archiveData);
    saveArchivedYears(store.archivedYears);

    store.students   = [];
    store.attendance = [];
    store.payments   = [];
    syncStorage(store);

    return true;
}

/**
 * استعادة أرشيف سنة سابقة
 */
export function restoreArchivedYear(store, archived) {
    store.years      = [...archived.years];
    store.groups     = [...archived.groups];
    store.students   = [...archived.students];
    store.attendance = [...archived.attendance];
    store.payments   = [...archived.payments];
    syncStorage(store);
}

/**
 * حذف أرشيف سنة
 */
export function deleteArchivedYear(store, id) {
    store.archivedYears = store.archivedYears.filter(a => a.id !== id);
    saveArchivedYears(store.archivedYears);
}
