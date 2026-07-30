/**
 * router.js - إدارة التبويبات والتنقل
 */

/** التبويب الافتراضي */
export const DEFAULT_TAB = 'home';

/** قائمة التبويبات المتاحة */
export const TABS = [
    { id: 'home',      icon: 'fa-house',           label: 'الرئيسية'         },
    { id: 'students',  icon: 'fa-user-graduate',   label: 'الطلاب والتحكم'  },
    { id: 'register',  icon: 'fa-plus',             label: 'تسجيل طالب'      },
    { id: 'attendance',icon: 'fa-qrcode',           label: 'قارئ الحضور'     },
    { id: 'groups',    icon: 'fa-layer-group',      label: 'المجموعات'        },
    { id: 'accounts',  icon: 'fa-money-bill-wave',  label: 'التحصيل والمالية' },
    { id: 'teachers',  icon: 'fa-chalkboard-user',  label: 'المعلمين'         },
    { id: 'halls',     icon: 'fa-door-open',        label: 'القاعات'          },
    { id: 'years',     icon: 'fa-calendar-alt',     label: 'إدارة السنوات'   },
    { id: 'cards',     icon: 'fa-id-card',          label: 'الكارنيهات'       },
    { id: 'backup',    icon: 'fa-database',         label: 'النسخ الاحتياطي'  },
];

/**
 * التحقق من أن tab معرّف
 * @param {string} tab
 * @returns {boolean}
 */
export function isValidTab(tab) {
    return TABS.some(t => t.id === tab);
}

/**
 * قراءة التبويب الأولي من URL hash
 * @returns {string}
 */
export function getInitialTab() {
    const hash = window.location.hash.replace('#', '');
    return isValidTab(hash) ? hash : DEFAULT_TAB;
}

/**
 * تحديث URL hash عند تغيير التبويب
 * @param {string} tab
 */
export function setTabHash(tab) {
    if (history.replaceState) {
        history.replaceState(null, '', '#' + tab);
    }
}
