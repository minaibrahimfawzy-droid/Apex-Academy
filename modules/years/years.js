function yearsModule() {
    return {
        years: [],
        formData: { name: '', notes: '' },
        initYears() {
            this.years = JSON.parse(localStorage.getItem('apex_years')) || [];
        },
        saveYear() {
            if (!this.formData.name.trim()) return;
            const newYear = { id: Date.now(), ...this.formData };
            this.years.push(newYear);
            localStorage.setItem('apex_years', JSON.stringify(this.years));
            this.formData = { name: '', notes: '' };
        },
        deleteYear(id) {
            if (confirm('هل أنت متأكد من الحذف؟')) {
                this.years = this.years.filter(y => y.id !== id);
                localStorage.setItem('apex_years', JSON.stringify(this.years));
            }
        }
    }
}