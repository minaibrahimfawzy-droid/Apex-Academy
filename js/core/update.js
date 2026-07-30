class UpdateHandler {
    static async check() {
        try {
            const response = await fetch('version.json?nocache=' + Date.now());
            if (response.ok) {
                const data = await response.json();
                return {
                    hasUpdate: String(data.version) !== window.APP_VERSION,
                    remoteVersion: String(data.version)
                };
            }
        } catch (err) {
            console.warn("تنبيه: تعذر جلب معلومات التحديث:", err);
        }
        return { hasUpdate: false, remoteVersion: window.APP_VERSION };
    }
}
window.UpdateHandler = UpdateHandler;