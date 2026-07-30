class HallStats {
    static getStats(db, hall) {
        const hallGroups = db.groups.filter(g => Number(g.hallId) === Number(hall.id));
        const groupCount = hallGroups.length;

        const groupNames = hallGroups.map(g => g.name);
        const studentCount = db.students.filter(s => groupNames.includes(s.group)).length;

        const capacity = Number(hall.capacity || 1);
        const occupancy = Math.min(100, Math.round((studentCount / capacity) * 100));

        return { groupCount, occupancy };
    }
}
window.HallStats = HallStats;