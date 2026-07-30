class TeacherCRUD {
    static save(db, data, editId = null) {
        if (editId) {
            const idx = db.teachers.findIndex(t => t.id === editId);
            if (idx !== -1) {
                db.teachers[idx] = { ...db.teachers[idx], ...data };
                return db.teachers[idx];
            }
        } else {
            const newTeacher = {
                id: window.Helpers.generateID(),
                ratio: Number(data.ratio || 0),
                ...data
            };
            db.teachers.push(newTeacher);
            return newTeacher;
        }
        return null;
    }

    static delete(db, id, toast) {
        const hasGroups = db.groups.some(g => Number(g.teacherId) === Number(id));
        if (hasGroups) {
            toast.trigger("error", "لا يمكن حذف المعلم! توجد مجموعات دراسية نشطة تابعة له.");
            return false;
        }
        db.teachers = db.teachers.filter(t => t.id !== id);
        return true;
    }
}
window.TeacherCRUD = TeacherCRUD;