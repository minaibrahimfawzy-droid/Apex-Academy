function financeModule() {
    return {
        financeRecords: [],
        showModal: false,
        formData: {
            type: 'expense',
            title: '',
            amount: ''
        },

        initFinance() {
            this.loadFinance();
        },

        loadFinance() {
            this.financeRecords = ApexStorage.get(ApexConfig.storageKeys.finance, []);
        },

        get totalIncome() {
            return this.financeRecords
                .filter(r => r.type === 'income')
                .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
        },

        get totalExpense() {
            return this.financeRecords
                .filter(r => r.type === 'expense')
                .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
        },

        get netProfit() {
            return this.totalIncome - this.totalExpense;
        },

        openAddModal() {
            this.formData = { type: 'expense', title: '', amount: '' };
            this.showModal = true;
        },

        saveTransaction() {
            const newTransaction = {
                id: ApexHelpers.generateId('fin'),
                type: this.formData.type,
                title: this.formData.title,
                amount: parseFloat(this.formData.amount) || 0,
                date: new Date().toISOString().split('T')[0],
                category: this.formData.type === 'income' ? 'إيرادات عامة' : 'مصروفات عامة'
            };

            this.financeRecords.push(newTransaction);
            ApexStorage.set(ApexConfig.storageKeys.finance, this.financeRecords);
            ApexUI.showToast('تم تسجيل المعاملة بنجاح', 'success');
            this.showModal = false;
        },

        formatCurrency(amount) {
            return ApexHelpers.formatCurrency(amount);
        }
    };
}