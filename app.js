/* ==========================================================================
   1. الثوابت وإعدادات النظام الافتراضية (Constants & Default DB)
   ========================================================================== */
const APP_VERSION = "115";

const STORAGE_KEYS = {
    DB: "apex_academy_db",
    SESSION: "apex_academy_session"
};

const DEFAULT_DB = {
    students: [],
    teachers: [],
    attendance: [],
    payments: [],
    groups: [],
    years: [],
    halls: [],
    settings: {
        centerName: "أكاديمية أبيكس التعليمية",
        adminName: "مدير النظام",
        password: "123"
    },
    archivedYears: [],
    logs: [],
    cardTemplate: null
};

/* ==========================================================================
   2. الدوال المساعدة العامة (Helpers)
   ========================================================================== */
class Helpers {
    static formatCurrency(val) {
        return Number(val || 0).toLocaleString('ar-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).replace('EGP', 'ج.م');
    }

    static getLocalDate() {
        const date = new Date();
        return date.toLocaleDateString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit' });
    }

    static getLocalTime() {
        const date = new Date();
        return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    static generateID() {
        return Date.now() + Math.floor(Math.random() * 1000);
    }

    static generateStudentCode(yearName) {
        const cleanYear = String(yearName || "STUD").replace(/\s+/g, '').substring(0, 4).toUpperCase();
        const rand = Math.floor(1000 + Math.random() * 9000);
        return `${cleanYear}-${rand}`;
    }

    static exportCSV(data, filename, headers) {
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
        csvContent += headers.join(",") + "\n";
        data.forEach(row => {
            csvContent += row.map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(",") + "\n";
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${filename}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    static printTable(title, headers, rows) {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        const headerCells = headers.map(h => `<th style="padding:12px; border:1px solid #cbd5e1; background-color:#f1f5f9; font-weight:700;">${h}</th>`).join('');
        const rowCells = rows.map(r => `
            <tr style="border-bottom: 1px solid #e2e8f0;">
                ${r.map(cell => `<td style="padding:10px; border:1px solid #cbd5e1; text-align:right;">${cell}</td>`).join('')}
            </tr>
        `).join('');

        printWindow.document.write(`
            <html dir="rtl" lang="ar">
            <head>
                <title>${title}</title>
                <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet">
                <style>
                    body { font-family: 'Cairo', sans-serif; padding: 20px; color: #1e293b; background: #fff; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
                    h2 { text-align: center; font-size: 18px; margin-bottom: 10px; }
                </style>
            </head>
            <body onload="window.print(); window.close();">
                <h2>${title}</h2>
                <p style="text-align:center; font-size:11px; color:#64748b;">تاريخ التوليد: ${Helpers.getLocalDate()} ${Helpers.getLocalTime()}</p>
                <table>
                    <thead><tr>${headerCells}</tr></thead>
                    <tbody>${rowCells}</tbody>
                </table>
            </body>
            </html>
        `);
        printWindow.document.close();
    }
}

/* ==========================================================================
   3. نظام الإشعارات الفوري (Toast Manager)
   ========================================================================== */
class ToastManager {
    constructor() {
        this.show = false;
        this.type = 'success';
        this.message = '';
        this.timeout = null;
    }

    trigger(type, message) {
        this.show = true;
        this.type = type;
        this.message = message;
        if (this.timeout) clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            this.show = false;
        }, 3500);
    }
}

/* ==========================================================================
   4. إدارة التخزين والتحقق الأمني (Storage & Auth Handlers)
   ========================================================================== */
class StorageHandler {
    static load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.DB);
            if (!raw) {
                localStorage.setItem(STORAGE_KEYS.DB, JSON.stringify(DEFAULT_DB));
                return JSON.parse(JSON.stringify(DEFAULT_DB));
            }
            const parsed = JSON.parse(raw);
            return { ...DEFAULT_DB, ...parsed };
        } catch (e) {
            console.error("خطأ في قراءة التخزين المحلي:", e);
            return JSON.parse(JSON.stringify(DEFAULT_DB));
        }
    }

    static save(dbState) {
        try {
            localStorage.setItem(STORAGE_KEYS.DB, JSON.stringify(dbState));
        } catch (e) {
            console.error("خطأ في حفظ البيانات محلياً:", e);
        }
    }

    static calculateStats() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.DB) || "";
            const bytes = raw.length * 2; 
            if (bytes === 0) return "0 B";
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        } catch (e) {
            return "غير معروف";
        }
    }
}

class AuthHandler {
    static isUnlocked() {
        return localStorage.getItem(STORAGE_KEYS.SESSION) === 'true';
    }

    static verify(input, correctPassword) {
        if (String(input).trim() === String(correctPassword).trim()) {
            localStorage.setItem(STORAGE_KEYS.SESSION, 'true');
            return true;
        }
        return false;
    }

    static lock() {
        localStorage.removeItem(STORAGE_KEYS.SESSION);
    }
}

class UpdateHandler {
    static async check() {
        try {
            const response = await fetch('version.json?nocache=' + Date.now());
            if (response.ok) {
                const data = await response.json();
                return {
                    hasUpdate: String(data.version) !== APP_VERSION,
                    remoteVersion: String(data.version)
                };
            }
        } catch (err) {
            console.warn("تنبيه: تعذر جلب معلومات التحديث:", err);
        }
        return { hasUpdate: false, remoteVersion: APP_VERSION };
    }
}

/* ==========================================================================
   5. موديولات معالجة البيانات الفردية (Modules Core Engines)
   ========================================================================== */

// موديول الطلاب
class StudentCRUD {
    static save(db, formData, editId = null) {
        if (editId) {
            const idx = db.students.findIndex(s => s.id === editId);
            if (idx !== -1) {
                db.students[idx] = {
                    ...db.students[idx],
                    ...formData,
                    requiredAmount: Number(db.students[idx].requiredAmount)
                };
                return db.students[idx];
            }
        } else {
            const matchedGroup = db.groups.find(g => g.name === formData.group);
            const cost = matchedGroup ? Number(matchedGroup.price || 0) : 0;
            const newStudent = {
                id: Helpers.generateID(),
                code: Helpers.generateStudentCode(formData.year),
                regDate: Helpers.getLocalDate(),
                requiredAmount: cost,
                ...formData
            };
            db.students.push(newStudent);
            return newStudent;
        }
        return null;
    }

    static delete(db, id) {
        db.students = db.students.filter(s => s.id !== id);
        db.payments = db.payments.filter(p => p.studentId !== id);
        db.attendance = db.attendance.filter(a => a.studentId !== id);
    }
}

class StudentStats {
    static getStats(db, studentId) {
        const student = db.students.find(s => s.id === studentId);
        if (!student) return { paid: 0, remaining: 0, ratio: 0, isLate: false };

        const payments = db.payments.filter(p => p.studentId === studentId);
        const paid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
        const req = Number(student.requiredAmount || 0);
        const remaining = Math.max(0, req - paid);
        const ratio = req > 0 ? Math.min(100, Math.round((paid / req) * 100)) : 100;
        const isLate = remaining > 0;

        return { paid, remaining, ratio, isLate };
    }
}

// موديول تسجيل الحضور
class AttendanceService {
    static record(db, code) {
        const student = db.students.find(s => String(s.code).trim() === String(code).trim());
        if (!student) {
            return { success: false, message: "كود الطالب غير مسجل بالنظام ❌" };
        }

        const today = Helpers.getLocalDate();
        const alreadyPresent = db.attendance.some(a => a.studentId === student.id && a.date === today);

        if (alreadyPresent) {
            const firstAtt = db.attendance.find(a => a.studentId === student.id && a.date === today);
            return {
                success: false,
                message: `الطالب مسجل حضور بالفعل اليوم! ⚠️ (وقت الحضور: ${firstAtt.time})`,
                student,
                remaining: StudentStats.getStats(db, student.id).remaining
            };
        }

        const newRecord = {
            id: Helpers.generateID(),
            studentId: student.id,
            name: student.name,
            group: student.group,
            date: today,
            time: Helpers.getLocalTime()
        };
        db.attendance.push(newRecord);

        const stats = StudentStats.getStats(db, student.id);
        return {
            success: true,
            message: `تم إثبات حضور الطالب بنجاح ✅ (وقت الحضور: ${newRecord.time})`,
            student,
            remaining: stats.remaining,
            time: newRecord.time
        };
    }
}

// موديول المجموعات
class GroupCRUD {
    static save(db, data, editId = null) {
        if (editId) {
            const idx = db.groups.findIndex(g => g.id === editId);
            if (idx !== -1) {
                db.groups[idx] = { ...db.groups[idx], ...data };
                return db.groups[idx];
            }
        } else {
            const newGroup = {
                id: Helpers.generateID(),
                ...data
            };
            db.groups.push(newGroup);
            return newGroup;
        }
        return null;
    }

    static delete(db, id, toast) {
        const group = db.groups.find(g => g.id === id);
        if (group) {
            const hasStudents = db.students.some(s => s.group === group.name);
            if (hasStudents) {
                toast.trigger("error", "لا يمكن حذف المجموعة! توجد طلاب مسجلة بالفعل ضمن هذه المجموعة.");
                return false;
            }
        }
        db.groups = db.groups.filter(g => g.id !== id);
        return true;
    }
}

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

// موديول المدرسين
class TeacherCRUD {
    static save(db, data, editId = null) {
        if (editId) {
            const idx = db.teachers.findIndex(t => t.id === editId);
            if (idx !== -1) {
                db.teachers[idx] = { ...db.teachers[idx], ...data };
                return db.teachers[idx];
            }
        } else {
            const newTeacher = {
                id: Helpers.generateID(),
                ratio: Number(data.ratio || 0),
                ...data
            };
            db.teachers.push(newTeacher);
            return newTeacher;
        }
        return null;
    }

    static delete(db, id, toast) {
        const hasGroups = db.groups.some(g => Number(g.teacherId) === Number(id));
        if (hasGroups) {
            toast.trigger("error", "لا يمكن حذف المعلم! توجد مجموعات دراسية نشطة تابعة له.");
            return false;
        }
        db.teachers = db.teachers.filter(t => t.id !== id);
        return true;
    }
}

class TeacherStats {
    static getStats(db, teacher) {
        const teacherGroups = db.groups.filter(g => Number(g.teacherId) === Number(teacher.id));
        const groupCount = teacherGroups.length;

        const groupNames = teacherGroups.map(g => g.name);
        const studentCount = db.students.filter(s => groupNames.includes(s.group)).length;

        return { groupCount, studentCount };
    }
}

// موديول القاعات الدراسية
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
                id: Helpers.generateID(),
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

// موديول المراحل الدراسية
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
                id: Helpers.generateID(),
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

class ArchiveHandler {
    static archive(db, archiveName) {
        const archiveRecord = {
            id: Helpers.generateID(),
            name: archiveName || `العام الدراسي ${Helpers.getLocalDate()}`,
            date: Helpers.getLocalDate(),
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
            time: Helpers.getLocalTime()
        });
    }
}

// موديول المالية والمقبوضات
class PaymentHandler {
    static save(db, paymentData) {
        const newPayment = {
            id: Helpers.generateID(),
            date: Helpers.getLocalDate(),
            time: Helpers.getLocalTime(),
            ...paymentData
        };
        db.payments.push(newPayment);

        const student = db.students.find(s => s.id === Number(paymentData.studentId));
        db.logs.push({
            action: "تحصيل اشتراك",
            detail: `تم سداد مبلغ ${paymentData.amount} ج.م للطالب ${student ? student.name : 'مجهول'}`,
            time: Helpers.getLocalTime()
        });

        return newPayment;
    }
}

// موديول الكارنيهات والطباعة المتقدمة القياسية (85x55 مم)
function generateCardQR(code) {
    setTimeout(() => {
        const target = document.getElementById('qrcode-card-box');
        if (!target) return;
        target.innerHTML = '';
        new QRCode(target, {
            text: String(code),
            width: 75,
            height: 75
        });
    }, 100);
}

function downloadSingleCard(st) {
    if (!st) return;
    const element = document.getElementById('card-preview-area');
    const opt = {
        margin: 0,
        filename: 'Card_' + st.code + '.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 3, useCORS: true },
        jsPDF: { unit: 'mm', format: [85, 55], orientation: 'landscape' }
    };
    html2pdf().from(element).set(opt).save();
}

function printAllCards(students, cardTemplate) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    let cardsHtml = '';
    
    students.forEach(st => {
        cardsHtml += `
            <div class="card-item" style="width: 85mm; height: 55mm; border: 1px solid #ddd; border-radius: 12px; position: relative; margin: 10px; display: inline-flex; flex-direction: column; justify-content: space-between; background: ${cardTemplate ? `url(${cardTemplate})` : 'linear-gradient(135deg, #4f46e5, #0ea5e9)'}; color: ${cardTemplate ? '#333' : '#fff'}; font-family: 'Cairo', sans-serif; direction: rtl; box-sizing: border-box; padding: 15px; page-break-inside: avoid;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 800;">${st.name}</h4>
                        <p style="margin: 0; font-size: 10px; opacity: 0.9;">${st.year}</p>
                        <p style="margin: 2px 0 0 0; font-size: 10px; opacity: 0.9; font-weight: bold;">${st.group}</p>
                        <p style="margin: 4px 0 0 0; font-size: 9px; opacity: 0.8;">الهاتف: ${st.phone || '-'}</p>
                    </div>
                    <div style="text-align: center;">
                        <img src="${st.image || 'https://via.placeholder.com/50'}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover; border: 2px solid #fff; margin-bottom: 4px;" />
                        <div id="print-qr-${st.id}" style="background: white; padding: 2px; border-radius: 4px; display: inline-block;"></div>
                    </div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: flex-end; font-size: 9px; opacity: 0.9; font-family: monospace;">
                    <span style="font-weight: bold;">${st.code}</span>
                    <span>أكاديمية أبيكس التعليمية</span>
                </div>
            </div>
        `;
    });
    
    printWindow.document.write(`
        <html>
        <head>
            <title>طباعة الكارنيهات</title>
            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;800&display=swap" rel="stylesheet">
            <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
            <style>
                body { font-family: 'Cairo', sans-serif; margin: 0; padding: 15px; text-align: center; background: #fff; }
                .card-item { page-break-inside: avoid; }
                @media print { body { padding: 0; } }
            </style>
        </head>
        <body>
            <div style="display: flex; flex-wrap: wrap; justify-content: center;">
                ${cardsHtml}
            </div>
            <script>
                setTimeout(() => {
                    ${students.map(st => `try { new QRCode(document.getElementById('print-qr-${st.id}'), { text: '${st.code}', width: 40, height: 40 }); } catch(e) {}`).join('\n')}
                    window.print();
                    setTimeout(() => { window.close(); }, 1000);
                }, 800);
            <\/script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

window._apexCards = { printAllCards, generateCardQR, downloadSingleCard };

/* ==========================================================================
   6. مخزن الحالات المركزي للتطبيق (Master Alpine Store)
   ========================================================================== */
window.ApexStore = {
    db: null,
    isUnlocked: false,
    passwordInput: "",
    passwordError: false,
    showArchiveModal: false,
    archiveYearName: "",
    toast: new ToastManager(),
    hasUpdate: false,
    remoteVersion: "115",
    globalQuery: "",
    showGlobalSearchResults: false,
    activeStudentDetails: null,
    currentTab: "home",
    editingStudent: null,

    // Getters ديناميكية للربط التلقائي للبيانات
    get students() { return this.db?.students || []; },
    get teachers() { return this.db?.teachers || []; },
    get attendance() { return this.db?.attendance || []; },
    get payments() { return this.db?.payments || []; },
    get groups() { return this.db?.groups || []; },
    get years() { return this.db?.years || []; },
    get halls() { return this.db?.halls || []; },
    get archivedYears() { return this.db?.archivedYears || []; },
    get logs() { return this.db?.logs || []; },
    get cardTemplate() { return this.db?.cardTemplate || null; },

    initApp() {
        this.db = StorageHandler.load();
        this.isUnlocked = AuthHandler.isUnlocked();
        this.checkVersion();
    },

    sync() {
        StorageHandler.save(this.db);
    },

    checkPassword() {
        const verified = AuthHandler.verify(this.passwordInput, this.db.settings.password);
        if (verified) {
            this.isUnlocked = true;
            this.passwordError = false;
            this.toast.trigger("success", "تم تسجيل الدخول بنجاح! مرحباً بك.");
        } else {
            this.passwordError = true;
            this.toast.trigger("error", "رمز التحقق المدخل غير صحيح!");
        }
        this.passwordInput = "";
    },

    async checkVersion() {
        const updateInfo = await UpdateHandler.check();
        this.hasUpdate = updateInfo.hasUpdate;
        this.remoteVersion = updateInfo.remoteVersion;
    },

    triggerUpdate() {
        this.toast.trigger("warning", "يتم تحميل التحديث والملفات الجديدة...");
        setTimeout(() => {
            window.location.reload(true);
        }, 1000);
    },

    getBackupInfo() {
        return {
            date: Helpers.getLocalDate(),
            version: "115",
            size: StorageHandler.calculateStats(),
            recordsCount: this.students.length + this.payments.length + this.attendance.length
        };
    },

    get globalSearchResults() {
        if (!this.globalQuery) return { students: [], teachers: [], groups: [] };
        const q = this.globalQuery.toLowerCase();
        return {
            students: this.students.filter(s => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)),
            teachers: this.teachers.filter(t => t.name.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q)),
            groups: this.groups.filter(g => g.name.toLowerCase().includes(q))
        };
    },

    get dashboardStats() {
        const totalRevenue = this.payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
        const totalRequired = this.students.reduce((sum, s) => sum + Number(s.requiredAmount || 0), 0);
        const arrears = Math.max(0, totalRequired - totalRevenue);

        return {
            studentsCount: this.students.length,
            groupsCount: this.groups.length,
            teachersCount: this.teachers.length,
            hallsCount: this.halls.length,
            yearsCount: this.years.length,
            attendanceCount: this.attendance.length,
            revenue: totalRevenue,
            arrears: arrears
        };
    },

    get last7DaysAttendance() {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit' });
            const count = this.attendance.filter(a => a.date === dateStr).length;
            const label = d.toLocaleDateString('ar-EG', { weekday: 'short' });
            days.push({ label, count, date: dateStr });
        }
        return days;
    },

    get hallOccupancy() {
        return this.halls.map(h => {
            const stats = HallStats.getStats(this.db, h);
            return {
                name: h.name,
                count: stats.groupCount, 
                capacity: h.capacity,
                pct: stats.occupancy
            };
        });
    },

    saveStudent(data, id = null) {
        const student = StudentCRUD.save(this.db, data, id);
        this.sync();
        if (id) {
            this.toast.trigger("success", "تم تعديل بيانات الطالب بنجاح!");
        } else {
            this.toast.trigger("success", `تم تسجيل الطالب بنجاح! كود الطالب: ${student.code}`);
        }
        this.editingStudent = null;
        return student;
    },

    deleteStudent(id) {
        if (confirm("هل أنت متأكد من حذف الطالب وسجل مدفوعاته بالكامل؟")) {
            StudentCRUD.delete(this.db, id);
            this.sync();
            this.toast.trigger("success", "تم حذف سجل الطالب بنجاح.");
        }
    },

    getStudentStats(id) {
        return StudentStats.getStats(this.db, id);
    },

    recordAttendanceByCode(code) {
        const res = AttendanceService.record(this.db, code);
        this.sync();
        if (res.success) {
            this.toast.trigger("success", res.message);
        } else {
            this.toast.trigger("warning", res.message);
        }
        return res;
    },

    saveGroup(data, id = null) {
        const group = GroupCRUD.save(this.db, data, id);
        this.sync();
        this.toast.trigger("success", "تم حفظ وتحديث المجموعة بنجاح!");
        return group;
    },

    deleteGroup(id) {
        if (confirm("هل تريد حذف هذه المجموعة الدراسية؟")) {
            const deleted = GroupCRUD.delete(this.db, id, this.toast);
            if (deleted) {
                this.sync();
                this.toast.trigger("success", "تم حذف المجموعة التعليمية.");
            }
        }
    },

    getGroupStats(group) {
        return GroupStats.getStats(this.db, group);
    },

    saveTeacher(data, id = null) {
        const t = TeacherCRUD.save(this.db, data, id);
        this.sync();
        this.toast.trigger("success", "تم حفظ وتحديث المعلم بنجاح!");
        return t;
    },

    deleteTeacher(id) {
        if (confirm("هل تريد إزالة هذا المعلم؟")) {
            const deleted = TeacherCRUD.delete(this.db, id, this.toast);
            if (deleted) {
                this.sync();
                this.toast.trigger("success", "تم حذف المعلم بنجاح.");
            }
        }
    },

    getTeacherStats(teacher) {
        return TeacherStats.getStats(this.db, teacher);
    },

    saveHall(data, id = null) {
        const h = HallCRUD.save(this.db, data, id);
        this.sync();
        this.toast.trigger("success", "تم حفظ القاعة بنجاح!");
        return h;
    },

    deleteHall(id) {
        if (confirm("هل تريد إزالة هذه القاعة الدراسية؟")) {
            const deleted = HallCRUD.delete(this.db, id, this.toast);
            if (deleted) {
                this.sync();
                this.toast.trigger("success", "تم إزالة القاعة.");
            }
        }
    },

    getHallStats(hall) {
        return HallStats.getStats(this.db, hall);
    },

    saveYear(data, id = null) {
        const y = YearCRUD.save(this.db, data, id);
        this.sync();
        this.toast.trigger("success", "تم حفظ المرحلة الدراسية.");
        return y;
    },

    deleteYear(id) {
        if (confirm("هل تريد حذف هذه المرحلة؟")) {
            const deleted = YearCRUD.delete(this.db, id, this.toast);
            if (deleted) {
                this.sync();
                this.toast.trigger("success", "تم إزالة المرحلة الدراسية بنجاح.");
            }
        }
    },

    savePayment(paymentData) {
        const pay = PaymentHandler.save(this.db, paymentData);
        this.sync();
        this.toast.trigger("success", `تم تسجيل عملية الدفع بمبلغ ${paymentData.amount} ج.م`);
        return pay;
    },

    confirmArchiveYear() {
        if (!this.archiveYearName.trim()) {
            this.toast.trigger("warning", "الرجاء تحديد اسم صالح للأرشيف!");
            return;
        }
        ArchiveHandler.archive(this.db, this.archiveYearName);
        this.sync();
        this.showArchiveModal = false;
        this.archiveYearName = "";
        this.toast.trigger("success", "تم ترحيل وحفظ بيانات العام الدراسي بأمان ✅");
    },

    deleteArchivedYear(id) {
        if (confirm("هل أنت متأكد من حذف هذا الأرشيف التاريخي نهائياً؟")) {
            this.db.archivedYears = this.db.archivedYears.filter(a => a.id !== id);
            this.sync();
            this.toast.trigger("success", "تم حذف الأرشيف.");
        }
    },

    restoreArchivedYear(arch) {
        if (confirm("هل ترغب في استعراض الأرشيف؟ سيتم حفظ النسخة الحالية واستعادة بيانات الأرشيف.")) {
            this.db.students = arch.students;
            this.db.payments = arch.payments;
            this.db.attendance = arch.attendance;
            this.sync();
            this.toast.trigger("success", `تم استعراض أرشيف: ${arch.name}`);
        }
    },

    uploadCardTemplate(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.db.cardTemplate = e.target.result;
                this.sync();
                this.toast.trigger("success", "تم تحميل وحفظ قالب الكارنيه بنجاح!");
            };
            reader.readAsDataURL(file);
        }
    },

    generateDetailsQR(code) {
        setTimeout(() => {
            const target = document.getElementById('details-qrcode-box');
            if (!target) return;
            target.innerHTML = '';
            new QRCode(target, {
                text: String(code),
                width: 85,
                height: 85
            });
        }, 100);
    },

    exportData() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.db));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `Apex_Academy_DB_${Date.now()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        document.body.removeChild(downloadAnchor);
        this.toast.trigger("success", "تم تصدير ملف النسخة الاحتياطية بأمان.");
    },

    importData(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const parsed = JSON.parse(e.target.result);
                    if (parsed.students && parsed.settings) {
                        this.db = parsed;
                        this.sync();
                        this.toast.trigger("success", "تم استيراد قاعدة البيانات واستعادتها بنجاح!");
                        setTimeout(() => window.location.reload(), 1200);
                    } else {
                        this.toast.trigger("error", "ملف النسخة الاحتياطية غير صالح!");
                    }
                } catch (err) {
                    this.toast.trigger("error", "خطأ في قراءة ملف JSON.");
                }
            };
            reader.readAsText(file);
        }
    },

    exportToCSV(data, filename, headers) {
        Helpers.exportCSV(data, filename, headers);
    },

    printTable(title, headers, rows) {
        Helpers.printTable(title, headers, rows);
    }
};

/* ==========================================================================
   7. تهيئة وإطلاق تطبيق جافا سكريبت (Application Initializer)
   ========================================================================== */
document.addEventListener('alpine:init', () => {
    // تسجيل مخزن الحالة بشكل مباشر ليعمل مع Alpine.js
    Alpine.store('apex', window.ApexStore);
});

window.addEventListener('DOMContentLoaded', () => {
    console.log("Apex Academy Engine Core v115 Standalone Initialized successfully.");
});