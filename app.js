function getDynamicPassword() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    if (month >= 1 && month <= 5) {
        return (1 * year).toString();
    } else {
        return (6 * year).toString();
    }
}

document.addEventListener('alpine:init', () => {
    Alpine.store('apex', {
        // نظام الأمان والتحقق من الهوية
        isUnlocked: false,
        passwordInput: '',
        passwordError: false,
        
        // معلومات النظام والتحديثات
        currentVersion: '101.1',
        hasUpdate: false,
        remoteVersion: '',

        // محرك البحث الشامل والموحد
        globalQuery: '',
        showGlobalSearchResults: false,

        // قواعد البيانات ومصفوفات التخزين المحلي
        years: [],
        halls: [],
        groups: [],
        students: [],
        attendance: [],
        payments: [],
        teachers: [],
        archivedYears: [],
        logs: [],
        cardTemplate: '',
        currentTab: 'home',

        // إدارة النوافذ المنبثقة
        activeStudentDetails: null,
        showArchiveModal: false,
        archiveYearName: '',

        // رسائل التنبيه الفورية
        toast: { show: false, message: '', type: 'success' },
        showToast(msg, type = 'success') {
            this.toast.message = msg;
            this.toast.type = type;
            this.toast.show = true;
            setTimeout(() => { this.toast.show = false; }, 4000);
        },

        // نظام تسجيل الحركات والعمليات
        addLog(action, detail) {
            this.logs.unshift({
                id: Date.now(),
                time: new Date().toLocaleString('ar-EG'),
                action,
                detail
            });
            if (this.logs.length > 20) this.logs.pop();
            localStorage.setItem('apex_logs', JSON.stringify(this.logs));
        },

        // إقلاع النظام واستدعاء قواعد البيانات من localStorage
        initApp() {
            this.years = JSON.parse(localStorage.getItem('apex_years')) || [];
            this.halls = JSON.parse(localStorage.getItem('apex_halls')) || [];
            this.groups = JSON.parse(localStorage.getItem('apex_groups')) || [];
            this.students = JSON.parse(localStorage.getItem('apex_students')) || [];
            this.attendance = JSON.parse(localStorage.getItem('apex_attendance')) || [];
            this.payments = JSON.parse(localStorage.getItem('apex_payments')) || [];
            this.teachers = JSON.parse(localStorage.getItem('apex_teachers')) || [];
            this.archivedYears = JSON.parse(localStorage.getItem('apex_archived_years')) || [];
            this.logs = JSON.parse(localStorage.getItem('apex_logs')) || [];
            this.cardTemplate = localStorage.getItem('apex_card_template') || '';

            this.checkLoginSession();
            this.checkForUpdates();
        },

        // التحقق من صلاحية الجلسة الحالية وتخطي كلمة السر إذا لم تتبدل
        checkLoginSession() {
            const session = JSON.parse(localStorage.getItem('apex_login_session'));
            const now = new Date();
            const curMonth = now.getMonth() + 1;
            const curYear = now.getFullYear();

            if (session && 
                session.month === curMonth && 
                session.year === curYear && 
                session.version === this.currentVersion) {
                this.isUnlocked = true;
            } else {
                this.isUnlocked = false;
            }
        },

        checkPassword() {
            if (this.passwordInput.trim() === getDynamicPassword()) {
                this.isUnlocked = true;
                const now = new Date();
                const session = {
                    month: now.getMonth() + 1,
                    year: now.getFullYear(),
                    version: this.currentVersion
                };
                localStorage.setItem('apex_login_session', JSON.stringify(session));
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

        // نظام التحقق من التحديثات من مستودع الـ GitHub
        async checkForUpdates() {
            try {
                let response = await fetch('https://raw.githubusercontent.com/minaibrahimfawzy-droid/Apex-Academy/main/version.json');
                let data = await response.json();
                if (data && data.version) {
                    this.remoteVersion = data.version;
                    const dismissed = localStorage.getItem('apex_last_dismissed_version') || '';
                    if (parseFloat(data.version) > parseFloat(this.currentVersion) && data.version !== dismissed) {
                        this.hasUpdate = true;
                    }
                }
            } catch (e) {
                console.log('فشل الاتصال بخادم التحديثات');
            }
        },

        triggerUpdate() {
            localStorage.setItem('apex_last_dismissed_version', this.remoteVersion);
            this.hasUpdate = false;
            this.showToast('تم التحديث للإصدار ' + this.remoteVersion, 'success');
            setTimeout(() => {
                window.location.reload(true);
            }, 1000);
        },

        // إنتاج كود تسلسلي فريد وغير مكرر للطلاب تلقائياً
        generateNextStudentCode() {
            let maxNum = 99; 
            this.students.forEach(s => {
                const m = s.code ? s.code.match(/APEX-(\d+)/) : null;
                if (m) {
                    const num = parseInt(m[1], 10);
                    if (num > maxNum) maxNum = num;
                }
            });
            const nextNum = maxNum + 1;
            return 'APEX-' + String(nextNum).padStart(6, '0');
        },

        // أرشفة وترحيل بيانات السنة الحالية لبدء دورة جديدة
        confirmArchiveYear() {
            if (!this.archiveYearName.trim()) {
                this.showToast('يرجى كتابة اسم الأرشيف أولاً', 'warning');
                return;
            }
            const archiveData = {
                id: Date.now(),
                name: this.archiveYearName,
                date: new Date().toLocaleDateString('ar-EG'),
                years: [...this.years],
                groups: [...this.groups],
                students: [...this.students],
                attendance: [...this.attendance],
                payments: [...this.payments]
            };
            this.archivedYears.unshift(archiveData);
            localStorage.setItem('apex_archived_years', JSON.stringify(this.archivedYears));
            
            this.students = [];
            this.attendance = [];
            this.payments = [];
            this.syncStorage();
            
            this.showArchiveModal = false;
            this.archiveYearName = '';
            this.addLog('ترحيل أرشفة', 'تم ترحيل السنة بنجاح');
            this.showToast('تم ترحيل البيانات وبدء عام جديد بنجاح!');
        },

        restoreArchivedYear(archived) {
            if (confirm(`هل أنت متأكد من استعراض بيانات الأرشيف (${archived.name})؟`)) {
                this.years = [...archived.years];
                this.groups = [...archived.groups];
                this.students = [...archived.students];
                this.attendance = [...archived.attendance];
                this.payments = [...archived.payments];
                this.syncStorage();
                this.showToast('تمت استعادة بيانات الأرشيف المختار بنجاح.');
            }
        },

        deleteArchivedYear(id) {
            if (confirm('هل أنت متأكد من حذف هذا الأرشيف نهائياً؟')) {
                this.archivedYears = this.archivedYears.filter(a => a.id !== id);
                localStorage.setItem('apex_archived_years', JSON.stringify(this.archivedYears));
                this.showToast('تم حذف الأرشيف.');
            }
        },

        // معالجة وحساب النسب المالية والذمم لكل طالب على حدة
        getStudentStats(studentId) {
            const student = this.students.find(s => s.id === studentId);
            if (!student) return { paid: 0, remaining: 0, ratio: 0, lastDate: '-', count: 0, isLate: false };
            
            const stPayments = this.payments.filter(p => p.studentId === student.id);
            const paid = stPayments.reduce((sum, p) => sum + Number(p.amount), 0);
            const req = Number(student.requiredAmount) || 0;
            const remaining = Math.max(0, req - paid);
            const ratio = req > 0 ? Math.min(100, Math.round((paid / req) * 100)) : 0;
            const lastDate = stPayments.length > 0 ? stPayments[0].date : '-';
            const count = stPayments.length;
            const isLate = remaining > 0;

            return { paid, remaining, ratio, lastDate, count, isLate };
        },

        // تقارير الحضور والمبيعات للمجموعات الدراسية
        getGroupStats(g) {
            const groupStudents = this.students.filter(s => s.group === g.name && s.year === g.year);
            const groupStudentIds = groupStudents.map(s => s.id);
            const stCount = groupStudents.length;
            
            const totalRev = this.payments
                .filter(p => groupStudentIds.includes(p.studentId))
                .reduce((sum, p) => sum + Number(p.amount), 0);
                
            const todayStr = new Date().toLocaleDateString('ar-EG');
            const attendedToday = this.attendance.filter(a => a.group === g.name && a.date === todayStr).length;
            const absentToday = Math.max(0, stCount - attendedToday);
            
            const totalAttendanceForGroup = this.attendance.filter(a => a.group === g.name).length;
            const distinctDates = [...new Set(this.attendance.filter(a => a.group === g.name).map(a => a.date))].length || 1;
            const avgAttendance = stCount > 0 ? Math.round((totalAttendanceForGroup / (stCount * distinctDates)) * 100) : 0;

            return {
                studentCount: stCount,
                revenue: totalRev,
                absentToday: absentToday,
                avgAttendance: Math.min(100, avgAttendance)
            };
        },

        // معالجة استيعاب القاعات وإحصائياتها
        getHallStats(h) {
            const groupsInHall = this.groups.filter(g => g.hallId === h.id);
            const groupCount = groupsInHall.length;
            let studentCount = 0;
            groupsInHall.forEach(g => {
                studentCount += this.students.filter(s => s.group === g.name && s.year === g.year).length;
            });
            const cap = Number(h.capacity) || 1;
            const occupancy = Math.min(100, Math.round((studentCount / cap) * 100));
            
            return { groupCount, studentCount, occupancy };
        },

        // معالجة بيانات المجموعات المسندة لكل معلم
        getTeacherStats(t) {
            const groupsTaught = this.groups.filter(g => g.teacherId === t.id);
            const groupCount = groupsTaught.length;
            let studentCount = 0;
            groupsTaught.forEach(g => {
                studentCount += this.students.filter(s => s.group === g.name && s.year === g.year).length;
            });
            const groupNames = groupsTaught.map(g => g.name);
            const sessionsCount = [...new Set(this.attendance.filter(a => groupNames.includes(a.group)).map(a => a.date))].length;

            return { groupCount, studentCount, sessionsCount };
        },

        // إحصائيات لوحة التحكم الذكية
        get dashboardStats() {
            const totalPaid = this.payments.reduce((sum, p) => sum + Number(p.amount), 0);
            let totalRequired = 0;
            this.students.forEach(s => {
                totalRequired += Number(s.requiredAmount) || 0;
            });
            const totalRemaining = Math.max(0, totalRequired - totalPaid);

            return {
                studentsCount: this.students.length,
                teachersCount: this.teachers.length,
                hallsCount: this.halls.length,
                groupsCount: this.groups.length,
                yearsCount: this.years.length,
                attendanceCount: this.attendance.length,
                revenue: totalPaid,
                arrears: totalRemaining
            };
        },

        get last7DaysAttendance() {
            const list = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toLocaleDateString('ar-EG');
                const count = this.attendance.filter(a => a.date === dateStr).length;
                const label = d.toLocaleDateString('ar-EG', { weekday: 'short' });
                list.push({ label, count, date: dateStr });
            }
            return list;
        },

        get hallOccupancy() {
            return this.halls.map(h => {
                const stats = this.getHallStats(h);
                return { name: h.name, capacity: h.capacity, count: stats.studentCount, pct: stats.occupancy };
            });
        },

        // محرك البحث السريع
        get globalSearchResults() {
            const q = this.globalQuery.toLowerCase().trim();
            if (!q) return { students: [], teachers: [], groups: [], halls: [], years: [] };
            return {
                students: this.students.filter(s => 
                    (s.name && s.name.toLowerCase().includes(q)) || 
                    (s.code && s.code.toLowerCase().includes(q)) || 
                    (s.phone && s.phone.includes(q))
                ),
                teachers: this.teachers.filter(t => 
                    (t.name && t.name.toLowerCase().includes(q)) || 
                    (t.subject && t.subject.toLowerCase().includes(q))
                ),
                groups: this.groups.filter(g => 
                    (g.name && g.name.toLowerCase().includes(q))
                ),
                halls: this.halls.filter(h => h.name && h.name.toLowerCase().includes(q)),
                years: this.years.filter(y => y.name && y.name.toLowerCase().includes(q))
            };
        },

        // منشئ الرموز والمصفوفات لـ QR Code
        generateQR(containerId, code, width = 80, height = 80) {
            setTimeout(() => {
                let container = document.getElementById(containerId);
                if (container) {
                    container.innerHTML = '';
                    try {
                        new QRCode(container, { text: code, width: width, height: height });
                    } catch (e) {
                        console.error(e);
                    }
                }
            }, 150);
        },

        generateDetailsQR(code) {
            this.generateQR('details-qrcode-box', code, 120, 120);
        },

        // تصدير الكشوف بصيغة Excel CSV مع إثراء علامة BOM لدعم العربية
        exportToCSV(data, filename, headers) {
            let csvContent = "\uFEFF"; 
            csvContent += headers.join(",") + "\n";
            
            data.forEach(row => {
                const processed = row.map(val => {
                    let str = String(val || '');
                    str = str.replace(/"/g, '""');
                    if (str.includes(',') || str.includes('\n')) {
                        str = `"${str}"`;
                    }
                    return str;
                });
                csvContent += processed.join(",") + "\n";
            });
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", filename + "_" + new Date().toISOString().slice(0,10) + ".csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            this.showToast('تم تصدير ملف الإكسل بنجاح');
        },

        // طباعة الكشوف والجداول بتصميم منسق
        printTable(title, headers, rows) {
            const printWindow = window.open('', '_blank');
            let tableHtml = `
                <table style="width:100%; border-collapse: collapse; margin-top:20px; direction:rtl; text-align:right; font-family:'Cairo', sans-serif;">
                    <thead>
                        <tr style="background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                            ${headers.map(h => `<th style="padding: 10px; border: 1px solid #cbd5e1;">${h}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${rows.map((row, idx) => `
                            <tr style="border-bottom: 1px solid #e2e8f0;">
                                ${row.map(cell => `<td style="padding: 10px; border: 1px solid #e2e8f0;">${cell}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            
            printWindow.document.write(`
                <html>
                <head>
                    <title>${title}</title>
                    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet">
                    <style>
                        body { font-family: 'Cairo', sans-serif; padding: 20px; direction: rtl; }
                        h1 { text-align: center; color: #1e293b; font-size: 20px; }
                        .footer { text-align: center; margin-top: 30px; font-size: 11px; color: #64748b; }
                    </style>
                </head>
                <body>
                    <h1>أكاديمية أبيكس - ${title}</h1>
                    ${tableHtml}
                    <div class="footer">تم التوليد بواسطة نظام أبيكس لإدارة السناتر التعليمية</div>
                    <script>
                        window.onload = function() {
                            window.print();
                            setTimeout(function() { window.close(); }, 500);
                        };
                    <\/script>
                </body>
                </html>
            `);
            printWindow.document.close();
        },

        // تصدير واستيراد قواعد البيانات (النسخ الاحتياطي الخارجي)
        exportData() {
            const info = this.getBackupInfo();
            const backupData = {
                years: this.years,
                halls: this.halls,
                groups: this.groups,
                students: this.students,
                attendance: this.attendance,
                payments: this.payments,
                teachers: this.teachers,
                archivedYears: this.archivedYears,
                cardTemplate: this.cardTemplate,
                exportDate: info.date,
                version: this.currentVersion
            };
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", "Apex_Backup_" + new Date().toISOString().slice(0,10) + ".json");
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            this.addLog('نسخ احتياطي', 'تصدير قاعدة البيانات بالكامل');
        },

        importData(event) {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.years) this.years = data.years;
                    if (data.halls) this.halls = data.halls;
                    if (data.groups) this.groups = data.groups;
                    if (data.students) this.students = data.students;
                    if (data.attendance) this.attendance = data.attendance;
                    if (data.payments) this.payments = data.payments;
                    if (data.teachers) this.teachers = data.teachers;
                    if (data.archivedYears) this.archivedYears = data.archivedYears;
                    if (data.cardTemplate) this.cardTemplate = data.cardTemplate;
                    
                    this.syncStorage();
                    localStorage.setItem('apex_archived_years', JSON.stringify(this.archivedYears));
                    this.addLog('استيراد نسخة', 'تم استيراد قاعدة البيانات بنجاح');
                    this.showToast('تمت استعادة البيانات بنجاح!');
                    setTimeout(() => { window.location.reload(); }, 1000);
                } catch (err) {
                    this.showToast('الملف غير صالح.', 'error');
                }
            };
            reader.readAsText(file);
        },

        getBackupInfo() {
            const str = JSON.stringify({
                years: this.years, halls: this.halls, groups: this.groups, students: this.students,
                attendance: this.attendance, payments: this.payments, teachers: this.teachers
            });
            const bytes = new Blob([str]).size;
            const sizeStr = bytes >= 1048576 ? (bytes / 1048576).toFixed(2) + ' MB' : (bytes / 1024).toFixed(2) + ' KB';
            const totalRecords = this.years.length + this.halls.length + this.groups.length + this.students.length + this.attendance.length + this.payments.length + this.teachers.length;
            return {
                date: new Date().toLocaleDateString('ar-EG'),
                version: this.currentVersion,
                size: sizeStr,
                studentsCount: this.students.length,
                recordsCount: totalRecords
            };
        },

        // شروط وقيود الحذف لحماية ترابط البيانات
        deleteYear(id) {
            const yearObj = this.years.find(y => y.id === id);
            if (!yearObj) return;
            const hasGroups = this.groups.some(g => g.year === yearObj.name);
            if (hasGroups) {
                this.showToast('لا يمكن حذف السنة لارتباطها بمجموعات نشطة!', 'error');
                return;
            }
            if (confirm('هل أنت متأكد من حذف هذه السنة؟')) {
                this.years = this.years.filter(y => y.id !== id);
                this.syncStorage();
                this.addLog('حذف سنة', yearObj.name);
                this.showToast('تم حذف السنة.');
            }
        },

        deleteHall(id) {
            const hallObj = this.halls.find(h => h.id === id);
            if (!hallObj) return;
            const hasGroups = this.groups.some(g => g.hallId === hallObj.id);
            if (hasGroups) {
                this.showToast('لا يمكن حذف القاعة لوجود مجموعات نشطة مستخدمة لها!', 'error');
                return;
            }
            if (confirm('هل أنت متأكد من حذف هذه القاعة؟')) {
                this.halls = this.halls.filter(h => h.id !== id);
                this.syncStorage();
                this.addLog('حذف قاعة', hallObj.name);
                this.showToast('تم حذف القاعة بنجاح.');
            }
        },

        deleteGroup(id) {
            const groupObj = this.groups.find(g => g.id === id);
            if (!groupObj) return;
            const hasStudents = this.students.some(s => s.group === groupObj.name && s.year === groupObj.year);
            if (hasStudents) {
                this.showToast('لا يمكن حذف المجموعة لوجود طلاب مسجلين بها!', 'error');
                return;
            }
            if (confirm('هل أنت متأكد من حذف هذه المجموعة؟')) {
                this.groups = this.groups.filter(g => g.id !== id);
                this.syncStorage();
                this.addLog('حذف مجموعة', groupObj.name);
                this.showToast('تم حذف المجموعة.');
            }
        },

        deleteTeacher(id) {
            const tObj = this.teachers.find(t => t.id === id);
            if (!tObj) return;
            const hasGroups = this.groups.some(g => g.teacherId === tObj.id);
            if (hasGroups) {
                this.showToast('لا يمكن حذف المعلم لارتباطه بمجموعات نشطة!', 'error');
                return;
            }
            if (confirm('هل أنت متأكد من حذف هذا المعلم؟')) {
                this.teachers = this.teachers.filter(t => t.id !== id);
                this.syncStorage();
                this.addLog('حذف معلم', tObj.name);
                this.showToast('تم حذف المعلم بنجاح.');
            }
        },

        // عمليات الحفظ وقواعد التعديل
        saveYear(data, id) {
            if (!data.name.trim()) return;
            if (id) {
                let index = this.years.findIndex(y => y.id === id);
                if (index !== -1) {
                    this.years[index] = { ...this.years[index], ...data };
                    this.addLog('تعديل سنة', data.name);
                }
            } else {
                this.years.push({ id: Date.now(), ...data });
                this.addLog('إضافة سنة', data.name);
            }
            this.syncStorage();
            this.showToast('تم الحفظ.');
        },

        saveHall(data, id) {
            if (!data.name.trim()) return;
            if (id) {
                let index = this.halls.findIndex(h => h.id === id);
                if (index !== -1) {
                    this.halls[index] = { ...this.halls[index], ...data };
                    this.addLog('تعديل قاعة', data.name);
                }
            } else {
                this.halls.push({ id: Date.now(), ...data });
                this.addLog('إضافة قاعة', data.name);
            }
            this.syncStorage();
            this.showToast('تم الحفظ.');
        },

        saveGroup(data, id) {
            if (!data.name.trim() || !data.year) return;
            if (id) {
                let index = this.groups.findIndex(g => g.id === id);
                if (index !== -1) {
                    this.groups[index] = { ...this.groups[index], ...data };
                    this.addLog('تعديل مجموعة', data.name);
                }
            } else {
                this.groups.push({ id: Date.now(), ...data });
                this.addLog('إضافة مجموعة', data.name);
            }
            this.syncStorage();
            this.showToast('تم الحفظ.');
        },

        saveTeacher(data, id) {
            if (!data.name.trim()) return;
            if (id) {
                let index = this.teachers.findIndex(t => t.id === id);
                if (index !== -1) {
                    this.teachers[index] = { ...this.teachers[index], ...data };
                    this.addLog('تعديل معلم', data.name);
                }
            } else {
                this.teachers.push({ id: Date.now(), ...data });
                this.addLog('إضافة معلم', data.name);
            }
            this.syncStorage();
            this.showToast('تم الحفظ.');
        },

        saveStudent(data, id) {
            if (!data.name || !data.year || !data.group) return;
            let targetGroup = this.groups.find(g => g.name === data.group && g.year === data.year);
            let groupPrice = targetGroup ? Number(targetGroup.price) : 0;

            if (id) {
                let index = this.students.findIndex(s => s.id === id);
                if (index !== -1) {
                    this.students[index] = { 
                        ...this.students[index], 
                        ...data, 
                        requiredAmount: groupPrice 
                    };
                    this.addLog('تعديل طالب', data.name);
                }
                this.editingStudent = null;
                this.showToast('تم تعديل بيانات الطالب بنجاح.');
            } else {
                const newCode = this.generateNextStudentCode();
                const newStudent = { 
                    id: Date.now(), 
                    code: newCode, 
                    regDate: new Date().toLocaleDateString('ar-EG'),
                    requiredAmount: groupPrice,
                    qrCodeValue: newCode,
                    ...data 
                };
                this.students.unshift(newStudent);
                this.addLog('تسجيل طالب', data.name);
                this.showToast(`تم تسجيل الطالب بنجاح بالكود ${newCode}`);
            }
            this.syncStorage();
        },

        deleteStudent(id) {
            const st = this.students.find(s => s.id === id);
            if (confirm('هل أنت متأكد من حذف الطالب وكافة سجلاته؟')) {
                this.students = this.students.filter(s => s.id !== id);
                this.attendance = this.attendance.filter(a => a.studentId !== id);
                this.payments = this.payments.filter(p => p.studentId !== id);
                this.syncStorage();
                if (st) this.addLog('حذف طالب', st.name);
                this.showToast('تم حذف ملف الطالب.');
            }
        },

        // تسجيل الحضور والتحقق من عدم تكرار تسجيل الحضور في نفس اليوم
        recordAttendanceByCode(code) {
            const cleanCode = code.trim();
            const student = this.students.find(s => s.code === cleanCode || s.name.trim() === cleanCode);
            if (!student) return { success: false, message: 'الطالب غير مسجل بأكاديمية أبيكس!' };

            const todayStr = new Date().toLocaleDateString('ar-EG');
            const alreadyAttended = this.attendance.some(a => a.studentId === student.id && a.date === todayStr);

            if (alreadyAttended) {
                return { 
                    success: false, 
                    alreadyRegistered: true, 
                    message: 'تم تسجيل حضوره بالفعل اليوم!',
                    student: student,
                    time: this.attendance.find(a => a.studentId === student.id && a.date === todayStr).time
                };
            }

            const stats = this.getStudentStats(student.id);
            const record = {
                id: Date.now(),
                studentId: student.id,
                code: student.code,
                name: student.name,
                group: student.group,
                date: todayStr,
                time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
            };

            this.attendance.unshift(record);
            this.syncStorage();
            this.addLog('تسجيل حضور طالب', student.name);

            return { 
                success: true, 
                student: student, 
                totalPaid: stats.paid, 
                remaining: stats.remaining,
                time: record.time
            };
        },

        // تسجيل الدفع والتحصيل المالي
        savePayment(paymentData) {
            const student = this.students.find(s => s.id === paymentData.studentId);
            if (!student) return;
            this.payments.unshift({ 
                id: Date.now(), 
                date: new Date().toLocaleDateString('ar-EG'), 
                ...paymentData 
            });
            this.syncStorage();
            this.addLog('تحصيل اشتراك', `تحصيل مبلغ ${paymentData.amount} ج.م من ${student.name}`);
            this.showToast('تم تسجيل الدفعة بنجاح.');
        },

        uploadCardTemplate(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.cardTemplate = e.target.result;
                    localStorage.setItem('apex_card_template', this.cardTemplate);
                    this.showToast('تم تثبيت قالب الكارنيه!');
                };
                reader.readAsDataURL(file);
            }
        },

        // مزامنة البيانات وتحديث الـ LocalStorage
        syncStorage() {
            localStorage.setItem('apex_years', JSON.stringify(this.years));
            localStorage.setItem('apex_halls', JSON.stringify(this.halls));
            localStorage.setItem('apex_groups', JSON.stringify(this.groups));
            localStorage.setItem('apex_students', JSON.stringify(this.students));
            localStorage.setItem('apex_attendance', JSON.stringify(this.attendance));
            localStorage.setItem('apex_payments', JSON.stringify(this.payments));
            localStorage.setItem('apex_teachers', JSON.stringify(this.teachers));
        }
    });
});