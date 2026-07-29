function teachersModule() {
    return {
        teachers: [],
        showModal: false,
        formData: {
            name: '',
            subject: '',
            phone: '',
            ratio: 80
        },

        initTeachers() {
            this.loadTeachers();
        },

        loadTeachers() {
            this.teachers = ApexStorage.get(ApexConfig.storageKeys.teachers, []);
        },

        openAddModal() {
            this.formData = { name: '', subject: '', phone: '', ratio: 80 };
            this.showModal = true;
        },

        saveTeacher() {
            const newTeacher = {
                id: ApexHelpers.generateId('teacher'),
                ...this.formData
            };
            this.teachers.push(newTeacher);
            ApexStorage.set(ApexConfig.storageKeys.teachers, this.teachers);
            ApexUI.showToast('تم إضافة المعلم بنجاح', 'success');
            this.showModal = false;
        },

        deleteTeacher(id) {
            if (confirm('هل أنت تأكد من حذف هذا المعلم؟')) {
                this.teachers = this.teachers.filter(t => t.id !== id);
                ApexStorage.set(ApexConfig.storageKeys.teachers, this.teachers);
                ApexUI.showToast('تم حذف المعلم بنجاح', 'info');
            }
        }
    };
}