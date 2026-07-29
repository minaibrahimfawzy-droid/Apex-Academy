function settingsModule() {
    return {
        settings: {
            academyName: '',
            currency: 'ج.م'
        },

        initSettings() {
            this.settings = ApexStorage.get(ApexConfig.storageKeys.settings, ApexConfig.defaultSettings);
        },

        saveSettings() {
            ApexStorage.set(ApexConfig.storageKeys.settings, this.settings);
            ApexUI.showToast('تم حفظ الإعدادات بنجاح', 'success');
        }
    };
}