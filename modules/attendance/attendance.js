function attendanceModule() {
    return {
        students: [],
        attendanceRecords: [],
        selectedDate: new Date().toISOString().split('T')[0],
        searchQuery: '',

        initAttendance() {
            this.students = ApexStorage.get(ApexConfig.storageKeys.students, []);
            this.loadAttendance();
        },

        loadAttendance() {
            const allAttendance = ApexStorage.get(ApexConfig.storageKeys.attendance, []);
            this.attendanceRecords = allAttendance.filter(r => r.date === this.selectedDate);
        },

        get filteredStudents() {
            if (!this.searchQuery) return this.students;
            const q = this.searchQuery.toLowerCase();
            return this.students.filter(s => 
                s.name.toLowerCase().includes(q) || 
                (s.code && s.code.toLowerCase().includes(q))
            );
        },

        getStatus(studentId) {
            const rec = this.attendanceRecords.find(r => r.studentId === studentId);
            return rec ? rec.status : null;
        },

        markStatus(studentId, status) {
            let allAttendance = ApexStorage.get(ApexConfig.storageKeys.attendance, []);
            
            const index = allAttendance.findIndex(r => r.studentId === studentId && r.date === this.selectedDate);
            
            if (index !== -1) {
                allAttendance[index].status = status;
            } else {
                allAttendance.push({
                    id: ApexHelpers.generateId('att'),
                    studentId: studentId,
                    date: this.selectedDate,
                    status: status
                });
            }

            ApexStorage.set(ApexConfig.storageKeys.attendance, allAttendance);
            this.loadAttendance();
            ApexUI.showToast('تم تسجيل حالة الحضور', 'success');
        }
    };
}