function hallsModule() {
    return {
        halls: [],
        formData: { name: '', capacity: '' },
        initHalls() {
            this.halls = JSON.parse(localStorage.getItem('apex_halls')) || [];
        },
        saveHall() {
            if (!this.formData.name.trim()) return;
            const newHall = { id: Date.now(), ...this.formData };
            this.halls.push(newHall);
            localStorage.setItem('apex_halls', JSON.stringify(this.halls));
            this.formData = { name: '', capacity: '' };
        },
        deleteHall(id) {
            if (confirm('هل أنت متأكد من الحذف؟')) {
                this.halls = this.halls.filter(h => h.id !== id);
                localStorage.setItem('apex_halls', JSON.stringify(this.halls));
            }
        }
    }
}