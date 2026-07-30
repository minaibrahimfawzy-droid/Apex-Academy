class ArchiveHandler {
    static archive(db, archiveName) {
        const archiveRecord = {
            id: window.Helpers.generateID(),
            name: archiveName || `العام الدراسي ${window.Helpers.getLocalDate()}`,
            date: window.Helpers.getLocalDate(),
            students: [...db.students],
            payments: [...db.payments],
            attendance: [...db.attendance]
        };

        db.archivedYears.push(archiveRecord);

        db.students = [];
        db.payments = [];
        db.attendance = [];
        db.logs.push({
            action: "أرشفة سنوية",
            detail: `تم ترحيل السنة الحالية باسم: ${archiveRecord.name}`,
            time: window.Helpers.getLocalTime()
        });
    }
}
window.ArchiveHandler = ArchiveHandler;