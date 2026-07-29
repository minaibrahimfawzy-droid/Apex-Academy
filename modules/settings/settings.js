function settingsModule() {
    return {
        settings: { centerName: '', adminName: '', password: '' },
        initSettings() {
            const saved = JSON.parse(localStorage.getItem('apex_settings'));
            if (saved) this.settings = saved;
        },
        saveSettings() {
            localStorage.setItem('apex_settings', JSON.stringify(this.settings));
            alert('تم حفظ الإعدادات بنجاح!');
        }
    }
}