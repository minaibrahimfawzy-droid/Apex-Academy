/**
 * students/crud.js - إدارة بيانات الطلاب
 */
import { generateNextStudentCode, todayAr, generateId } from '../../core/helpers.js';
import { syncStorage } from '../../core/storage.js';

/**
 * إحصائيات مالية طالب واحد
 * @param {object} student
 * @param {Array} payments
 * @returns {object}
 */
export function getStudentStats(student, payments) {
    if (!student) return { paid: 0, remaining: 0, ratio: 0, lastDate: '-', count: 0, isLate: false };

    const stPayments = payments.filter(p => p.studentId === student.id);
    const paid       = stPayments.reduce((s, p) => s + Number(p.amount), 0);
    const req        = Number(student.requiredAmount) || 0;
    const remaining  = Math.max(0, req - paid);
    const ratio      = req > 0 ? Math.min(100, Math.round((paid / req) * 100)) : 0;
    const lastDate   = stPayments.length > 0 ? stPayments[0].date : '-';

    return { paid, remaining, ratio, lastDate, count: stPayments.length, isLate: remaining > 0 };
}

/**
 * حفظ طالب (إضافة أو تعديل)
 * @param {object} store
 * @param {object} data - بيانات الطالب
 * @param {number|null} id - معرّف الطالب (null = جديد)
 * @returns {{ success: boolean, code?: string }}
 */
export function saveStudent(store, data, id) {
    if (!data.name || !data.year || !data.group) return { success: false };

    const targetGroup  = store.groups.find(g => g.name === data.group && g.year === data.year);
    const groupPrice   = targetGroup ? Number(targetGroup.price) : 0;

    if (id) {
        const idx = store.students.findIndex(s => s.id === id);
        if (idx !== -1) {
            store.students[idx] = { ...store.students[idx], ...data, requiredAmount: groupPrice };
            syncStorage(store);
            return { success: true };
        }
        return { success: false };
    }

    const code       = generateNextStudentCode(store.students);
    const newStudent = {
        id:             generateId(),
        code,
        qrCodeValue:    code,
        regDate:        todayAr(),
        requiredAmount: groupPrice,
        ...data,
    };
    store.students.unshift(newStudent);
    syncStorage(store);
    return { success: true, code };
}

/**
 * حذف طالب وكل سجلاته
 * @param {object} store
 * @param {number} id - معرّف الطالب
 * @returns {string|null} اسم الطالب المحذوف أو null
 */
export function deleteStudent(store, id) {
    const st = store.students.find(s => s.id === id);
    if (!st) return null;
    store.students  = store.students.filter(s => s.id !== id);
    store.attendance= store.attendance.filter(a => a.studentId !== id);
    store.payments  = store.payments.filter(p => p.studentId !== id);
    syncStorage(store);
    return st.name;
}

/**
 * البحث والفلترة في الطلاب
 * @param {Array} students
 * @param {Array} payments
 * @param {object} filters - { search, filterYear, filterGroup, filterLate }
 * @returns {Array}
 */
export function filterStudents(students, payments, filters) {
    const q = (filters.search || '').toLowerCase().trim();
    return students.filter(s => {
        const matchSearch = !q ||
            (s.name  && s.name.toLowerCase().includes(q)) ||
            (s.code  && s.code.toLowerCase().includes(q)) ||
            (s.phone && s.phone.includes(q));
        const matchYear   = !filters.filterYear  || s.year  === filters.filterYear;
        const matchGroup  = !filters.filterGroup || s.group === filters.filterGroup;

        if (filters.filterLate === 'late') {
            const stats = getStudentStats(s, payments);
            return matchSearch && matchYear && matchGroup && stats.isLate;
        }
        return matchSearch && matchYear && matchGroup;
    });
}
