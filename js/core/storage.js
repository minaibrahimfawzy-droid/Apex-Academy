class StorageHandler {
    static load() {
        try {
            const raw = localStorage.getItem(window.STORAGE_KEYS.DB);
            if (!raw) {
                localStorage.setItem(window.STORAGE_KEYS.DB, JSON.stringify(window.DEFAULT_DB));
                return JSON.parse(JSON.stringify(window.DEFAULT_DB));
            }
            const parsed = JSON.parse(raw);
            return { ...window.DEFAULT_DB, ...parsed };
        } catch (e) {
            console.error("خطأ في قراءة التخزين المحلي:", e);
            return JSON.parse(JSON.stringify(window.DEFAULT_DB));
        }
    }

    static save(dbState) {
        try {
            localStorage.setItem(window.STORAGE_KEYS.DB, JSON.stringify(dbState));
        } catch (e) {
            console.error("خطأ في حفظ البيانات محلياً:", e);
        }
    }

    static calculateStats() {
        try {
            const raw = localStorage.getItem(window.STORAGE_KEYS.DB) || "";
            const bytes = raw.length * 2; 
            if (bytes === 0) return "0 B";
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        } catch (e) {
            return "غير معروف";
        }
    }
}
window.StorageHandler = StorageHandler;