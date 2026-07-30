/**
 * storage.js - إدارة LocalStorage
 * جميع عمليات القراءة والكتابة في مكان واحد
 */
import { STORAGE_KEYS, CURRENT_VERSION } from './constants.js';

/**
 * قراءة قيمة من LocalStorage بشكل آمن
 * @param {string} key - مفتاح LocalStorage
 * @param {*} [fallback=[]] - القيمة الافتراضية
 * @returns {*}
 */
export function loadKey(key, fallback = []) {
    try {
        const raw = localStorage.getItem(key);
        return raw !== null ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

/**
 * تحميل جميع بيانات التطبيق من LocalStorage
 * @returns {object} كل بيانات التطبيق
 */
export function loadAllData() {
    return {
        years:         loadKey(STORAGE_KEYS.YEARS,         []),
        halls:         loadKey(STORAGE_KEYS.HALLS,         []),
        groups:        loadKey(STORAGE_KEYS.GROUPS,        []),
        students:      loadKey(STORAGE_KEYS.STUDENTS,      []),
        attendance:    loadKey(STORAGE_KEYS.ATTENDANCE,    []),
        payments:      loadKey(STORAGE_KEYS.PAYMENTS,      []),
        teachers:      loadKey(STORAGE_KEYS.TEACHERS,      []),
        archivedYears: loadKey(STORAGE_KEYS.ARCHIVED_YEARS,[]),
        logs:          loadKey(STORAGE_KEYS.LOGS,          []),
        cardTemplate:  localStorage.getItem(STORAGE_KEYS.CARD_TEMPLATE) || '',
    };
}

/**
 * مزامنة جميع البيانات الرئيسية مع LocalStorage
 * @param {object} store - Alpine store
 */
export function syncStorage(store) {
    localStorage.setItem(STORAGE_KEYS.YEARS,      JSON.stringify(store.years));
    localStorage.setItem(STORAGE_KEYS.HALLS,      JSON.stringify(store.halls));
    localStorage.setItem(STORAGE_KEYS.GROUPS,     JSON.stringify(store.groups));
    localStorage.setItem(STORAGE_KEYS.STUDENTS,   JSON.stringify(store.students));
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(store.attendance));
    localStorage.setItem(STORAGE_KEYS.PAYMENTS,   JSON.stringify(store.payments));
    localStorage.setItem(STORAGE_KEYS.TEACHERS,   JSON.stringify(store.teachers));
}

/**
 * حفظ الأرشيف السنوي
 * @param {Array} archivedYears
 */
export function saveArchivedYears(archivedYears) {
    localStorage.setItem(STORAGE_KEYS.ARCHIVED_YEARS, JSON.stringify(archivedYears));
}

/**
 * حفظ اللوغ
 * @param {Array} logs
 */
export function saveLogs(logs) {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
}

/**
 * حفظ قالب الكارنيه
 * @param {string} template
 */
export function saveCardTemplate(template) {
    localStorage.setItem(STORAGE_KEYS.CARD_TEMPLATE, template);
}

/**
 * حفظ جلسة تسجيل الدخول
 */
export function saveLoginSession() {
    const now = new Date();
    localStorage.setItem(STORAGE_KEYS.LOGIN_SESSION, JSON.stringify({
        month:   now.getMonth() + 1,
        year:    now.getFullYear(),
        version: CURRENT_VERSION,
    }));
}

/**
 * قراءة جلسة تسجيل الدخول
 * @returns {object|null}
 */
export function loadLoginSession() {
    return loadKey(STORAGE_KEYS.LOGIN_SESSION, null);
}

/**
 * حفظ آخر إصدار تم رفضه
 * @param {string} version
 */
export function saveDismissedVersion(version) {
    localStorage.setItem(STORAGE_KEYS.LAST_DISMISSED, version);
}

/**
 * قراءة آخر إصدار تم رفضه
 * @returns {string}
 */
export function loadDismissedVersion() {
    return localStorage.getItem(STORAGE_KEYS.LAST_DISMISSED) || '';
}

/**
 * تصدير كامل البيانات كـ JSON
 * @param {object} store - Alpine store
 * @returns {string} JSON string
 */
export function exportAllData(store) {
    return JSON.stringify({
        years:         store.years,
        halls:         store.halls,
        groups:        store.groups,
        students:      store.students,
        attendance:    store.attendance,
        payments:      store.payments,
        teachers:      store.teachers,
        archivedYears: store.archivedYears,
        cardTemplate:  store.cardTemplate,
        exportDate:    new Date().toLocaleDateString('ar-EG'),
        version:       CURRENT_VERSION,
    }, null, 2);
}

/**
 * استيراد بيانات من JSON
 * @param {object} store - Alpine store
 * @param {object} data - البيانات المستوردة
 */
export function importAllData(store, data) {
    if (data.years)         store.years         = data.years;
    if (data.halls)         store.halls         = data.halls;
    if (data.groups)        store.groups        = data.groups;
    if (data.students)      store.students      = data.students;
    if (data.attendance)    store.attendance    = data.attendance;
    if (data.payments)      store.payments      = data.payments;
    if (data.teachers)      store.teachers      = data.teachers;
    if (data.archivedYears) store.archivedYears = data.archivedYears;
    if (data.cardTemplate)  store.cardTemplate  = data.cardTemplate;

    syncStorage(store);
    saveArchivedYears(store.archivedYears);
}

/**
 * حساب إحصائيات النسخ الاحتياطي
 * @param {object} store - Alpine store
 * @returns {object}
 */
export function getBackupStats(store) {
    const payload = {
        years: store.years, halls: store.halls, groups: store.groups,
        students: store.students, attendance: store.attendance,
        payments: store.payments, teachers: store.teachers
    };
    const bytes   = new Blob([JSON.stringify(payload)]).size;
    const sizeStr = bytes >= 1048576
        ? (bytes / 1048576).toFixed(2) + ' MB'
        : (bytes / 1024).toFixed(2) + ' KB';

    return {
        date:          new Date().toLocaleDateString('ar-EG'),
        version:       CURRENT_VERSION,
        size:          sizeStr,
        studentsCount: store.students.length,
        attendanceCount: store.attendance.length,
        paymentsCount: store.payments.length,
        groupsCount:   store.groups.length,
        teachersCount: store.teachers.length,
        recordsCount:  store.years.length + store.halls.length + store.groups.length +
                       store.students.length + store.attendance.length +
                       store.payments.length + store.teachers.length,
    };
}
