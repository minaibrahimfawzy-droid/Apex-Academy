function subscriptionsModule() {
    return {
        subscriptions: [],
        students: [],
        showModal: false,
        formData: {
            studentId: '',
            month: '',
            amount: ''
        },

        initSubscriptions() {
            this.students = ApexStorage.get(ApexConfig.storageKeys.students, []);
            this.loadSubscriptions();
        },

        loadSubscriptions() {
            this.subscriptions = ApexStorage.get(ApexConfig.storageKeys.subscriptions, []);
        },

        getStudentName(studentId) {
            const st = this.students.find(s => s.id === studentId);
            return st ? st.name : 'طالب غير معروف';
        },

        openAddModal() {
            this.formData = { studentId: '', month: '', amount: '' };
            this.showModal = true;
        },

        saveSubscription() {
            const amountVal = parseFloat(this.formData.amount) || 0;
            const newSub = {
                id: ApexHelpers.generateId('sub'),
                studentId: this.formData.studentId,
                month: this.formData.month,
                amount: amountVal,
                paymentDate: new Date().toISOString().split('T')[0],
                status: 'active'
            };

            this.subscriptions.push(newSub);
            ApexStorage.set(ApexConfig.storageKeys.subscriptions, this.subscriptions);

            // تسجيل الإيراد تلقائياً في سجل المالية
            let finance = ApexStorage.get(ApexConfig.storageKeys.finance, []);
            finance.push({
                id: ApexHelpers.generateId('fin'),
                type: 'income',
                title: 'اشتراك - ' + this.getStudentName(this.formData.studentId) + ' (' + this.formData.month + ')',
                amount: amountVal,
                date: newSub.paymentDate,
                category: 'اشتراكات'
            });
            ApexStorage.set(ApexConfig.storageKeys.finance, finance);

            ApexUI.showToast('تم تحصيل الاشتراك وتسجيله في الخزينة بنجاح', 'success');
            this.showModal = false;
        },

        formatCurrency(amount) {
            return ApexHelpers.formatCurrency(amount);
        }
    };
}