function studentsModule() {
    return {
        students: [],
        searchQuery: '',
        showModal: false,
        isEdit: false,
        formData: {
            id: null,
            code: '',
            name: '',
            grade: '',
            phone: '',
            parentPhone: ''
        },

        initStudents() {
            this.loadStudents();
        },

        loadStudents() {
            this.students = ApexStorage.get(ApexConfig.storageKeys.students, []);
        },

        get filteredStudents() {
            if (!this.searchQuery) return this.students;
            const q = this.searchQuery.toLowerCase();
            return this.students.filter(s => 
                s.name.toLowerCase().includes(q) || 
                (s.code && s.code.toLowerCase().includes(q)) ||
                (s.phone && s.phone.includes(q))
            );
        },

        openAddModal() {
            this.isEdit = false;
            this.formData = {
                id: null,
                code: 'STU-' + Math.floor(1000 + Math.random() * 9000),
                name: '',
                grade: '',
                phone: '',
                parentPhone: ''
            };
            this.showModal = true;
        },

        editStudent(student) {
            this.isEdit = true;
            this.formData = { ...student };
            this.showModal = true;
        },

        saveStudent() {
            if (this.isEdit) {
                const index = this.students.findIndex(s => s.id === this.formData.id);
                if (index !== -1) {
                    this.students[index] = { ...this.formData };
                }
            } else {
                this.formData.id = ApexHelpers.generateId('student');
                this.formData.createdAt = new Date().toISOString().split('T')[0];
                this.students.push({ ...this.formData });
            }

            ApexStorage.set(ApexConfig.storageKeys.students, this.students);
            ApexUI.showToast(this.isEdit ? 'تم تعديل بيانات الطالب بنجاح' : 'تم إضافة الطالب بنجاح', 'success');
            this.showModal = false;
        },

        deleteStudent(id) {
            if (confirm('هل أنت تأكد من رغبتك في حذف هذا الطالب؟')) {
                this.students = this.students.filter(s => s.id !== id);
                ApexStorage.set(ApexConfig.storageKeys.students, this.students);
                ApexUI.showToast('تم حذف الطالب بنجاح', 'info');
            }
        }
    };
}