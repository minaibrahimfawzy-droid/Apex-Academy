function attendanceModule() {
    return {
        studentCode: '',
        recordAttendance() {
            if (!this.studentCode.trim()) return;
            let students = JSON.parse(localStorage.getItem('apex_students')) || [];
            let student = students.find(s => s.code === this.studentCode || s.name.includes(this.studentCode));
            if (student) {
                alert('تم تسجيل حضور الطالب: ' + student.name);
            } else {
                alert('الطالب غير موجود!');
            }
            this.studentCode = '';
        }
    }
}