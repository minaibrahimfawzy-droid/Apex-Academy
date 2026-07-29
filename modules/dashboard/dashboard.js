function dashboardModule() {
    return {
        stats: {
            totalStudents: 0,
            totalTeachers: 0,
            activeSubscriptions: 0,
            totalRevenue: 0
        },
        recentStudents: [],

        initDashboard() {
            this.loadStats();
        },

        loadStats() {
            const students = ApexStorage.get(ApexConfig.storageKeys.students, []);
            const teachers = ApexStorage.get(ApexConfig.storageKeys.teachers, []);
            const subscriptions = ApexStorage.get(ApexConfig.storageKeys.subscriptions, []);
            const finance = ApexStorage.get(ApexConfig.storageKeys.finance, []);

            this.stats.totalStudents = students.length;
            this.stats.totalTeachers = teachers.length;
            this.stats.activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
            
            this.stats.totalRevenue = finance.reduce((acc, curr) => {
                return curr.type === 'income' ? acc + parseFloat(curr.amount || 0) : acc;
            }, 0);

            // جلب أحدث 5 طلاب
            this.recentStudents = [...students].reverse().slice(0, 5);
        },

        formatCurrency(amount) {
            return ApexHelpers.formatCurrency(amount);
        }
    };
}