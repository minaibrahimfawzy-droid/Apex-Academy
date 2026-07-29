function registerStudentModule() {
    return {
        years: [],
        groups: [],
        filteredGroups: [],
        formData: { name: '', year: '', group: '', phone: '', parentPhone: '' },
        initData() {
            this.years = JSON.parse(localStorage.getItem('apex_years')) || [];
            this.groups = JSON.parse(localStorage.getItem('apex_groups')) || [];
        },
        filterGroups() {
            this.filteredGroups = this.groups.filter(g => g.year === this.formData.year);
            this.formData.group = '';
        },
        saveStudent() {
            if (!this.formData.name || !this.formData.year || !this.formData.group) return;
            let students = JSON.parse(localStorage.getItem('apex_students')) || [];
            const newStudent = {
                id: Date.now(),
                code: 'ST-' + Math.floor(1000 + Math.random() * 9000),
                ...this.formData
            };
            students.push(newStudent);
            localStorage.setItem('apex_students', JSON.stringify(students));
            alert('تم تسجيل الطالب بنجاح! كود الطالب: ' + newStudent.code);
            this.formData = { name: '', year: '', group: '', phone: '', parentPhone: '' };
        }
    }
}

function studentsModule() {
    return {
        students: [],
        years: [],
        searchQuery: '',
        selectedYear: '',
        initStudents() {
            this.students = JSON.parse(localStorage.getItem('apex_students')) || [];
            this.years = JSON.parse(localStorage.getItem('apex_years')) || [];
        },
        get filteredStudents() {
            return this.students.filter(s => {
                const matchSearch = s.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
                                    s.code.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
                                    (s.phone && s.phone.includes(this.searchQuery));
                const matchYear = this.selectedYear === '' || s.year === this.selectedYear;
                return matchSearch && matchYear;
            });
        },
        deleteStudent(id) {
            if (confirm('هل أنت متأكد من حذف الطالب؟')) {
                this.students = this.students.filter(s => s.id !== id);
                localStorage.setItem('apex_students', JSON.stringify(this.students));
            }
        }
    }
}