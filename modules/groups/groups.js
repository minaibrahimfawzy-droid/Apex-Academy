function groupsModule() {
    return {
        groups: [],
        availableYears: [],
        availableHalls: [],
        formData: { name: '', year: '', hall: '', schedule: '', price: '' },
        initGroups() {
            this.groups = JSON.parse(localStorage.getItem('apex_groups')) || [];
            this.availableYears = JSON.parse(localStorage.getItem('apex_years')) || [];
            this.availableHalls = JSON.parse(localStorage.getItem('apex_halls')) || [];
        },
        saveGroup() {
            if (!this.formData.name.trim() || !this.formData.year) return;
            const newGroup = { id: Date.now(), ...this.formData };
            this.groups.push(newGroup);
            localStorage.setItem('apex_groups', JSON.stringify(this.groups));
            this.formData = { name: '', year: '', hall: '', schedule: '', price: '' };
        },
        deleteGroup(id) {
            if (confirm('هل أنت متأكد من الحذف؟')) {
                this.groups = this.groups.filter(g => g.id !== id);
                localStorage.setItem('apex_groups', JSON.stringify(this.groups));
            }
        }
    }
}