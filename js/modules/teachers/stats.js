class TeacherStats {
    static getStats(db, teacher) {
        const teacherGroups = db.groups.filter(g => Number(g.teacherId) === Number(teacher.id));
        const groupCount = teacherGroups.length;

        const groupNames = teacherGroups.map(g => g.name);
        const studentCount = db.students.filter(s => groupNames.includes(s.group)).length;

        return { groupCount, studentCount };
    }
}
window.TeacherStats = TeacherStats;