function academySystem() {
    return {
        currentTab: 'dashboard',
        systemLocked: false,
        lockPasswordInput: '',
        lockError: false,
        globalSearchQuery: '',
        toasts: [],

        navItems: [
            { id: 'dashboard', label: 'لوحة التحكم', icon: 'fa-solid fa-chart-pie' },
            { id: 'students', label: 'إدارة الطلاب', icon: 'fa-solid fa-user-graduate' },
            { id: 'teachers', label: 'المدرسين', icon: 'fa-solid fa-chalkboard-user' },
            { id: 'attendance', label: 'الحضور والانصراف', icon: 'fa-solid fa-clipboard-user' },
            { id: 'subscriptions', label: 'الاشتراكات', icon: 'fa-solid fa-id-card' },
            { id: 'finance', label: 'المالية والأرباح', icon: 'fa-solid fa-wallet' },
            { id: 'reports', label: 'التقارير الشاملة', icon: 'fa-solid fa-file-invoice-dollar' },
            { id: 'cards', label: 'طباعة الكروت', icon: 'fa-solid fa-address-card' },
            { id: 'qr', label: 'ماسح QR', icon: 'fa-solid fa-qrcode' },
            { id: 'settings', label: 'الإعدادات', icon: 'fa-solid fa-gear' },
            { id: 'backup', label: 'النسخ الاحتياطي', icon: 'fa-solid fa-database' }
        ],

        initSystem() {
            window.AlpineStore = this;
            this.systemLocked = ApexSecurity.checkPeriodicLock();
            this.navigateTo(this.currentTab);
        },

        navigateTo(tabId) {
            this.currentTab = tabId;
            ApexRouter.loadRoute(tabId);
        },

        getCurrentTabLabel() {
            const item = this.navItems.find(i => i.id === this.currentTab);
            return item ? item.label : '';
        },

        verifyLockPassword() {
            if (ApexSecurity.verifyPassword(this.lockPasswordInput)) {
                this.systemLocked = false;
                this.lockError = false;
                this.lockPasswordInput = '';
                this.addToast('تم فتح قفل النظام بنجاح', 'success');
            } else {
                this.lockError = true;
            }
        },

        addToast(message, type = 'success') {
            const id = Date.now();
            const iconMap = {
                success: 'fa-solid fa-circle-check',
                error: 'fa-solid fa-circle-xmark',
                warning: 'fa-solid fa-triangle-exclamation',
                info: 'fa-solid fa-circle-info'
            };
            this.toasts.push({ id, message, type, icon: iconMap[type] || iconMap.info });
            setTimeout(() => {
                this.toasts = this.toasts.filter(t => t.id !== id);
            }, 4000);
        },

        handleGlobalSearch() {
            console.log("Global search query:", this.globalSearchQuery);
        }
    };
}