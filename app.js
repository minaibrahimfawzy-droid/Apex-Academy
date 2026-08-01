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
        archivedYears: [],
        
        // كائنات التتبع المؤقتة ومسح الـ QR
        activeStudentDetails: null,
        editingStudent: null,
        lastScannedStudent: { code: '', time: 0 },
        
        // وضع الترخيص والقفل السحابي عن بعد
        isRemoteLocked: false,
        remoteLockMessage: '',
        licenseUrl: 'https://raw.githubusercontent.com/username/repo/main/license.json', 
        
        // تتبع الفترة التجريبية وكود التفعيل الرياضي المطور
        trialDaysDuration: 7, 
        isTrialExpired: false,
        isActivated: false, // حالة التفعيل والترخيص الأولي
        deviceCode: '', // كود الجهاز المثبت محلياً
        activationInput: '', // حقل إدخال كود العميل
        trialRemainingText: '',
        trialTimeCreated: null,
        
        // فلترة طباعة الكارنيهات
        cardPrintFilter: 'all', 
        
        // إدارة التقارير التفاعلية
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

        // حقول وعناصر البحث الذكي الحصرية لكل جدول
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
            // تحميل البيانات بشكل آمن من LocalStorage
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
            this.archivedYears = this.loadFromStorage('apex_archived_years', []);
            this.cardTemplate = localStorage.getItem('apex_card_template') || '';
            
            const passStatus = localStorage.getItem('apex_is_unlocked');
            this.isUnlocked = passStatus === 'true';

            // توليد كود جهاز فريد وثابت عند تشغيل البرنامج لأول مرة
            let savedDeviceCode = localStorage.getItem('apex_device_id');
            if (!savedDeviceCode) {
                savedDeviceCode = String(Math.floor(1000 + Math.random() * 9000));
                localStorage.setItem('apex_device_id', savedDeviceCode);
            }
            this.deviceCode = savedDeviceCode;

            const viewed = localStorage.getItem('apex_version_changelog_viewed');
            if (viewed !== '121') {
                this.showChangelogModal = true;
            }

            this.addLog('تشغيل التطبيق', 'تم فتح نظام أكاديمية أبيكس المطور v121');
            
            this.checkRemoteLicense();
            this.checkTrialLicense();

            // تحديث العداد دورياً كل 30 ثانية في حال كان مفعل وغير منتهي
            if (this.isActivated && !this.isTrialExpired) {
                setInterval(() => {
                    this.updateTrialCountdown();
                }, 30000);
            }
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
                this.showToast('تم فك قفل النظام بنجاح', 'success');
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

        get dashboardStats() {
            const studentsCount = this.students.length;
            const groupsCount = this.groups.length;
            const teachersCount = this.teachers.length;
            const hallsCount = this.halls.length;
            const yearsCount = this.years.length;
            const attendanceCount = this.attendance.length;

            let revenue = 0;
            this.payments.forEach(p => revenue += Number(p.amount) || 0);

            let expenses = 0;
            this.financeRecords.filter(f => f.type === 'expense').forEach(f => expenses += Number(f.amount) || 0);

            let totalRequired = 0;
            this.students.forEach(s => {
                totalRequired += Number(s.requiredAmount) || 0;
            });
            
            const arrears = Math.max(0, totalRequired - revenue);
            const balance = revenue - expenses;

            return { studentsCount, groupsCount, teachersCount, hallsCount, yearsCount, attendanceCount, revenue, expenses, balance, arrears };
        },

        get last7DaysAttendance() {
            const list = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toLocaleDateString('ar-EG');
                const label = d.toLocaleDateString('ar-EG', { weekday: 'short' });
                const count = this.attendance.filter(a => a.date === dateStr).length;
                list.push({ date: dateStr, label, count });
            }
            return list;
        },

        get hallOccupancy() {
            return this.halls.map(h => {
                const groupsInHall = this.groups.filter(g => g.hallId === h.id || g.hall === h.name);
                const count = groupsInHall.length;
                const capacity = h.capacity || 50;
                const pct = Math.min(100, Math.round((count / Math.max(1, capacity)) * 100));
                return { name: h.name, count, capacity, pct };
            });
        },

        get globalSearchResults() {
            const q = this.globalQuery.toLowerCase().trim();
            if (!q) return { students: [], teachers: [], groups: [] };
            
            return {
                students: this.students.filter(s => 
                    (s.name && s.name.toLowerCase().includes(q)) || 
                    (s.code && s.code.toLowerCase().includes(q)) || 
                    (s.phone && s.phone.includes(q)) ||
                    (s.parentPhone && s.parentPhone.includes(q)) ||
                    (s.group && s.group.toLowerCase().includes(q))
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

        recordAttendanceByCode(code) {
            const student = this.students.find(s => s.code === code);
            if (!student) {
                return { success: false, message: 'عذراً، كود الطالب غير مسجل في النظام ❌' };
            }

            const todayStr = new Date().toLocaleDateString('ar-EG');
            const alreadyRecorded = this.attendance.some(a => a.studentId === student.id && a.date === todayStr);

            if (alreadyRecorded) {
                return { success: false, message: 'تم تسجيل حضور هذا الطالب مسبقاً اليوم ⚠️', student };
            }

            const newAtt = {
                id: Date.now(),
                studentId: student.id,
                name: student.name,
                code: student.code,
                group: student.group,
                date: todayStr,
                time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
            };

            this.attendance.unshift(newAtt);
            this.saveToStorage('apex_attendance', this.attendance);
            this.addLog('تسجيل حضور', `حضر الطالب ${student.name} في المجموعة ${student.group}`);
            
            const stats = this.getStudentStats(student.id);

            return {
                success: true,
                message: 'تم تسجيل الحضور بنجاح ✅',
                student,
                remaining: stats.remaining,
                time: newAtt.time
            };
        },

        getGroupStats(group) {
            const groupStudents = this.students.filter(s => s.group === group.name);
            const studentCount = groupStudents.length;

            let revenue = 0;
            groupStudents.forEach(st => {
                const stPayments = this.payments.filter(p => p.studentId === st.id);
                revenue += stPayments.reduce((sum, p) => sum + Number(p.amount), 0);
            });

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

        // فحص وتأمين الفترة التجريبية وكشف التلاعب بالساعة والمسح التلقائي الكامل للبيانات
        checkTrialLicense() {
            const now = Date.now();
            
            // 1. فحص راية انتهاء التجربة المخزنة في النظام أولاً لقفل النظام ومسح البيانات
            const expiredFlag = localStorage.getItem('apex_trial_expired_flag');
            if (expiredFlag === 'true') {
                this.wipeAndExpire();
                return;
            }

            // 2. التحقق من حالة التفعيل بكود الهوية الفريد
            const activeFlag = localStorage.getItem('apex_is_activated');
            if (activeFlag === 'true') {
                this.isActivated = true;
                
                const trialStart = localStorage.getItem('apex_trial_start');
                const lastActive = Number(localStorage.getItem('apex_trial_last_active')) || 0;
                const durationMs = this.trialDaysDuration * 24 * 60 * 60 * 1000;

                if (!trialStart) {
                    localStorage.setItem('apex_trial_start', String(now));
                    localStorage.setItem('apex_trial_last_active', String(now));
                    this.trialTimeCreated = now;
                } else {
                    this.trialTimeCreated = Number(trialStart);
                    
                    // كشف تلاعب وقت ساعة كمبيوتر السنتر للوراء لمنع تمديد المدة يدوياً
                    if (now < lastActive) {
                        this.wipeAndExpire();
                        return;
                    }
                    localStorage.setItem('apex_trial_last_active', String(now));
                }

                const timeElapsed = now - this.trialTimeCreated;
                if (timeElapsed >= durationMs) {
                    this.wipeAndExpire();
                } else {
                    this.isTrialExpired = false;
                    this.updateTrialCountdown();
                }
            } else {
                this.isActivated = false;
                this.isTrialExpired = false;
            }
        },

        // دالة تحديث عداد الأيام والساعات التجريبية المتبقية بشكل حي
        updateTrialCountdown() {
            if (!this.isActivated || this.isTrialExpired) return;
            const start = Number(localStorage.getItem('apex_trial_start')) || Date.now();
            const duration = this.trialDaysDuration * 24 * 60 * 60 * 1000;
            const elapsed = Date.now() - start;
            const remaining = duration - elapsed;

            if (remaining <= 0) {
                this.wipeAndExpire();
            } else {
                const daysLeft = Math.floor(remaining / (24 * 60 * 60 * 1000));
                const hoursLeft = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
                const minutesLeft = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
                this.trialRemainingText = `⏳ متبقي على انتهاء الفترة التجريبية: ${daysLeft} يوم و ${hoursLeft} ساعة و ${minutesLeft} دقيقة.`;
            }
        },

        // دالة مسح كافة البيانات بشكل كامل وتلقائي وقفل البرنامج للأبد
        wipeAndExpire() {
            // مسح المصفوفات النشطة من الذاكرة العشوائية فوراً لحظر استعراضها
            this.students = [];
            this.groups = [];
            this.teachers = [];
            this.halls = [];
            this.years = [];
            this.attendance = [];
            this.payments = [];
            this.financeRecords = [];
            this.logs = [];
            this.archivedYears = [];
            this.cardTemplate = '';

            // مسح وحذف كافة السجلات وملفات التخزين المحلي للمتصفح تماماً
            const keysToClear = [
                'apex_students', 'apex_groups', 'apex_teachers', 'apex_halls', 
                'apex_years', 'apex_attendance', 'apex_payments', 'apex_finance_records', 
                'apex_logs', 'apex_settings', 'apex_archived_years', 'apex_card_template', 
                'apex_is_unlocked', 'apex_is_activated', 'apex_trial_start', 'apex_trial_last_active'
            ];
            keysToClear.forEach(key => localStorage.removeItem(key));

            // تثبيت راية الإغلاق التام والمسح
            localStorage.setItem('apex_trial_expired_flag', 'true');
            this.isTrialExpired = true;
            this.isActivated = false;
            this.trialRemainingText = 'لقد تم انتهاء الفترة التجريبية لشراء نسخة من البرنامج مفعلة رجاء التواصل مع المطور 01033773242';
        },

        // دالة تفعيل البرنامج بالمعادلة الرياضية السرية (كود الجهاز × 7)
        activateApp() {
            const correctKey = Number(this.deviceCode) * 7;
            if (Number(this.activationInput.trim()) === correctKey) {
                localStorage.setItem('apex_is_activated', 'true');
                localStorage.setItem('apex_trial_start', String(Date.now()));
                localStorage.setItem('apex_trial_last_active', String(Date.now()));
                localStorage.removeItem('apex_trial_expired_flag');
                
                this.isActivated = true;
                this.isTrialExpired = false;
                this.activationInput = '';
                this.showToast('تم تفعيل الفترة التجريبية بنجاح لمدة أسبوع كامل! ✅', 'success');
                setTimeout(() => window.location.reload(), 1100);
            } else {
                this.showToast('كود التفعيل غير صحيح! يرجى مراجعة مطور النظام ❌', 'error');
            }
        },

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

        exportData() {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
                students: this.students,
                groups: this.groups,
                teachers: this.teachers,
                halls: this.halls,
                years: this.years,
                attendance: this.attendance,
                payments: this.payments,
                financeRecords: this.financeRecords,
                logs: this.logs,
                settings: this.settings,
                archivedYears: this.archivedYears
            }));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `Apex_Backup_${new Date().toLocaleDateString('ar-EG').replace(/\//g, '-')}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            this.showToast('تم تصدير النسخة الاحتياطية بنجاح ✅', 'success');
        },

        importDataDirect(file) {
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const parsed = JSON.parse(e.target.result);
                    
                    if (parsed.students) { this.students = parsed.students; this.saveToStorage('apex_students', this.students); }
                    if (parsed.groups) { this.groups = parsed.groups; this.saveToStorage('apex_groups', this.groups); }
                    if (parsed.teachers) { this.teachers = parsed.teachers; this.saveToStorage('apex_teachers', this.teachers); }
                    if (parsed.halls) { this.halls = parsed.halls; this.saveToStorage('apex_halls', this.halls); }
                    if (parsed.years) { this.years = parsed.years; this.saveToStorage('apex_years', this.years); }
                    if (parsed.attendance) { this.attendance = parsed.attendance; this.saveToStorage('apex_attendance', this.attendance); }
                    if (parsed.payments) { this.payments = parsed.payments; this.saveToStorage('apex_payments', this.payments); }
                    if (parsed.financeRecords) { this.financeRecords = parsed.financeRecords; this.saveToStorage('apex_finance_records', this.financeRecords); }
                    if (parsed.logs) { this.logs = parsed.logs; this.saveToStorage('apex_logs', this.logs); }
                    if (parsed.settings) { this.settings = parsed.settings; this.saveToStorage('apex_settings', this.settings); }
                    if (parsed.archivedYears) { this.saveToStorage('apex_archived_years', parsed.archivedYears); }

                    this.addLog('استيراد بيانات', 'تم استيراد نسخة احتياطية كاملة وتعديل قواعد البيانات');
                    this.showToast('تم استيراد النسخة الاحتياطية وتحديث قواعد البيانات بالكامل بنجاح ✅', 'success');
                    
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } catch (err) {
                    console.error(err);
                    this.showToast('خطأ في قراءة ملف النسخة الاحتياطية المرفوع', 'error');
                }
            };
            reader.readAsText(file);
        },

        exportToCSV(rows, filename = 'export', headers = []) {
            let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
            if (headers.length) {
                csvContent += headers.join(",") + "\r\n";
            }
            rows.forEach(row => {
                const r = row.map(v => typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v);
                csvContent += r.join(",") + "\r\n";
            });
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `${filename}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },

        // طباعة جداول وكشوف التقارير والتحصيل بنظام html2pdf المستقر كلياً
        async printTable(title, headers, rows, filename = 'Students_Report.pdf') {
            const store = this;
            store.showToast('جاري تحضير ملف الطباعة...', 'info');

            const reportContainer = document.createElement('div');
            reportContainer.style.width = '170mm'; 
            reportContainer.style.padding = '10mm';
            reportContainer.style.background = '#ffffff';
            reportContainer.style.direction = 'rtl';
            reportContainer.style.fontFamily = "'Cairo', sans-serif";
            reportContainer.style.color = '#334155';

            reportContainer.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 25px; direction: rtl;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 40px; height: 40px; background: #4f46e5; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; font-weight: bold;">A</div>
                        <div style="text-align: right;">
                            <h2 style="margin: 0; font-size: 16px; font-weight: 800; color: #1e293b;">أكاديمية أبيكس التعليمية</h2>
                            <p style="margin: 2px 0 0 0; font-size: 9px; color: #64748b;">النظام الموحد لإدارة السنتر</p>
                        </div>
                    </div>
                    <div style="text-align: left;">
                        <h3 style="margin: 0; font-size: 13px; font-weight: bold; color: #4f46e5;">${title}</h3>
                        <p style="margin: 2px 0 0 0; font-size: 10px; color: #64748b; font-family: monospace;">التاريخ: ${new Date().toLocaleDateString('ar-EG')}</p>
                    </div>
                </div>
                <table style="width: 100%; border-collapse: collapse; text-align: right; font-size: 10px; direction: rtl;">
                    <thead>
                        <tr style="background: #f8fafc; color: #475569; border-bottom: 2px solid #cbd5e1;">
                            ${headers.map(h => `<th style="padding: 8px; font-weight: 700; border-bottom: 2px solid #cbd5e1; text-align: right;">${h}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${rows.map((row, idx) => `
                            <tr style="border-bottom: 1px solid #f1f5f9; background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                                ${row.map(val => `<td style="padding: 8px; color: #334155; text-align: right;">${val}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px; display: flex; justify-content: space-between; font-size: 9px; color: #94a3b8; direction: rtl;">
                    <span>أكاديمية أبيكس v121</span>
                    <span>توقيع المشرف: ____________________</span>
                </div>
            `;

            document.body.appendChild(reportContainer);

            if (typeof html2pdf !== 'undefined') {
                const opt = {
                    margin: 10,
                    filename: filename,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                };

                html2pdf().set(opt).from(reportContainer).save().then(() => {
                    document.body.removeChild(reportContainer);
                    store.showToast('تم تحميل التقرير بنجاح ✅', 'success');
                }).catch(err => {
                    console.error(err);
                    document.body.removeChild(reportContainer);
                    store.showToast('حدث خطأ أثناء تحميل الملف', 'error');
                });
            } else {
                window.print();
                document.body.removeChild(reportContainer);
            }
        },

        getFilteredCards() {
            return this.students.filter(s => {
                const q = this.searchTerms.cards.toLowerCase().trim();
                const matchesSearch = !q || 
                    (s.name && s.name.toLowerCase().includes(q)) || 
                    (s.code && s.code.toLowerCase().includes(q)) || 
                    (s.phone && s.phone.toLowerCase().includes(q)) || 
                    (s.group && s.group.toLowerCase().includes(q));
                
                const pState = s.printedState || 'not_printed';
                
                if (this.cardPrintFilter === 'printed') {
                    return matchesSearch && pState === 'printed';
                } else if (this.cardPrintFilter === 'not_printed') {
                    return matchesSearch && pState === 'not_printed';
                }
                return matchesSearch;
            });
        },

        markAsPrinted(ids) {
            this.students.forEach(s => {
                if (ids.includes(s.id)) {
                    s.printedState = 'printed';
                }
            });
            this.students = [...this.students];
            this.saveToStorage('apex_students', this.students);
        },

        resetPrintStatus() {
            if (confirm('هل أنت متأكد من إعادة تعيين حالة الطباعة لكافة الطلاب لتبدو لم تتم الطباعة؟')) {
                this.students.forEach(s => s.printedState = 'not_printed');
                this.students = [...this.students];
                this.saveToStorage('apex_students', this.students);
                this.showToast('تم إعادة تعيين حالة طباعة الكارنيهات لجميع الطلاب بنجاح ✅', 'success');
            }
        },

        uploadCardTemplate(event) {
            const file = event.target.files[0];
            if (!file) return;
            const store = this;
            const reader = new FileReader();
            reader.onload = (e) => {
                store.cardTemplate = e.target.result;
                localStorage.setItem('apex_card_template', store.cardTemplate);
                store.showToast('تم تحميل وتطبيق تصميم خلفية الكارنيه بنجاح ✅', 'success');
            };
            reader.readAsDataURL(file);
        },

        triggerUpdate() {
            this.showToast('جاري تحديث النظام لنسخة v121 المستقرة...', 'info');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    });
});

window._apexCards = {
    generateCardQR(code) {
        const container = document.getElementById('qrcode-card-box');
        if (!container) return;
        container.innerHTML = '';
        if (typeof QRCode !== 'undefined') {
            new QRCode(container, {
                text: code,
                width: 45,
                height: 45,
                correctLevel: QRCode.CorrectLevel.H
            });
        }
    },
    async downloadSingleCard(student, template) {
        const area = document.getElementById('card-preview-area');
        if (!area) return;
        
        const opt = {
            margin: 0,
            filename: `${student.name}_Card.pdf`,
            image: { type: 'jpeg', quality: 1.0 },
            html2canvas: { scale: 3.5, useCORS: true, allowTaint: true },
            jsPDF: { unit: 'mm', format: [85.6, 54], orientation: 'landscape' }
        };
        
        html2pdf().set(opt).from(area).save().then(() => {
            const store = Alpine.store('apex');
            store.markAsPrinted([student.id]);
        }).catch(err => {
            console.error(err);
        });
    },
    async downloadCardElement(element, filename, studentId) {
        const store = Alpine.store('apex');
        store.showToast('جاري تحضير الكارت للتحميل الحجمي...', 'info');
        
        const buttons = element.querySelector('.action-buttons-wrap');
        const badge = element.querySelector('.print-status-badge');
        
        if (buttons) buttons.style.display = 'none';
        if (badge) badge.style.display = 'none';

        const originalShadow = element.style.boxShadow;
        const originalBorder = element.style.border;
        element.style.boxShadow = 'none';
        element.style.border = 'none';

        const opt = {
            margin: 0,
            filename: filename,
            image: { type: 'jpeg', quality: 1.0 },
            html2canvas: { scale: 3.5, useCORS: true, allowTaint: true },
            jsPDF: { unit: 'mm', format: [85.6, 54], orientation: 'landscape' }
        };

        html2pdf().set(opt).from(element).save().then(() => {
            if (buttons) buttons.style.display = 'flex';
            if (badge) badge.style.display = 'inline-block';
            element.style.boxShadow = originalShadow;
            element.style.border = originalBorder;
            store.markAsPrinted([studentId]);
            store.showToast('تم تنزيل الكارنيه الفردي بنجاح ✅', 'success');
        }).catch(err => {
            console.error(err);
            if (buttons) buttons.style.display = 'flex';
            if (badge) badge.style.display = 'inline-block';
            element.style.boxShadow = originalShadow;
            element.style.border = originalBorder;
            store.showToast('حدث خطأ أثناء التنزيل الفردي', 'error');
        });
    },
    async downloadQRTag(student) {
        const store = Alpine.store('apex');
        store.showToast('جاري تصدير ملصق الـ QR الفني الخاص بالطالب...', 'info');

        const tagEl = document.createElement('div');
        tagEl.style.width = '70mm';
        tagEl.style.height = '50mm';
        tagEl.style.background = '#ffffff';
        tagEl.style.color = '#1e293b';
        tagEl.style.padding = '5mm';
        tagEl.style.boxSizing = 'border-box';
        tagEl.style.display = 'flex';
        tagEl.style.flexDirection = 'column';
        tagEl.style.alignItems = 'center';
        tagEl.style.justifyContent = 'center';
        tagEl.style.fontFamily = "'Cairo', sans-serif";
        tagEl.style.direction = 'rtl';
        tagEl.style.textAlign = 'center';
        tagEl.style.border = '1px solid #e2e8f0';

        tagEl.innerHTML = `
            <div style="font-size: 11px; font-weight: 800; color: #1e293b; margin-bottom: 2px;">أكاديمية أبيكس التعليمية</div>
            <div style="font-size: 10px; font-weight: bold; color: #4f46e5; margin-bottom: 4px;">ملصق عضوية الطالب</div>
            <div class="qr-tag-box" style="margin-bottom: 6px; display: flex; align-items: center; justify-content: center;"></div>
            <div style="font-size: 9px; font-weight: 800; color: #0f172a; line-height: 1.2; max-width: 100%; word-break: break-word;">${student.name}</div>
            <div style="font-size: 8px; font-family: monospace; font-weight: bold; color: #64748b; margin-top: 1px;">كود الطالب: ${student.code}</div>
        `;

        document.body.appendChild(tagEl);

        const qrBox = tagEl.querySelector('.qr-tag-box');
        if (typeof QRCode !== 'undefined') {
            new QRCode(qrBox, {
                text: student.code,
                width: 75,
                height: 75,
                correctLevel: QRCode.CorrectLevel.H
            });
        }

        await new Promise(r => setTimeout(r, 400));

        const opt = {
            margin: 0,
            filename: `${student.name}_QR_Tag.pdf`,
            image: { type: 'jpeg', quality: 1.0 },
            html2canvas: { scale: 3.5, useCORS: true, allowTaint: true },
            jsPDF: { unit: 'mm', format: [70, 50], orientation: 'landscape' }
        };

        html2pdf().set(opt).from(tagEl).save().then(() => {
            document.body.removeChild(tagEl);
            store.showToast('تم تحميل ملصق الـ QR بنجاح ✅', 'success');
        }).catch(err => {
            console.error(err);
            document.body.removeChild(tagEl);
            store.showToast('حدث خطأ أثناء تصدير الملصق', 'error');
        });
    },
    async printAllCards(students, template) {
        const store = Alpine.store('apex');
        const filtered = store.getFilteredCards();
        if (filtered.length === 0) {
            store.showToast('لا يوجد طلاب ضمن التصفية لطباعة كارنيهاتهم', 'warning');
            return;
        }

        store.showToast('جاري إنشاء وتحضير الكارنيهات للطباعة المجمعة في ملف واحد...', 'info');

        const container = document.createElement('div');
        container.style.width = '85mm';
        container.style.background = '#ffffff';

        filtered.forEach((s, idx) => {
            const card = document.createElement('div');
            card.style.width = '85mm';
            card.style.height = '55mm';
            card.style.position = 'relative';
            card.style.borderRadius = '6mm';
            card.style.overflow = 'hidden';
            card.style.padding = '4mm';
            card.style.boxSizing = 'border-box';
            card.style.background = template ? `url(${template})` : 'linear-gradient(135deg, #4f46e5, #0ea5e9)';
            card.style.backgroundSize = 'cover';
            card.style.backgroundPosition = 'center';
            card.style.color = 'white';
            card.style.direction = 'rtl';
            card.style.fontFamily = "'Cairo', sans-serif";
            if (idx < filtered.length - 1) {
                card.style.pageBreakAfter = 'always';
            }

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: start; height: 100%;">
                    <div style="text-align: right; color: white;">
                        <h5 style="margin: 0; font-size: 11px; font-weight: 800; line-height: 1.2; color: white;">${s.name}</h5>
                        <p style="margin: 2px 0 0 0; font-size: 8px; opacity: 0.9; color: white;">${s.year}</p>
                        <p style="margin: 1px 0 0 0; font-size: 8px; opacity: 0.9; font-weight: bold; color: white;">${s.group}</p>
                        <p style="margin: 1px 0 0 0; font-size: 7px; opacity: 0.8; color: white;">هاتف: ${s.phone || '-'}</p>
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                        ${s.image ? `<img src="${s.image}" style="width: 32px; height: 32px; border-radius: 4px; object-fit: cover; border: 1.5px solid white;">` : `<div style="width: 32px; height: 32px; border-radius: 4px; border: 1.5px dashed rgba(255,255,255,0.4); background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.8);"><i class="fa-solid fa-user" style="font-size: 12px;"></i></div>`}
                        <div class="card-qr-container" style="background: white; padding: 2px; border-radius: 2px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;"></div>
                    </div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: end; font-size: 8px; font-family: monospace; opacity: 0.9; font-weight: bold; color: white;">
                    <span>${s.code}</span>
                    <span>أكاديمية أبيكس التعليمية</span>
                </div>
            `;
            container.appendChild(card);

            const qrBox = card.querySelector('.card-qr-container');
            if (typeof QRCode !== 'undefined') {
                new QRCode(qrBox, {
                    text: s.code,
                    width: 28,
                    height: 28,
                    correctLevel: QRCode.CorrectLevel.H
                });
            }
        });

        document.body.appendChild(container);

        await new Promise(resolve => setTimeout(resolve, 500));

        const opt = {
            margin: 0,
            filename: 'Cards.pdf',
            image: { type: 'jpeg', quality: 1.0 },
            html2canvas: { scale: 3.5, useCORS: true, allowTaint: true },
            jsPDF: { unit: 'mm', format: [85.6, 54], orientation: 'landscape' },
            pagebreak: { mode: 'css' }
        };

        html2pdf().set(opt).from(container).save().then(() => {
            const ids = filtered.map(s => s.id);
            store.markAsPrinted(ids);
            document.body.removeChild(container);
            store.showToast('تمت طباعة وحفظ الكارنيهات مجمعة في ملف واحد', 'success');
        }).catch(err => {
            console.error(err);
            document.body.removeChild(container);
            store.showToast('فشل تصدير الكارنيهات المجمعة', 'error');
        });
    }
};