window.ApexStore = {
    db: null,
    isUnlocked: false,
    passwordInput: "",
    passwordError: false,
    showArchiveModal: false,
    archiveYearName: "",
    toast: new window.ToastManager(),
    hasUpdate: false,
    remoteVersion: "115",
    globalQuery: "",
    showGlobalSearchResults: false,
    activeStudentDetails: null,
    currentTab: "home",
    editingStudent: null,

    // Getters ديناميكية للربط التلقائي والآمن للبيانات
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
        this.db = window.StorageHandler.load();
        this.isUnlocked = window.AuthHandler.isUnlocked();
        this.checkVersion();
    },

    sync() {
        window.StorageHandler.save(this.db);
    },

    checkPassword() {
        const verified = window.AuthHandler.verify(this.passwordInput, this.db.settings.password);
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
        const updateInfo = await window.UpdateHandler.check();
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
            date: window.Helpers.getLocalDate(),
            version: "115",
            size: window.StorageHandler.calculateStats(),
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
            const stats = window.HallStats.getStats(this.db, h);
            return {
                name: h.name,
                count: stats.groupCount, 
                capacity: h.capacity,
                pct: stats.occupancy
            };
        });
    },

    saveStudent(data, id = null) {
        const student = window.StudentCRUD.save(this.db, data, id);
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
            window.StudentCRUD.delete(this.db, id);
            this.sync();
            this.toast.trigger("success", "تم حذف سجل الطالب بنجاح.");
        }
    },

    getStudentStats(id) {
        return window.StudentStats.getStats(this.db, id);
    },

    recordAttendanceByCode(code) {
        const res = window.AttendanceService.record(this.db, code);
        this.sync();
        if (res.success) {
            this.toast.trigger("success", res.message);
        } else {
            this.toast.trigger("warning", res.message);
        }
        return res;
    },

    saveGroup(data, id = null) {
        const group = window.GroupCRUD.save(this.db, data, id);
        this.sync();
        this.toast.trigger("success", "تم حفظ وتحديث المجموعة بنجاح!");
        return group;
    },

    deleteGroup(id) {
        if (confirm("هل تريد حذف هذه المجموعة الدراسية؟")) {
            const deleted = window.GroupCRUD.delete(this.db, id, this.toast);
            if (deleted) {
                this.sync();
                this.toast.trigger("success", "تم حذف المجموعة التعليمية.");
            }
        }
    },

    getGroupStats(group) {
        return window.GroupStats.getStats(this.db, group);
    },

    saveTeacher(data, id = null) {
        const t = window.TeacherCRUD.save(this.db, data, id);
        this.sync();
        this.toast.trigger("success", "تم حفظ وتحديث المعلم بنجاح!");
        return t;
    },

    deleteTeacher(id) {
        if (confirm("هل تريد إزالة هذا المعلم؟")) {
            const deleted = window.TeacherCRUD.delete(this.db, id, this.toast);
            if (deleted) {
                this.sync();
                this.toast.trigger("success", "تم حذف المعلم بنجاح.");
            }
        }
    },

    getTeacherStats(teacher) {
        return window.TeacherStats.getStats(this.db, teacher);
    },

    saveHall(data, id = null) {
        const h = window.HallCRUD.save(this.db, data, id);
        this.sync();
        this.toast.trigger("success", "تم حفظ القاعة بنجاح!");
        return h;
    },

    deleteHall(id) {
        if (confirm("هل تريد إزالة هذه القاعة الدراسية؟")) {
            const deleted = window.HallCRUD.delete(this.db, id, this.toast);
            if (deleted) {
                this.sync();
                this.toast.trigger("success", "تم إزالة القاعة.");
            }
        }
    },

    getHallStats(hall) {
        return window.HallStats.getStats(this.db, hall);
    },

    saveYear(data, id = null) {
        const y = window.YearCRUD.save(this.db, data, id);
        this.sync();
        this.toast.trigger("success", "تم حفظ المرحلة الدراسية.");
        return y;
    },

    deleteYear(id) {
        if (confirm("هل تريد حذف هذه المرحلة؟")) {
            const deleted = window.YearCRUD.delete(this.db, id, this.toast);
            if (deleted) {
                this.sync();
                this.toast.trigger("success", "تم إزالة المرحلة الدراسية بنجاح.");
            }
        }
    },

    savePayment(paymentData) {
        const pay = window.PaymentHandler.save(this.db, paymentData);
        this.sync();
        this.toast.trigger("success", `تم تسجيل عملية الدفع بمبلغ ${paymentData.amount} ج.م`);
        return pay;
    },

    confirmArchiveYear() {
        if (!this.archiveYearName.trim()) {
            this.toast.trigger("warning", "الرجاء تحديد اسم صالح للأرشيف!");
            return;
        }
        window.ArchiveHandler.archive(this.db, this.archiveYearName);
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
            const currentBackup = {
                students: [...this.db.students],
                payments: [...this.db.payments],
                attendance: [...this.db.attendance]
            };
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

    generateQR(elementId, text, width = 75, height = 75) {
        setTimeout(() => {
            const target = document.getElementById(elementId);
            if (!target) return;
            target.innerHTML = '';
            new QRCode(target, {
                text: String(text),
                width: Number(width),
                height: Number(height)
            });
        }, 100);
    },

    generateDetailsQR(code) {
        this.generateQR('details-qrcode-box', code, 85, 85);
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
        window.Helpers.exportCSV(data, filename, headers);
    },

    printTable(title, headers, rows) {
        window.Helpers.printTable(title, headers, rows);
    }
};