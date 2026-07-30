class StudentCRUD {
    static save(db, formData, editId = null) {
        if (editId) {
            const idx = db.students.findIndex(s => s.id === editId);
            if (idx !== -1) {
                db.students[idx] = {
                    ...db.students[idx],
                    ...formData,
                    requiredAmount: Number(db.students[idx].requiredAmount)
                };
                return db.students[idx];
            }
        } else {
            const matchedGroup = db.groups.find(g => g.name === formData.group);
            const cost = matchedGroup ? Number(matchedGroup.price || 0) : 0;
            const newStudent = {
                id: window.Helpers.generateID(),
                code: window.Helpers.generateStudentCode(formData.year),
                regDate: window.Helpers.getLocalDate(),
                requiredAmount: cost,
                ...formData
            };
            db.students.push(newStudent);
            return newStudent;
        }
        return null;
    }

    static delete(db, id) {
        db.students = db.students.filter(s => s.id !== id);
        db.payments = db.payments.filter(p => p.studentId !== id);
        db.attendance = db.attendance.filter(a => a.studentId !== id);
    }
}
window.StudentCRUD = StudentCRUD;