/**
 * backup/backup.js - النسخ الاحتياطي والاستيراد والتصدير
 */
import { exportAllData, importAllData, getBackupStats } from '../../core/storage.js';
import { downloadJSON } from '../../core/helpers.js';
import { CURRENT_VERSION } from '../../core/constants.js';

/**
 * تصدير نسخة احتياطية كاملة
 * @param {object} store
 */
export function exportBackup(store) {
    const content  = exportAllData(store);
    const filename = `Apex_Backup_v${CURRENT_VERSION}_${new Date().toISOString().slice(0, 10)}.json`;
    downloadJSON(content, filename);
}

/**
 * استيراد نسخة احتياطية من ملف JSON
 * @param {object} store
 * @param {File} file
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export function importBackup(store, file) {
    return new Promise((resolve) => {
        if (!file) return resolve({ success: false, error: 'لم يتم اختيار ملف' });

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                importAllData(store, data);
                resolve({ success: true });
            } catch {
                resolve({ success: false, error: 'الملف غير صالح أو تالف!' });
            }
        };
        reader.onerror = () => resolve({ success: false, error: 'خطأ في قراءة الملف' });
        reader.readAsText(file);
    });
}

/**
 * الحصول على إحصائيات قاعدة البيانات
 * @param {object} store
 * @returns {object}
 */
export function getBackupInfo(store) {
    return getBackupStats(store);
}
