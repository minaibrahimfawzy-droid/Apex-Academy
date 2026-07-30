/**
 * store.js - Alpine Store المركزي لأكاديمية أبيكس v115
 */

// ===== Core =====
import { CURRENT_VERSION, QR_DETAILS }               from './core/constants.js';
import { showToast, createToastState }                from './core/toast.js';
import { loadAllData, syncStorage, saveLogs }          from './core/storage.js';
import { validatePassword, checkSession, login }       from './core/auth.js';
import { checkForUpdates as fetchUpdates, triggerUpdate as doUpdate } from './core/update.js';
import { generateQR, exportToCSV, printTable, generateId } from './core/helpers.js';
import { getInitialTab }                              from './core/router.js';

// ===== Dashboard =====
import { getDashboardStats, getLast7DaysAttendance, getHallOccupancy } from './modules/dashboard/stats.js';

// ===== Students =====
import { getStudentStats, saveStudent, deleteStudent } from './modules/students/crud.js';

// ===== Attendance =====
import { recordAttendanceByCode as doRecordAttendance } from './modules/attendance/attendance-service.js';

// ===== Finance =====
import { savePayment as doSavePayment } from './modules/finance/payments.js';

// ===== Groups =====
import { saveGroup, checkCanDeleteGroup, performDeleteGroup, getGroupStats } from './modules/groups/crud.js';

// ===== Teachers =====
import { saveTeacher, checkCanDeleteTeacher, performDeleteTeacher, getTeacherStats } from './modules/teachers/crud.js';

// ===== Halls =====
import { saveHall, checkCanDeleteHall, performDeleteHall, getHallStats } from './modules/halls/crud.js';

// ===== Years =====
import { saveYear, checkCanDeleteYear, performDeleteYear,
         archiveCurrentYear, restoreArchivedYear, deleteArchivedYear } from './modules/years/crud.js';

// ===== Backup =====
import { exportBackup, importBackup } from './modules/backup/backup.js';
import { getBackupStats }             from './core/storage.js';

// ===== Cards =====
import { uploadCardTemplate as doUploadTemplate } from './modules/cards/cards.js';

/** تهيئة Alpine Store الرئيسي */
export function initStore() {
    Alpine.store('apex', {

        // ─── الإصدار ──────────────────────────────────────────────
        currentVersion: CURRENT_VERSION,
        hasUpdate:      false,
        remoteVersion:  '',

        // ─── الأمان ───────────────────────────────────────────────
        isUnlocked:    false,
        passwordInput: '',
        passwordError: false,

        // ─── التبويبات ────────────────────────────────────────────
        currentTab: 'home',

        // ─── البيانات ─────────────────────────────────────────────
        years:         [],
        halls:         [],
        groups:        [],
        students:      [],
        attendance:    [],
        payments:      [],
        teachers:      [],
        archivedYears: [],
        logs:          [],
        cardTemplate:  '',

        // ─── البحث ────────────────────────────────────────────────
        globalQuery:             '',
        showGlobalSearchResults: false,

        // ─── النوافذ ──────────────────────────────────────────────
        activeStudentDetails: null,
        showArchiveModal:     false,
        archiveYearName:      '',
        editingStudent:       null,

        // ─── Toast ────────────────────────────────────────────────
        toast: createToastState(),

        /** عرض تنبيه */
        showToast(msg, type = 'success') {
            showToast(this, msg, type);
        },

        // ─── اللوغ ────────────────────────────────────────────────
        addLog(action, detail) {
            this.logs.unshift({ id: generateId(), time: new Date().toLocaleString('ar-EG'), action, detail });
            if (this.logs.length > 20) this.logs.pop();
            saveLogs(this.logs);
        },

        // ─── إقلاع ────────────────────────────────────────────────
        initApp() {
            const data         = loadAllData();
            this.years         = data.years;
            this.halls         = data.halls;
            this.groups        = data.groups;
            this.students      = data.students;
            this.attendance    = data.attendance;
            this.payments      = data.payments;
            this.teachers      = data.teachers;
            this.archivedYears = data.archivedYears;
            this.logs          = data.logs;
            this.cardTemplate  = data.cardTemplate;
            this.currentTab    = getInitialTab();
            this.checkLoginSession();
            this.checkForUpdates();
        },

        // ─── المصادقة ─────────────────────────────────────────────
        checkLoginSession() {
            this.isUnlocked = checkSession();
        },

        checkPassword() {
            if (validatePassword(this.passwordInput)) {
                login();
                this.isUnlocked    = true;
                this.passwordError = false;
                this.passwordInput = '';
                this.showToast('تم تسجيل الدخول بنجاح', 'success');
                this.addLog('تسجيل دخول', 'نجاح الدخول إلى لوحة التحكم');
            } else {
                this.passwordError = true;
                this.passwordInput = '';
                this.showToast('كلمة المرور غير صحيحة', 'error');
            }
        },

        // ─── التحديثات ───────────────────────────────────────────
        async checkForUpdates() {
            const r = await fetchUpdates();
            this.hasUpdate     = r.hasUpdate;
            this.remoteVersion = r.remoteVersion;
        },

        triggerUpdate() {
            doUpdate(this.remoteVersion);
            this.hasUpdate = false;
            this.showToast('جارٍ التحديث للإصدار ' + this.remoteVersion, 'success');
        },

        // ─── مزامنة ───────────────────────────────────────────────
        syncStorage() { syncStorage(this); },

        // ─── Dashboard Getters ────────────────────────────────────
        get dashboardStats()      { return getDashboardStats(this); },
        get last7DaysAttendance() { return getLast7DaysAttendance(this.attendance); },
        get hallOccupancy()       { return getHallOccupancy(this.halls, this.groups, this.students); },

        // ─── البحث العام ─────────────────────────────────────────
        get globalSearchResults() {
            const q = this.globalQuery.toLowerCase().trim();
            if (!q) return { students: [], teachers: [], groups: [], halls: [], years: [] };
            return {
                students: this.students.filter(s =>
                    (s.name  && s.name.toLowerCase().includes(q))  ||
                    (s.code  && s.code.toLowerCase().includes(q))  ||
                    (s.phone && s.phone.includes(q))
                ),
                teachers: this.teachers.filter(t =>
                    (t.name    && t.name.toLowerCase().includes(q))    ||
                    (t.subject && t.subject.toLowerCase().includes(q))
                ),
                groups: this.groups.filter(g => g.name && g.name.toLowerCase().includes(q)),
                halls:  this.halls.filter(h  => h.name && h.name.toLowerCase().includes(q)),
                years:  this.years.filter(y  => y.name && y.name.toLowerCase().includes(q)),
            };
        },

        // ─── QR ──────────────────────────────────────────────────
        generateQR(containerId, code, width = 80, height = 80) {
            generateQR(containerId, code, width, height);
        },
        generateDetailsQR(code) {
            generateQR('details-qrcode-box', code, QR_DETAILS.width, QR_DETAILS.height);
        },

        // ─── CSV & Print ─────────────────────────────────────────
        exportToCSV(data, filename, headers) {
            exportToCSV(data, filename, headers);
            this.showToast('تم تصدير ملف الإكسل بنجاح');
        },
        printTable(title, headers, rows) { printTable(title, headers, rows); },

        // ─── الطلاب ──────────────────────────────────────────────
        getStudentStats(studentId) {
            return getStudentStats(this.students.find(s => s.id === studentId), this.payments);
        },

        saveStudent(data, id) {
            const result = saveStudent(this, data, id);
            if (result.success) {
                this.editingStudent = null;
                if (id) {
                    this.addLog('تعديل طالب', data.name);
                    this.showToast('تم تعديل بيانات الطالب بنجاح.');
                } else {
                    this.addLog('تسجيل طالب', data.name);
                    this.showToast(`تم تسجيل الطالب بنجاح بالكود ${result.code}`);
                }
            }
        },

        deleteStudent(id) {
            if (!confirm('هل أنت متأكد من حذف الطالب وكافة سجلاته؟')) return;
            const name = deleteStudent(this, id);
            if (name) { this.addLog('حذف طالب', name); this.showToast('تم حذف ملف الطالب.'); }
        },

        // ─── الحضور ──────────────────────────────────────────────
        recordAttendanceByCode(code) {
            const result = doRecordAttendance(this, code);
            if (result.success) this.addLog('تسجيل حضور', result.student?.name || '');
            return result;
        },

        // ─── المدفوعات ───────────────────────────────────────────
        savePayment(paymentData) {
            const student = this.students.find(s => s.id === paymentData.studentId);
            if (!student) return;
            const ok = doSavePayment(this, paymentData);
            if (ok) {
                this.addLog('تحصيل اشتراك', `${paymentData.amount} ج.م من ${student.name}`);
                this.showToast('تم تسجيل الدفعة بنجاح.');
            }
        },

        // ─── المجموعات ───────────────────────────────────────────
        getGroupStats(g) {
            return getGroupStats(g, this.students, this.payments, this.attendance);
        },

        saveGroup(data, id) {
            const ok = saveGroup(this, data, id);
            if (ok) { this.addLog(id ? 'تعديل مجموعة' : 'إضافة مجموعة', data.name); this.showToast('تم الحفظ.'); }
        },

        deleteGroup(id) {
            const check = checkCanDeleteGroup(this, id);
            if (!check.canDelete) { this.showToast(check.reason, 'error'); return; }
            if (!confirm('هل أنت متأكد من حذف هذه المجموعة؟')) return;
            const name = performDeleteGroup(this, id);
            if (name) { this.addLog('حذف مجموعة', name); this.showToast('تم حذف المجموعة.'); }
        },

        // ─── المعلمين ────────────────────────────────────────────
        getTeacherStats(t) {
            return getTeacherStats(t, this.groups, this.students, this.attendance);
        },

        saveTeacher(data, id) {
            const ok = saveTeacher(this, data, id);
            if (ok) { this.addLog(id ? 'تعديل معلم' : 'إضافة معلم', data.name); this.showToast('تم الحفظ.'); }
        },

        deleteTeacher(id) {
            const check = checkCanDeleteTeacher(this, id);
            if (!check.canDelete) { this.showToast(check.reason, 'error'); return; }
            if (!confirm('هل أنت متأكد من حذف هذا المعلم؟')) return;
            const name = performDeleteTeacher(this, id);
            if (name) { this.addLog('حذف معلم', name); this.showToast('تم حذف المعلم بنجاح.'); }
        },

        // ─── القاعات ─────────────────────────────────────────────
        getHallStats(h) {
            return getHallStats(h, this.groups, this.students);
        },

        saveHall(data, id) {
            const ok = saveHall(this, data, id);
            if (ok) { this.addLog(id ? 'تعديل قاعة' : 'إضافة قاعة', data.name); this.showToast('تم الحفظ.'); }
        },

        deleteHall(id) {
            const check = checkCanDeleteHall(this, id);
            if (!check.canDelete) { this.showToast(check.reason, 'error'); return; }
            if (!confirm('هل أنت متأكد من حذف هذه القاعة؟')) return;
            const name = performDeleteHall(this, id);
            if (name) { this.addLog('حذف قاعة', name); this.showToast('تم حذف القاعة بنجاح.'); }
        },

        // ─── السنوات ─────────────────────────────────────────────
        saveYear(data, id) {
            const ok = saveYear(this, data, id);
            if (ok) { this.addLog(id ? 'تعديل سنة' : 'إضافة سنة', data.name); this.showToast('تم الحفظ.'); }
        },

        deleteYear(id) {
            const check = checkCanDeleteYear(this, id);
            if (!check.canDelete) { this.showToast(check.reason, 'error'); return; }
            if (!confirm('هل أنت متأكد من حذف هذه السنة؟')) return;
            const name = performDeleteYear(this, id);
            if (name) { this.addLog('حذف سنة', name); this.showToast('تم حذف السنة.'); }
        },

        confirmArchiveYear() {
            if (!this.archiveYearName.trim()) {
                this.showToast('يرجى كتابة اسم الأرشيف أولاً', 'warning');
                return;
            }
            const ok = archiveCurrentYear(this, this.archiveYearName);
            if (ok) {
                this.showArchiveModal = false;
                this.archiveYearName  = '';
                this.addLog('ترحيل أرشفة', 'تم ترحيل السنة بنجاح');
                this.showToast('تم ترحيل البيانات وبدء عام جديد بنجاح!');
            }
        },

        restoreArchivedYear(archived) {
            if (!confirm(`هل أنت متأكد من استعراض بيانات الأرشيف (${archived.name})؟`)) return;
            restoreArchivedYear(this, archived);
            this.showToast('تمت استعادة بيانات الأرشيف المختار بنجاح.');
        },

        deleteArchivedYear(id) {
            if (!confirm('هل أنت متأكد من حذف هذا الأرشيف نهائياً؟')) return;
            deleteArchivedYear(this, id);
            this.showToast('تم حذف الأرشيف.');
        },

        // ─── الكارنيهات ──────────────────────────────────────────
        uploadCardTemplate(event) {
            const file = event.target.files[0];
            if (!file) return;
            doUploadTemplate(this, file).then(ok => {
                if (ok) this.showToast('تم تثبيت قالب الكارنيه!');
            });
        },

        // ─── النسخ الاحتياطي ─────────────────────────────────────
        exportData() {
            exportBackup(this);
            this.addLog('نسخ احتياطي', 'تصدير قاعدة البيانات بالكامل');
        },

        importData(event) {
            const file = event.target.files[0];
            if (!file) return;
            importBackup(this, file).then(result => {
                if (result.success) {
                    this.addLog('استيراد نسخة', 'تم استيراد قاعدة البيانات بنجاح');
                    this.showToast('تمت استعادة البيانات بنجاح!');
                    setTimeout(() => window.location.reload(), 1000);
                } else {
                    this.showToast(result.error || 'الملف غير صالح.', 'error');
                }
            });
        },

        getBackupInfo() {
            return getBackupStats(this);
        },

    }); // end Alpine.store
}
