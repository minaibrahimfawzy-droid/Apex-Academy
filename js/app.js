/**
 * app.js - نقطة انطلاق أكاديمية أبيكس v115
 * المسؤولية: تهيئة Alpine وتسجيل الـ Store فقط
 */
import { initStore } from './store.js';

/**
 * تهيئة التطبيق الكاملة
 * يُستدعى تلقائياً عند جاهزية Alpine
 */
document.addEventListener('alpine:init', () => {
    initStore();
});
