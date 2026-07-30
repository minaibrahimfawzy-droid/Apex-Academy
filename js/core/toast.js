/**
 * toast.js - نظام التنبيهات الفورية
 */
import { TOAST_DURATION, TOAST_TYPES } from './constants.js';

/** @type {number|null} معرّف مؤقت الإخفاء */
let _toastTimer = null;

/**
 * إنشاء حالة Toast الافتراضية
 * @returns {{ show: boolean, message: string, type: string }}
 */
export function createToastState() {
    return { show: false, message: '', type: TOAST_TYPES.SUCCESS };
}

/**
 * عرض رسالة تنبيه
 * @param {object} store - مرجع Alpine store
 * @param {string} message - نص الرسالة
 * @param {string} [type='success'] - نوع التنبيه
 */
export function showToast(store, message, type = TOAST_TYPES.SUCCESS) {
    if (_toastTimer) clearTimeout(_toastTimer);

    store.toast.message = message;
    store.toast.type    = type;
    store.toast.show    = true;

    _toastTimer = setTimeout(() => {
        store.toast.show = false;
        _toastTimer = null;
    }, TOAST_DURATION);
}

/**
 * إخفاء التنبيه الحالي فوراً
 * @param {object} store - مرجع Alpine store
 */
export function hideToast(store) {
    if (_toastTimer) clearTimeout(_toastTimer);
    store.toast.show = false;
    _toastTimer = null;
}
