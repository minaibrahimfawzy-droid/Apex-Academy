/**
 * attendance/attendance-service.js - منطق تسجيل الحضور
 */
import { todayAr, nowTimeAr, generateId } from '../../core/helpers.js';
import { getStudentStats } from '../students/crud.js';
import { syncStorage } from '../../core/storage.js';

/**
 * تسجيل حضور طالب عبر الكود أو الاسم
 * @param {object} store - Alpine store
 * @param {string} code - كود الطالب أو اسمه
 * @returns {object} نتيجة العملية
 */
export function recordAttendanceByCode(store, code) {
    const cleanCode = (code || '').trim();
    if (!cleanCode) return { success: false, message: 'الرجاء إدخال كود الطالب!' };

    const student = store.students.find(
        s => s.code === cleanCode || (s.name && s.name.trim() === cleanCode)
    );
    if (!student) return { success: false, message: 'الطالب غير مسجل بأكاديمية أبيكس!' };

    const todayStr       = todayAr();
    const existingRecord = store.attendance.find(
        a => a.studentId === student.id && a.date === todayStr
    );

    if (existingRecord) {
        return {
            success:          false,
            alreadyRegistered:true,
            message:          'تم تسجيل حضوره بالفعل اليوم!',
            student,
            time:             existingRecord.time,
        };
    }

    const stats  = getStudentStats(student, store.payments);
    const record = {
        id:        generateId(),
        studentId: student.id,
        code:      student.code,
        name:      student.name,
        group:     student.group,
        date:      todayStr,
        time:      nowTimeAr(),
    };

    store.attendance.unshift(record);
    syncStorage(store);

    return {
        success:    true,
        student,
        totalPaid:  stats.paid,
        remaining:  stats.remaining,
        time:       record.time,
    };
}
