/**
 * constants.js - ثوابت النظام
 * جميع القيم الثابتة في مكان واحد
 */

/** إصدار النظام الحالي */
export const CURRENT_VERSION = '115';

/** مفاتيح LocalStorage */
export const STORAGE_KEYS = {
    YEARS:           'apex_years',
    HALLS:           'apex_halls',
    GROUPS:          'apex_groups',
    STUDENTS:        'apex_students',
    ATTENDANCE:      'apex_attendance',
    PAYMENTS:        'apex_payments',
    TEACHERS:        'apex_teachers',
    ARCHIVED_YEARS:  'apex_archived_years',
    LOGS:            'apex_logs',
    CARD_TEMPLATE:   'apex_card_template',
    LOGIN_SESSION:   'apex_login_session',
    LAST_DISMISSED:  'apex_last_dismissed_version',
};

/** رابط التحديث من GitHub */
export const UPDATE_URL = 'https://raw.githubusercontent.com/minaibrahimfawzy-droid/Apex-Academy/main/version.json';

/** بادئة كود الطالب */
export const STUDENT_CODE_PREFIX = 'APEX-';

/** عدد أرقام كود الطالب */
export const STUDENT_CODE_PADDING = 6;

/** رقم بداية الكود */
export const STUDENT_CODE_START = 99;

/** أقصى عدد للسجلات في اللوغ */
export const MAX_LOG_ENTRIES = 20;

/** مدة ظهور Toast بالمللي ثانية */
export const TOAST_DURATION = 4000;

/** أشهر السنة بالعربية */
export const ARABIC_MONTHS = [
    'يناير','فبراير','مارس','أبريل','مايو','يونيو',
    'يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'
];

/** إعدادات QR Code الافتراضية */
export const QR_DEFAULTS = { width: 80, height: 80 };

/** إعدادات QR Code في التفاصيل */
export const QR_DETAILS = { width: 120, height: 120 };

/** إعدادات QR Code في البطاقة */
export const QR_CARD = { width: 75, height: 75 };

/** إعدادات QR Code في الطباعة */
export const QR_PRINT = { width: 40, height: 40 };

/** إعدادات الكارنيه PDF */
export const CARD_PDF_OPTIONS = {
    margin: 0,
    image:   { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 3, useCORS: true },
    jsPDF:   { unit: 'mm', format: [85, 55], orientation: 'landscape' }
};

/** إعدادات ماسح QR بالكاميرا */
export const SCANNER_CONFIG = { fps: 15, qrbox: 250 };

/** وقت انتظار QR قبل التوليد (ms) */
export const QR_DELAY = 150;

/** وقت انتظار ماسح QR قبل التهيئة (ms) */
export const SCANNER_DELAY = 200;

/** وقت إعادة التحميل بعد التحديث (ms) */
export const RELOAD_DELAY = 1000;

/** أنواع الـ Toast */
export const TOAST_TYPES = {
    SUCCESS: 'success',
    ERROR:   'error',
    WARNING: 'warning',
    INFO:    'info',
};
