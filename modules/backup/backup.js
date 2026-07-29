function backupModule() {
    return {
        exportData() {
            const data = {
                students: ApexStorage.get(ApexConfig.storageKeys.students, []),
                teachers: ApexStorage.get(ApexConfig.storageKeys.teachers, []),
                attendance: ApexStorage.get(ApexConfig.storageKeys.attendance, []),
                subscriptions: ApexStorage.get(ApexConfig.storageKeys.subscriptions, []),
                finance: ApexStorage.get(ApexConfig.storageKeys.finance, []),
                settings: ApexStorage.get(ApexConfig.storageKeys.settings, {})
            };

            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `apex_backup_${new Date().toISOString().split('T')[0]}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();

            ApexUI.showToast('تم تصدير النسخة الاحتياطية بنجاح', 'success');
        },

        importData(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const parsed = JSON.parse(e.target.result);
                    if (parsed.students) ApexStorage.set(ApexConfig.storageKeys.students, parsed.students);
                    if (parsed.teachers) ApexStorage.set(ApexConfig.storageKeys.teachers, parsed.teachers);
                    if (parsed.attendance) ApexStorage.set(ApexConfig.storageKeys.attendance, parsed.attendance);
                    if (parsed.subscriptions) ApexStorage.set(ApexConfig.storageKeys.subscriptions, parsed.subscriptions);
                    if (parsed.finance) ApexStorage.set(ApexConfig.storageKeys.finance, parsed.finance);
                    if (parsed.settings) ApexStorage.set(ApexConfig.storageKeys.settings, parsed.settings);

                    ApexUI.showToast('تم استعادة البيانات بنجاح!', 'success');
                    setTimeout(() => location.reload(), 1500);
                } catch (err) {
                    ApexUI.showToast('ملف غير صالح أو تالف', 'error');
                }
            };
            reader.readAsText(file);
        }
    };
}