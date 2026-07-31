document.addEventListener('alpine:init', () => {
    Alpine.store('apex', {
        // الحالات الأساسية للنظام ومفاتيح التشغيل
        isUnlocked: false,
        passwordInput: '',
        passwordError: false,
        showArchiveModal: false,
        archiveYearName: '',
        showChangelogModal: false,
        
        toast: { show: false, message: '', type: 'success' },
        hasUpdate: false,
        remoteVersion: '121',
        
        globalQuery: '',
        showGlobalSearchResults: false,
        
        currentTab: 'home',
        
        // قواعد البيانات والمصفوفات النشطة
        students: [],
        groups: [],
        teachers: [],
        halls: [],
        years: [],
        attendance: [],
        payments: [],
        financeRecords: [],
        logs: [],
        settings: {
            centerName: 'أكاديمية أبيكس التعليمية',
            adminName: 'مدير النظام',
            password: '1234',
            currency: 'ج.م'
        },
        cardTemplate: '',
        
        // كائنات التتبع المؤقتة ومسح الـ QR
        activeStudentDetails: null,
        editingStudent: null,
        lastScannedStudent: { code: '', time: 0 },
        
        // متغيرات فحص الترخيص والقفل السحابي عن بعد (التعديل الثاني عشر)
        isRemoteLocked: false,
        remoteLockMessage: '',
        licenseUrl: 'https://raw.githubusercontent.com/username/repo/main/license.json', 
        
        // فلترة طباعة الكارنيهات (المرحلة الخامسة)
        cardPrintFilter: 'all', // 'all', 'printed', 'not_printed'
        
        // إدارة التقارير التفاعلية (المرحلة السابعة)
        activeReportId: 'students',
        reportsList: [
            { id: 'students', name: '👥 تقرير الطلاب والمديونيات' },
            { id: 'attendance', name: '📅 تقرير الحضور التفصيلي' },
            { id: 'absence', name: '❌ تقرير الغياب والاتصال' },
            { id: 'cards', name: '🪪 تقرير الكارنيهات والطباعة' },
            { id: 'collection', name: '💰 تقرير تحصيل الاشتراكات' },
            { id: 'finance', name: '📊 تقرير الإيرادات والمصروفات' },
            { id: 'groups', name: '🏫 تقرير المجموعات والإشغال' },
            { id: 'years', name: '🗓️ تقرير السنوات الدراسية' },
            { id: 'teachers', name: '👨‍🏫 تقرير أداء المعلمين وعمولاتهم' }
        ],

        // حقول وعناصر البحث الذكي الحصرية لكل جدول (المرحلة الرابعة)
        searchTerms: {
            students: '',
            cards: '',
            teachers: '',
            groups: '',
            years: '',
            accounts: '',
            finance: '',
            attendance: '',
            settings: '',
            reports: ''
        },

        initApp() {
            // تحميل البيانات بشكل آمن ومستمر من LocalStorage
            this.students = this.loadFromStorage('apex_students', []);
            this.groups = this.loadFromStorage('apex_groups', []);
            this.teachers = this.loadFromStorage('apex_teachers', []);
            this.halls = this.loadFromStorage('apex_halls', []);
            this.years = this.loadFromStorage('apex_years', []);
            this.attendance = this.loadFromStorage('apex_attendance', []);
            this.payments = this.loadFromStorage('apex_payments', []);
            this.financeRecords = this.loadFromStorage('apex_finance_records', []);
            this.logs = this.loadFromStorage('apex_logs', []);
            this.settings = this.loadFromStorage('apex_settings', this.settings);
            this.cardTemplate = localStorage.getItem('apex_card_template') || '';
            
            // قفل التطبيق وضبط الـ Password
            const passStatus = localStorage.getItem('apex_is_unlocked');
            if (passStatus === 'true') {
                this.isUnlocked = true;
            } else {
                this.isUnlocked = false;
            }

            // توليد بيانات وهمية عند التشغيل للمرة الأولى لتسهيل المعاينة والاختبار
            if (this.students.length === 0 && this.groups.length === 0 && this.years.length === 0) {
                this.seedInitialData();
            }

            // إظهار نافذة التحديث الجديد مرة واحدة فقط (المرحلة الثانية عشرة)
            const viewed = localStorage.getItem('apex_version_changelog_viewed');
            if (viewed !== '121') {
                this.showChangelogModal = true;
            }

            this.addLog('تشغيل التطبيق', 'تم فتح نظام أكاديمية أبيكس المطور بنسخته المستقرة v121');
            
            // فحص ترخيص النسخة واستدعاء القفل التلقائي عن بعد (التعديل الثاني عشر)
            this.checkRemoteLicense();
        },

        seedInitialData() {
            this.years = [
                { id: 1, name: 'الصف الأول الثانوي' },
                { id: 2, name: 'الصف الثاني الثانوي' },
                { id: 3, name: 'الصف الثالث الثانوي' }
            ];
            this.halls = [
                { id: 1, name: 'قاعة الأوائل', capacity: 100 },
                { id: 2, name: 'قاعة النخبة', capacity: 60 }
            ];
            this.teachers = [
                { id: 1, name: 'أ. حسام الدين محمد', subject: 'الرياضيات', phone: '01002233445', ratio: 80 },
                { id: 2, name: 'أ. رانيا شاهين', subject: 'اللغة الإنجليزية', phone: '01223344556', ratio: 75 }
            ];
            this.groups = [
                { id: 1, name: 'مجموعة أ - رياضيات أول ثانوي', year: 'الصف الأول الثانوي', price: 150, hallId: 1, teacherId: 1, hall: 'قاعة الأوائل', teacher: 'أ. حسام الدين محمد', days: 'السبت والاثنين والأربعاء', time: '03:00 م - 05:00 م' },
                { id: 2, name: 'مجموعة ب - إنجليزي ثاني ثانوي', year: 'الصف الثاني الثانوي', price: 200, hallId: 2, teacherId: 2, hall: 'قاعة النخبة', teacher: 'أ. رانيا شاهين', days: 'الأحد والثلاثاء والخميس', time: '05:00 م - 07:00 م' }
            ];
            this.students = [
                { id: 1, code: 'ST-1001', name: 'أحمد محمود علي إسماعيل', year: 'الصف الأول الثانوي', group: 'مجموعة أ - رياضيات أول ثانوي', phone: '01122334455', parentPhone: '01556677889', school: 'الخديوية الثانوية', regDate: new Date().toLocaleDateString('ar-EG'), image: '', printedState: 'not_printed', requiredAmount: 150 },
                { id: 2, code: 'ST-1002', name: 'سارة عبد الرحمن محمد كامل', year: 'الصف الثاني الثانوي', group: 'مجموعة ب - إنجليزي ثاني ثانوي', phone: '01228899001', parentPhone: '01004455667', school: 'أم المؤمنين الثانوية', regDate: new Date().toLocaleDateString('ar-EG'), image: '', printedState: 'not_printed', requiredAmount: 200 }
            ];
            this.payments = [
                { id: 1, studentId: 1, amount: 150, month: 'سبتمبر', date: new Date().toLocaleDateString('ar-EG') }
            ];
            this.financeRecords = [
                { id: 1, type: 'income', title: 'تحصيل اشتراك الطالب أحمد محمود', category: 'اشتراكات', amount: 150, date: new Date().toLocaleDateString('ar-EG') },
                { id: 2, type: 'expense', title: 'شراء أقلام سبورة وأدوات مكتبية', category: 'أدوات مكتبية', amount: 50, date: new Date().toLocaleDateString('ar-EG') }
            ];
            this.logs = [
                { id: 1, action: 'تثبيت النظام', detail: 'تم تهيئة النظام بالبيانات الأولية الافتراضية بنجاح v121', time: new Date().toLocaleTimeString('ar-EG') }
            ];

            this.saveToStorage('apex_years', this.years);
            this.saveToStorage('apex_halls', this.halls);
            this.saveToStorage('apex_teachers', this.teachers);
            this.saveToStorage('apex_groups', this.groups);
            this.saveToStorage('apex_students', this.students);
            this.saveToStorage('apex_payments', this.payments);
            this.saveToStorage('apex_finance_records', this.financeRecords);
            this.saveToStorage('apex_logs', this.logs);
        },

        loadFromStorage(key, defaultValue) {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        },
        saveToStorage(key, value) {
            localStorage.setItem(key, JSON.stringify(value));
        },

        checkPassword() {
            const correctPass = this.settings.password || '1234';
            if (this.passwordInput === correctPass) {
                this.isUnlocked = true;
                localStorage.setItem('apex_is_unlocked', 'true');
                this.passwordError = false;
                this.passwordInput = '';
                this.showToast('مرحباً بك! تم فك قفل النظام بنجاح', 'success');
            } else {
                this.passwordError = true;
                this.showToast('كلمة المرور خاطئة. يرجى إعادة المحاولة', 'error');
            }
        },
        lockApp() {
            this.isUnlocked = false;
            localStorage.setItem('apex_is_unlocked', 'false');
            this.showToast('تم تسجيل الخروج وقفل النظام بنجاح', 'info');
        },

        get globalSearchResults() {
            const q = this.globalQuery.toLowerCase().trim();
            if (!q) return { students: [], teachers: [], groups: [] };
            
            return {
                students: this.students.filter(s => 
                    s.name.toLowerCase().includes(q) || 
                    s.code.toLowerCase().includes(q) || 
                    (s.phone && s.phone.includes(q)) ||
                    (s.parentPhone && s.parentPhone.includes(q)) ||
                    s.group.toLowerCase().includes(q)
                ).slice(0, 5),
                teachers: this.teachers.filter(t => 
                    t.name.toLowerCase().includes(q) || 
                    t.subject.toLowerCase().includes(q)
                ).slice(0, 5),
                groups: this.groups.filter(g => 
                    g.name.toLowerCase().includes(q) || 
                    g.year.toLowerCase().includes(q)
                ).slice(0, 5)
            };
        },

        addLog(action, detail) {
            const newLog = {
                id: Date.now(),
                action,
                detail,
                time: new Date().toLocaleTimeString('ar-EG')
            };
            this.logs.unshift(newLog);
            if (this.logs.length > 50) this.logs.pop();
            this.saveToStorage('apex_logs', this.logs);
        },

        showToast(message, type = 'success') {
            this.toast.message = message;
            this.toast.type = type;
            this.toast.show = true;
            setTimeout(() => {
                this.toast.show = false;
            }, 3000);
        },

        // العمليات الخاصة بالطلاب
        getStudentStats(studentId) {
            const student = this.students.find(s => s.id === studentId);
            if (!student) return { isLate: false, remaining: 0, paid: 0, ratio: 0 };

            const group = this.groups.find(g => g.name === student.group);
            const required = Number(student.requiredAmount) || (group ? Number(group.price) : 0);

            const studentPayments = this.payments.filter(p => p.studentId === studentId);
            const paid = studentPayments.reduce((sum, p) => sum + Number(p.amount), 0);

            const remaining = Math.max(0, required - paid);
            const isLate = remaining > 0;
            const ratio = required > 0 ? Math.min(100, Math.round((paid / required) * 100)) : 0;

            return { isLate, remaining, paid, ratio };
        },

        saveStudent(data, id) {
            if (id) {
                // تعديل ملف طالب
                const idx = this.students.findIndex(s => s.id === id);
                if (idx !== -1) {
                    const group = this.groups.find(g => g.name === data.group);
                    this.students[idx] = {
                        ...this.students[idx],
                        ...data,
                        requiredAmount: group ? Number(group.price) : this.students[idx].requiredAmount
                    };
                    this.saveToStorage('apex_students', this.students);
                    this.addLog('تعديل طالب', `تم تحديث ملف الطالب ${data.name}`);
                    this.showToast('تم تعديل بيانات الطالب بنجاح', 'success');
                }
            } else {
                // تسجيل طالب جديد
                const stCode = 'ST-' + Math.floor(1000 + Math.random() * 9000);
                const group = this.groups.find(g => g.name === data.group);
                const newStudent = {
                    id: Date.now(),
                    code: stCode,
                    ...data,
                    regDate: new Date().toLocaleDateString('ar-EG'),
                    printedState: 'not_printed',
                    requiredAmount: group ? Number(group.price) : 0
                };
                this.students.unshift(newStudent);
                this.saveToStorage('apex_students', this.students);
                this.addLog('تسجيل طالب', `تم تسجيل الطالب الجديد ${data.name}`);
                this.showToast('تم تسجيل الطالب وتوليد كود الحضور بنجاح', 'success');
                return newStudent;
            }
        },

        deleteStudent(id) {
            if (confirm('هل أنت متأكد من رغبتك في حذف هذا الطالب نهائياً من النظام؟')) {
                const student = this.students.find(s => s.id === id);
                this.students = this.students.filter(s => s.id !== id);
                this.payments = this.payments.filter(p => p.studentId !== id);
                this.attendance = this.attendance.filter(a => a.studentId !== id);
                
                this.saveToStorage('apex_students', this.students);
                this.saveToStorage('apex_payments', this.payments);
                this.saveToStorage('apex_attendance', this.attendance);
                
                this.addLog('حذف طالب', `تم حذف الطالب ${student ? student.name : ''}`);
                this.showToast('تم حذف الطالب وكافة سجلاته المالية وحضوره بنجاح', 'success');
            }
        },

        // العمليات الخاصة بالمجموعات
        getGroupStats(group) {
            const groupStudents = this.students.filter(s => s.group === group.name);
            const studentCount = groupStudents.length;

            let revenue = 0;
            groupStudents.forEach(st => {
                const stPayments = this.payments.filter(p => p.studentId === st.id);
                revenue += stPayments.reduce((sum, p) => sum + Number(p.amount), 0);
            });

            // معدلات الحضور والغياب
            const groupAttendanceCount = this.attendance.filter(a => a.group === group.name).length;
            const uniqueDates = [...new Set(this.attendance.filter(a => a.group === group.name).map(a => a.date))].length;
            const maxPossibleAttendance = studentCount * Math.max(1, uniqueDates);
            const avgAttendance = maxPossibleAttendance > 0 ? Math.min(100, Math.round((groupAttendanceCount / maxPossibleAttendance) * 100)) : 0;

            return { studentCount, revenue, avgAttendance };
        },

        saveGroup(data, id) {
            if (id) {
                const idx = this.groups.findIndex(g => g.id === id);
                if (idx !== -1) {
                    this.groups[idx] = { ...this.groups[idx], ...data };
                    this.saveToStorage('apex_groups', this.groups);
                    this.addLog('تعديل مجموعة', `تم تحديث بيانات المجموعة ${data.name}`);
                    this.showToast('تم تعديل المجموعة بنجاح', 'success');
                }
            } else {
                const newGroup = {
                    id: Date.now(),
                    ...data
                };
                this.groups.push(newGroup);
                this.saveToStorage('apex_groups', this.groups);
                this.addLog('إضافة مجموعة', `تم إنشاء مجموعة دراسية جديدة ${data.name}`);
                this.showToast('تم إضافة المجموعة بنجاح', 'success');
            }
        },

        deleteGroup(id) {
            if (confirm('هل أنت متأكد من حذف هذه المجموعة؟ لن يتم حذف الطلاب المرتبطين بها.')) {
                const g = this.groups.find(gr => gr.id === id);
                this.groups = this.groups.filter(gr => gr.id !== id);
                this.saveToStorage('apex_groups', this.groups);
                this.addLog('حذف مجموعة', `تم حذف المجموعة ${g ? g.name : ''}`);
                this.showToast('تم حذف المجموعة بنجاح', 'success');
            }
        },

        // العمليات والتحصيلات المالية
        savePayment(data) {
            let studentId = data.studentId;
            let amount = Number(data.amount);
            let month = data.month || 'عام';
            
            if (!studentId && data.code) {
                const st = this.students.find(s => s.code === data.code);
                if (st) {
                    studentId = st.id;
                }
            }

            if (!studentId) {
                this.showToast('حدث خطأ: لم يتم تحديد الطالب بنجاح', 'error');
                return;
            }

            const student = this.students.find(s => s.id === studentId);
            const newPayment = {
                id: Date.now(),
                studentId,
                amount,
                month,
                date: new Date().toLocaleDateString('ar-EG')
            };

            this.payments.unshift(newPayment);
            this.saveToStorage('apex_payments', this.payments);

            // ترحيلها للمعاملات اليومية للصندوق
            const newTransaction = {
                id: Date.now() + 1,
                type: 'income',
                title: `تحصيل اشتراك الطالب: ${student ? student.name : 'طالب'} (شهر: ${month})`,
                category: 'اشتراكات',
                amount,
                date: new Date().toLocaleDateString('ar-EG')
            };
            this.financeRecords.unshift(newTransaction);
            this.saveToStorage('apex_finance_records', this.financeRecords);

            this.addLog('تحصيل اشتراك', `تم تحصيل ${amount} ج.م من الطالب ${student ? student.name : ''}`);
            this.showToast('تم تسجيل دفعة الاشتراك وحفظها مالياً', 'success');
        },

        saveTransaction(data) {
            const newRecord = {
                id: Date.now(),
                type: data.type,
                title: data.title,
                category: data.category || 'عام',
                amount: Number(data.amount),
                date: new Date().toLocaleDateString('ar-EG')
            };
            this.financeRecords.unshift(newRecord);
            this.saveToStorage('apex_finance_records', this.financeRecords);
            
            const typeStr = data.type === 'income' ? 'إيراد جديد' : 'مصروف جديد';
            this.addLog(typeStr, `تم تسجيل ${data.title} بقيمة ${data.amount} ج.م`);
            this.showToast('تم حفظ المعاملة المالية بنجاح', 'success');
        },

        // إدارة المعلمين والنسب
        getTeacherStats(t) {
            const tGroups = this.groups.filter(g => g.teacherId === t.id || g.teacher === t.name);
            const groupCount = tGroups.length;

            let studentCount = 0;
            tGroups.forEach(g => {
                studentCount += this.students.filter(s => s.group === g.name).length;
            });

            return { groupCount, studentCount };
        },

        saveTeacher(data, id) {
            if (id) {
                const idx = this.teachers.findIndex(t => t.id === id);
                if (idx !== -1) {
                    this.teachers[idx] = { ...this.teachers[idx], ...data };
                    this.saveToStorage('apex_teachers', this.teachers);
                    this.addLog('تعديل معلم', `تم تحديث ملف المعلم ${data.name}`);
                    this.showToast('تم تعديل بيانات المعلم بنجاح', 'success');
                }
            } else {
                const newTeacher = {
                    id: Date.now(),
                    ...data,
                    ratio: data.ratio || 80
                };
                this.teachers.push(newTeacher);
                this.saveToStorage('apex_teachers', this.teachers);
                this.addLog('إضافة معلم', `تم تسجيل المعلم الجديد ${data.name}`);
                this.showToast('تم إضافة المعلم بنجاح', 'success');
            }
        },

        deleteTeacher(id) {
            if (confirm('هل أنت متأكد من حذف هذا المعلم؟')) {
                const t = this.teachers.find(teach => teach.id === id);
                this.teachers = this.teachers.filter(teach => teach.id !== id);
                this.saveToStorage('apex_teachers', this.teachers);
                this.addLog('حذف معلم', `تم حذف المعلم ${t ? t.name : ''}`);
                this.showToast('تم حذف المعلم بنجاح', 'success');
            }
        },

        // إدارة القاعات والاستيعاب
        getHallStats(h) {
            const hGroups = this.groups.filter(g => g.hallId === h.id || g.hall === h.name);
            const groupCount = hGroups.length;

            let totalStudents = 0;
            hGroups.forEach(g => {
                totalStudents += this.students.filter(s => s.group === g.name).length;
            });

            const capacity = h.capacity || 50;
            const occupancy = Math.min(100, Math.round((totalStudents / capacity) * 100));

            return { groupCount, occupancy };
        },

        saveHall(data, id) {
            if (id) {
                const idx = this.halls.findIndex(h => h.id === id);
                if (idx !== -1) {
                    this.halls[idx] = { ...this.halls[idx], ...data };
                    this.saveToStorage('apex_halls', this.halls);
                    this.addLog('تعديل قاعة', `تم تحديث بيانات القاعة ${data.name}`);
                    this.showToast('تم تعديل القاعة بنجاح', 'success');
                }
            } else {
                const newHall = {
                    id: Date.now(),
                    capacity: data.capacity || 50,
                    ...data
                };
                this.halls.push(newHall);
                this.saveToStorage('apex_halls', this.halls);
                this.addLog('إضافة قاعة', `تم إنشاء قاعة دراسية جديدة ${data.name}`);
                this.showToast('تم إضافة القاعة بنجاح', 'success');
            }
        },

        deleteHall(id) {
            if (confirm('هل أنت متأكد من حذف هذه القاعة؟')) {
                const h = this.halls.find(ha => ha.id === id);
                this.halls = this.halls.filter(ha => ha.id !== id);
                this.saveToStorage('apex_halls', this.halls);
                this.addLog('حذف قاعة', `تم حذف القاعة ${h ? h.name : ''}`);
                this.showToast('تم حذف القاعة بنجاح', 'success');
            }
        },

        // إدارة السنوات الأكاديمية
        saveYear(data, id) {
            if (id) {
                const idx = this.years.findIndex(y => y.id === id);
                if (idx !== -1) {
                    this.years[idx] = { ...this.years[idx], ...data };
                    this.saveToStorage('apex_years', this.years);
                    this.addLog('تعديل سنة دراسية', `تم تعديل المرحلة ${data.name}`);
                    this.showToast('تم تعديل السنة الدراسية بنجاح', 'success');
                }
            } else {
                const newYear = {
                    id: Date.now(),
                    ...data
                };
                this.years.push(newYear);
                this.saveToStorage('apex_years', this.years);
                this.addLog('إضافة سنة دراسية', `تم إضافة المرحلة الدراسية ${data.name}`);
                this.showToast('تم إضافة السنة الدراسية بنجاح', 'success');
            }
        },

        deleteYear(id) {
            if (confirm('هل أنت متأكد من حذف هذه السنة الدراسية؟')) {
                const y = this.years.find(ye => ye.id === id);
                this.years = this.years.filter(ye => ye.id !== id);
                this.saveToStorage('apex_years', this.years);
                this.addLog('حذف سنة دراسية', `تم حذف المرحلة ${y ? y.name : ''}`);
                this.showToast('تم حذف السنة الدراسية بنجاح', 'success');
            }
        },

        // دالة الفحص السحابي والتحقق من الإنترنت (التعديل الثاني عشر)
        async checkRemoteLicense() {
            const localLockStatus = localStorage.getItem('apex_remote_locked');
            if (localLockStatus === 'true') {
                this.isRemoteLocked = true;
                this.remoteLockMessage = localStorage.getItem('apex_remote_lock_msg') || 'تم إيقاف الترخيص عن بعد.';
            }

            if (navigator.onLine && this.licenseUrl) {
                try {
                    const response = await fetch(this.licenseUrl + '?t=' + Date.now(), { cache: "no-store" });
                    if (response.ok) {
                        const data = await response.json();
                        if (data.locked === true) {
                            this.isRemoteLocked = true;
                            this.remoteLockMessage = data.message;
                            localStorage.setItem('apex_remote_locked', 'true');
                            localStorage.setItem('apex_remote_lock_msg', data.message);
                        } else {
                            this.isRemoteLocked = false;
                            localStorage.removeItem('apex_remote_locked');
                            localStorage.removeItem('apex_remote_lock_msg');
                        }
                    }
                } catch (err) {
                    console.log("Offline or server error, loaded cached license status.");
                }
            }
        },

        // مسح كل شيء وإعادة ضبط المصنع الآمنة للنظام (المرحلة الحادية عشرة المحدثة)
        clearAllData() {
            if (confirm('⚠️ تحذير شديد الخطورة: سيتم مسح كافة البيانات المسجلة بالبرنامج (الطلاب، المجموعات، الحضور، المالية، الأرشيف السنوي، والإعدادات) نهائياً ولا يمكن التراجع عن هذا الإجراء! هل تريد الاستمرار بالفعل؟')) {
                
                const passwordText = prompt('الرجاء كتابة كلمة مرور النظام الحالية لتأكيد مسح كل شيء:');
                const correctPass = this.settings.password || '1234';
                
                if (passwordText === correctPass) {
                    localStorage.removeItem('apex_students');
                    localStorage.removeItem('apex_groups');
                    localStorage.removeItem('apex_teachers');
                    localStorage.removeItem('apex_halls');
                    localStorage.removeItem('apex_years');
                    localStorage.removeItem('apex_attendance');
                    localStorage.removeItem('apex_payments');
                    localStorage.removeItem('apex_finance_records');
                    localStorage.removeItem('apex_logs');
                    localStorage.removeItem('apex_settings');
                    localStorage.removeItem('apex_archived_years');
                    localStorage.removeItem('apex_card_template');
                    localStorage.removeItem('apex_is_unlocked');
                    localStorage.removeItem('apex_remote_locked');
                    localStorage.removeItem('apex_remote_lock_msg');
                    
                    this.showToast('تم مسح وإعادة تهيئة النظام بنجاح، جاري إعادة التشغيل...', 'success');
                    
                    setTimeout(() => {
                        window.location.reload();
                    }, 1200);
                } else {
                    this.showToast('فشل التحقق: كلمة المرور غير صحيحة، تم إلغاء عملية المسح', 'error');
                }
            }
        },

        // ترحيل الأرشيف السنوي مغلق ومستقل
        confirmArchiveYear() {
            if (!this.archiveYearName.trim()) {
                this.showToast('يرجى تحديد اسم السنة أو الدفعة للأرشفة', 'warning');
                return;
            }

            const archiveRecord = {
                id: Date.now(),
                name: this.archiveYearName.trim(),
                date: new Date().toLocaleDateString('ar-EG'),
                students: [...this.students],
                groups: [...this.groups],
                payments: [...this.payments],
                attendance: [...this.attendance]
            };

            this.archivedYears = this.loadFromStorage('apex_archived_years', []);
            this.archivedYears.unshift(archiveRecord);
            this.saveToStorage('apex_archived_years', this.archivedYears);

            this.students = [];
            this.payments = [];
            this.attendance = [];
            
            this.saveToStorage('apex_students', this.students);
            this.saveToStorage('apex_payments', this.payments);
            this.saveToStorage('apex_attendance', this.attendance);

            this.addLog('ترحيل الأرشيف', `تم ترحيل وحفظ دفعة ${archiveRecord.name} بنجاح`);
            this.showToast(`تم أرشفة البيانات وترحيلها بنجاح لعام ${archiveRecord.name}`, 'success');

            this.showArchiveModal = false;
            this.archiveYearName = '';
        },

        deleteArchivedYear(id) {
            if (confirm('هل أنت متأكد من رغبتك في حذف هذا الأرشيف نهائياً؟ لا يمكن استعادة البيانات المحذوفة.')) {
                this.archivedYears = this.archivedYears.filter(a => a.id !== id);
                this.saveToStorage('apex_archived_years', this.archivedYears);
                this.addLog('حذف أرشيف', 'تم حذف أحد ملفات الأرشيف السنوية');
                this.showToast('تم حذف الأرشيف السنوي بنجاح', 'success');
            }
        },

        restoreArchivedYear(arch) {
            if (confirm(`تحذير: سيتم دمج طلاب وأنشطة أرشيف [${arch.name}] مع البيانات الحالية للنظام. هل تود الاستمرار؟`)) {
                this.students = [...this.students, ...arch.students];
                const uniqueStudents = [];
                const map = new Map();
                for (const item of this.students) {
                    if(!map.has(item.code)){
                        map.set(item.code, true);
                        uniqueStudents.push(item);
                    }
                }
                this.students = uniqueStudents;
                this.payments = [...this.payments, ...arch.payments];
                this.attendance = [...this.attendance, ...arch.attendance];

                this.saveToStorage('apex_students', this.students);
                this.saveToStorage('apex_payments', this.payments);
                this.saveToStorage('apex_attendance', this.attendance);

                this.addLog('استعادة أرشيف', `تم استعادة ودمج أرشيف ${arch.name}`);
                this.showToast('تم استعادة ودمج بيانات الأرشيف بنجاح', 'success');
            }
        },

        // أدوات تصدير التقارير وجداول البيانات للطباعة عالية الدقة (المرحلة الثالثة)
        async printTable(title, headers, rows, filename = 'Students_Report.pdf') {
            this.showToast('جاري تحضير ملف الطباعة...', 'info');

            const reportContainer = document.createElement('div');
            reportContainer.style.position = 'absolute';
            reportContainer.style.left = '-9999px';
            reportContainer.style.top = '-9999px';
            reportContainer.style.width = '800px';
            reportContainer.style.padding = '40px';
            reportContainer.style.background = '#ffffff';
            reportContainer.style.direction = 'rtl';
            reportContainer.style.fontFamily = "'Cairo', sans-serif";
            reportContainer.style.color = '#334155';

            reportContainer.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; border-b: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 48px; height: 48px; background: #4f46e5; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold;">A</div>
                        <div>
                            <h2 style="margin: 0; font-size: 20px; font-weight: 800; color: #1e293b;">أكاديمية أبيكس التعليمية</h2>
                            <p style="margin: 2px 0 0 0; font-size: 11px; color: #64748b;">تقرير ومخرجات النظام الموحد لإدارة السنتر</p>
                        </div>
                    </div>
                    <div style="text-align: left;">
                        <h3 style="margin: 0; font-size: 16px; font-weight: bold; color: #4f46e5;">${title}</h3>
                        <p style="margin: 2px 0 0 0; font-size: 10px; color: #64748b; font-family: monospace;">التاريخ: ${new Date().toLocaleDateString('ar-EG')}</p>
                    </div>
                </div>
                <table style="width: 100%; border-collapse: collapse; text-align: right; font-size: 11px;">
                    <thead>
                        <tr style="background: #f8fafc; color: #475569; border-bottom: 2px solid #cbd5e1;">
                            ${headers.map(h => `<th style="padding: 10px; font-weight: 700; border-bottom: 2px solid #cbd5e1;">${h}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${rows.map((row, idx) => `
                            <tr style="border-bottom: 1px solid #f1f5f9; background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                                ${row.map(val => `<td style="padding: 10px; color: #334155;">${val}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div style="margin-top: 40px; border-t: 1px solid #e2e8f0; padding-top: 20px; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8;">
                    <span>أكاديمية أبيكس v121</span>
                    <span>توقيع مسؤول المركز: ____________________</span>
                </div>
            `;

            document.body.appendChild(reportContainer);

            try {
                const canvas = await html2canvas(reportContainer, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true
                });

                const imgData = canvas.toDataURL('image/png');
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF('p', 'mm', 'a4');
                const imgWidth = 210;
                const pageHeight = 297;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                let heightLeft = imgHeight;
                let position = 0;

                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;

                while (heightLeft >= 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }

                pdf.save(filename);
                this.showToast('تم تصدير وحفظ التقرير بصيغة PDF بنجاح', 'success');
            } catch (e) {
                console.error(e);
                this.showToast('تعذر إنشاء ملف الـ PDF حالياً', 'error');
            } finally {
                document.body.removeChild(reportContainer);
            }
        },

        triggerUpdate() {
            this.showToast('جاري تحديث النظام لنسخة v121 المستقرة...', 'info');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    });
});

// خدمات طباعة الكارنيهات عالية الدقة (المرحلة الثالثة والخامسة)
window._apexCards = {
    generateCardQR(code) {
        const container = document.getElementById('qrcode-card-box');
        if (!container) return;
        container.innerHTML = '';
        new QRCode(container, {
            text: code,
            width: 45,
            height: 45,
            correctLevel: QRCode.CorrectLevel.H
        });
    },
    async downloadSingleCard(student, template) {
        const area = document.getElementById('card-preview-area');
        if (!area) return;
        
        const imgs = area.querySelectorAll('img');
        await Promise.all(Array.from(imgs).map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
        }));

        const canvas = await html2canvas(area, {
            scale: 3,
            useCORS: true,
            allowTaint: true
        });
        
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: [85.6, 54]
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 54);
        pdf.save(`${student.name}_Card.pdf`);
        
        const store = Alpine.store('apex');
        store.markAsPrinted([student.id]);
    },
    async printAllCards(students, template) {
        const store = Alpine.store('apex');
        const filtered = store.getFilteredCards();
        if (filtered.length === 0) {
            store.showToast('لا يوجد طلاب ضمن التصفية المحددة لطباعة كارنيهاتهم', 'warning');
            return;
        }

        store.showToast('جاري إنشاء وتحضير الكارنيهات للطباعة المجمعة في ملف واحد...', 'info');

        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '-9999px';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '20px';
        document.body.appendChild(container);

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: [85.6, 54]
        });

        for (let i = 0; i < filtered.length; i++) {
            const s = filtered[i];
            const cardEl = document.createElement('div');
            cardEl.style.width = '340px';
            cardEl.style.height = '210px';
            cardEl.style.position = 'relative';
            cardEl.style.borderRadius = '16px';
            cardEl.style.overflow = 'hidden';
            cardEl.style.display = 'flex';
            cardEl.style.flexDirection = 'column';
            cardEl.style.justifyContent = 'space-between';
            cardEl.style.padding = '16px';
            cardEl.style.boxSizing = 'border-box';
            cardEl.style.fontFamily = "'Cairo', sans-serif";
            cardEl.style.direction = 'rtl';
            cardEl.style.background = template ? `url(${template})` : 'linear-gradient(135deg, #4f46e5, #0ea5e9)';
            cardEl.style.backgroundSize = 'cover';
            cardEl.style.backgroundPosition = 'center';
            cardEl.style.color = 'white';

            cardEl.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div style="text-align: right; font-family: 'Cairo', sans-serif;">
                        <h5 style="margin: 0; font-size: 14px; font-weight: 800; color: white;">${s.name}</h5>
                        <p style="margin: 2px 0 0 0; font-size: 10px; opacity: 0.9; color: white;">${s.year}</p>
                        <p style="margin: 2px 0 0 0; font-size: 10px; opacity: 0.9; font-weight: bold; color: white;">${s.group}</p>
                        <p style="margin: 2px 0 0 0; font-size: 9px; opacity: 0.85; color: white;">هاتف: ${s.phone || '-'}</p>
                    </div>
                    <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                        <img src="${s.image || 'https://via.placeholder.com/50'}" style="width: 48px; height: 48px; border-radius: 8px; object-fit: cover; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <div class="temp-qr" style="background: white; padding: 4px; border-radius: 4px;"></div>
                    </div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: end; font-size: 9px; font-family: monospace; opacity: 0.9; font-weight: bold; color: white;">
                    <span>${s.code}</span>
                    <span style="font-family: 'Cairo', sans-serif;">أكاديمية أبيكس التعليمية</span>
                </div>
            `;

            container.appendChild(cardEl);

            const qrEl = cardEl.querySelector('.temp-qr');
            new QRCode(qrEl, {
                text: s.code,
                width: 45,
                height: 45,
                correctLevel: QRCode.CorrectLevel.H
            });

            await new Promise(r => setTimeout(r, 150));

            const imgs = cardEl.querySelectorAll('img');
            await Promise.all(Array.from(imgs).map(img => {
                if (img.complete) return Promise.resolve();
                return new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
            }));

            const canvas = await html2canvas(cardEl, {
                scale: 3,
                useCORS: true,
                allowTaint: true
            });

            const imgData = canvas.toDataURL('image/png');
            if (i > 0) {
                pdf.addPage([85.6, 54], 'landscape');
            }
            pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 54);
        }

        pdf.save('Cards.pdf');
        document.body.removeChild(container);

        const ids = filtered.map(s => s.id);
        store.markAsPrinted(ids);
        store.showToast('تم حفظ ملف الكارنيهات بنجاح وتحديث الحالات تلقائياً!', 'success');
    }
};