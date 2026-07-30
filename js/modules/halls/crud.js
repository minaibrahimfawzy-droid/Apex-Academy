class HallCRUD {
    static save(db, data, editId = null) {
        if (editId) {
            const idx = db.halls.findIndex(h => h.id === editId);
            if (idx !== -1) {
                db.halls[idx] = { ...db.halls[idx], ...data };
                return db.halls[idx];
            }
        } else {
            const newHall = {
                id: window.Helpers.generateID(),
                ...data
            };
            db.halls.push(newHall);
            return newHall;
        }
        return null;
    }

    static delete(db, id, toast) {
        const hasGroups = db.groups.some(g => Number(g.hallId) === Number(id));
        if (hasGroups) {
            toast.trigger("error", "لا يمكن حذف القاعة! توجد مجموعات دراسية تستخدم هذه القاعة حالياً.");
            return false;
        }
        db.halls = db.halls.filter(h => h.id !== id);
        return true;
    }
}
window.HallCRUD = HallCRUD;