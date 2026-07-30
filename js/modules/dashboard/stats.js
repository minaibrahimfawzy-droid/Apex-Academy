/**
 * dashboard/stats.js - إحصائيات لوحة التحكم
 */

/**
 * إحصائيات الملخص العلوي (reactive getter)
 * @param {object} store
 * @returns {object}
 */
export function getDashboardStats(store) {
    const totalPaid     = store.payments.reduce((s, p) => s + Number(p.amount), 0);
    const totalRequired = store.students.reduce((s, st) => s + (Number(st.requiredAmount) || 0), 0);

    return {
        studentsCount:  store.students.length,
        teachersCount:  store.teachers.length,
        hallsCount:     store.halls.length,
        groupsCount:    store.groups.length,
        yearsCount:     store.years.length,
        attendanceCount:store.attendance.length,
        revenue:        totalPaid,
        arrears:        Math.max(0, totalRequired - totalPaid),
    };
}

/**
 * بيانات رسم حضور آخر 7 أيام
 * @param {Array} attendance
 * @returns {Array<{label:string, count:number, date:string}>}
 */
export function getLast7DaysAttendance(attendance) {
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toLocaleDateString('ar-EG');
        return {
            label: d.toLocaleDateString('ar-EG', { weekday: 'short' }),
            count: attendance.filter(a => a.date === dateStr).length,
            date:  dateStr,
        };
    });
}

/**
 * بيانات إشغال القاعات
 * @param {Array} halls
 * @param {Array} groups
 * @param {Array} students
 * @returns {Array<{name:string, capacity:number, count:number, pct:number}>}
 */
export function getHallOccupancy(halls, groups, students) {
    return halls.map(h => {
        const groupsInHall = groups.filter(g => g.hallId === h.id);
        const count = groupsInHall.reduce((s, g) =>
            s + students.filter(st => st.group === g.name && st.year === g.year).length, 0);
        const cap = Number(h.capacity) || 1;
        return {
            name:     h.name,
            capacity: h.capacity,
            count,
            pct: Math.min(100, Math.round((count / cap) * 100)),
        };
    });
}
