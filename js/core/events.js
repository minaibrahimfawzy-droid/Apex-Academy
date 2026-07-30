/**
 * events.js - نظام الأحداث الداخلي
 * قناة اتصال بين الوحدات
 */

/** @type {Map<string, Set<Function>>} */
const _listeners = new Map();

/**
 * الاشتراك في حدث
 * @param {string} event - اسم الحدث
 * @param {Function} handler - معالج الحدث
 */
export function on(event, handler) {
    if (!_listeners.has(event)) _listeners.set(event, new Set());
    _listeners.get(event).add(handler);
}

/**
 * إلغاء الاشتراك في حدث
 * @param {string} event
 * @param {Function} handler
 */
export function off(event, handler) {
    _listeners.get(event)?.delete(handler);
}

/**
 * إطلاق حدث
 * @param {string} event - اسم الحدث
 * @param {*} [data] - البيانات المصاحبة
 */
export function emit(event, data) {
    _listeners.get(event)?.forEach(h => {
        try { h(data); } catch (e) { console.error(`Event error [${event}]:`, e); }
    });
}

/** أسماء الأحداث الثابتة */
export const EVENTS = {
    DATA_CHANGED:     'data:changed',
    STUDENT_ADDED:    'student:added',
    STUDENT_DELETED:  'student:deleted',
    ATTENDANCE_ADDED: 'attendance:added',
    PAYMENT_ADDED:    'payment:added',
    TAB_CHANGED:      'tab:changed',
    UPDATE_AVAILABLE: 'update:available',
};
