/**
 * update.js - نظام التحديثات التلقائية
 */
import { UPDATE_URL, CURRENT_VERSION, RELOAD_DELAY } from './constants.js';
import { saveDismissedVersion, loadDismissedVersion } from './storage.js';

/**
 * مقارنة رقمَي إصدارَين
 * @param {string} remote - الإصدار البعيد
 * @param {string} current - الإصدار الحالي
 * @returns {boolean} true إذا كان البعيد أحدث
 */
export function isNewerVersion(remote, current) {
    return parseFloat(remote) > parseFloat(current);
}

/**
 * التحقق من التحديثات من GitHub
 * @returns {Promise<{hasUpdate: boolean, remoteVersion: string}>}
 */
export async function checkForUpdates() {
    try {
        const response = await fetch(UPDATE_URL);
        if (!response.ok) throw new Error('Network error');
        const data = await response.json();

        if (!data || !data.version) return { hasUpdate: false, remoteVersion: '' };

        const dismissed = loadDismissedVersion();
        const hasUpdate = isNewerVersion(data.version, CURRENT_VERSION) &&
                          data.version !== dismissed;

        return { hasUpdate, remoteVersion: data.version };
    } catch {
        return { hasUpdate: false, remoteVersion: '' };
    }
}

/**
 * تنفيذ التحديث (رفض + إعادة تحميل)
 * @param {string} remoteVersion - الإصدار البعيد للحفظ
 */
export function triggerUpdate(remoteVersion) {
    saveDismissedVersion(remoteVersion);
    setTimeout(() => window.location.reload(true), RELOAD_DELAY);
}
