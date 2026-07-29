window.ApexHelpers = {
    generateId(prefix = 'id') {
        return prefix + '_' + Math.random().toString(36).substr(2, 9);
    },

    formatDate(dateString) {
        if (!dateString) return '';
        const d = new Date(dateString);
        return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
    },

    formatCurrency(amount, currency = 'ج.م') {
        return (parseFloat(amount) || 0).toLocaleString('ar-EG') + ' ' + currency;
    }
};