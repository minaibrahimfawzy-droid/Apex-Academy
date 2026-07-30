class YearCRUD {
    static save(db, data, editId = null) {
        if (editId) {
            const idx = db.years.findIndex(y => y.id === editId);
            if (idx !== -1) {
                db.years[idx] = { ...db.years[idx], ...data };
                return db.years[idx];
            }
        } else {
            const newYear = {
                id: window.Helpers.generateID(),
                ...data
            };
            db.years.push(newYear);
            return newYear;
        }
        return null;
    }

    static delete(db, id, toast) {
        const year = db.years.find(y => y.id === id);
        if (year) {
            const hasStudents = db.students.some(s => s.year === year.name);
            const hasGroups = db.groups.some(g => g.year === year.name);
            if (hasStudents || hasGroups) {
                toast.trigger("error", "لا يمكن حذف المرحلة! توجد طلاب أو مجموعات دراسية مرتبطة بها.");
                return false;
            }
        }
        db.years = db.years.filter(y => y.id !== id);
        return true;
    }
}
window.YearCRUD = YearCRUD;