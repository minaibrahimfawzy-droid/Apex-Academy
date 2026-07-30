class GroupStats {
    static getStats(db, group) {
        const groupStudents = db.students.filter(s => s.group === group.name);
        const studentCount = groupStudents.length;

        const studentIds = groupStudents.map(s => s.id);
        const payments = db.payments.filter(p => studentIds.includes(p.studentId));
        const revenue = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

        const attendanceCount = db.attendance.filter(a => studentIds.includes(a.studentId)).length;
        const distinctDates = [...new Set(db.attendance.filter(a => studentIds.includes(a.studentId)).map(a => a.date))].length || 1;
        const potentialAttendance = studentCount * distinctDates;
        const avgAttendance = potentialAttendance > 0 ? Math.round((attendanceCount / potentialAttendance) * 100) : 0;

        return { studentCount, revenue, avgAttendance };
    }
}
window.GroupStats = GroupStats;