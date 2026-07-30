/**
 * auth.js - نظام المصادقة والجلسات
 */
import { CURRENT_VERSION } from './constants.js';
import { saveLoginSession, loadLoginSession } from './storage.js';

/**
 * حساب كلمة المرور الديناميكية بناءً على الشهر والسنة
 * @returns {string} كلمة المرور الحالية
 */
export function getDynamicPassword() {
    const now   = new Date();
    const month = now.getMonth() + 1;
    const year  = now.getFullYear();
    return (month >= 1 && month <= 5)
        ? String(1 * year)
        : String(6 * year);
}

/**
 * التحقق من صحة كلمة المرور
 * @param {string} input - كلمة المرور المدخلة
 * @returns {boolean}
 */
export function validatePassword(input) {
    return input.trim() === getDynamicPassword();
}

/**
 * التحقق من صلاحية الجلسة المحفوظة
 * @returns {boolean}
 */
export function checkSession() {
    const session = loadLoginSession();
    if (!session) return false;

    const now      = new Date();
    const curMonth = now.getMonth() + 1;
    const curYear  = now.getFullYear();

    return (
        session.month   === curMonth &&
        session.year    === curYear  &&
        session.version === CURRENT_VERSION
    );
}

/**
 * تسجيل الدخول وحفظ الجلسة
 */
export function login() {
    saveLoginSession();
}

/**
 * تسجيل الخروج وحذف الجلسة
 */
export function logout() {
    localStorage.removeItem('apex_login_session');
}
