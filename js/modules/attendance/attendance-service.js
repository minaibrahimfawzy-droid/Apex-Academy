class AttendanceService {
    static record(db, code) {
        const student = db.students.find(s => String(s.code).trim() === String(code).trim());
        if (!student) {
            return { success: false, message: "كود الطالب غير مسجل بالنظام ❌" };
        }

        const today = window.Helpers.getLocalDate();
        const alreadyPresent = db.attendance.some(a => a.studentId === student.id && a.date === today);

        if (alreadyPresent) {
            const firstAtt = db.attendance.find(a => a.studentId === student.id && a.date === today);
            return {
                success: false,
                message: `الطالب مسجل حضور بالفعل اليوم! ⚠️ (وقت الحضور: ${firstAtt.time})`,
                student,
                remaining: window.StudentStats.getStats(db, student.id).remaining
            };
        }

        const newRecord = {
            id: window.Helpers.generateID(),
            studentId: student.id,
            name: student.name,
            group: student.group,
            date: today,
            time: window.Helpers.getLocalTime()
        };
        db.attendance.push(newRecord);

        const stats = window.StudentStats.getStats(db, student.id);
        return {
            success: true,
            message: `تم إثبات حضور الطالب بنجاح ✅ (وقت الحضور: ${newRecord.time})`,
            student,
            remaining: stats.remaining,
            time: newRecord.time
        };
    }
}
window.AttendanceService = AttendanceService;