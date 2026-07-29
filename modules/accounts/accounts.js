function accountsModule() {
    return {
        payments: [],
        paymentForm: { student: '', amount: '' },
        initAccounts() {
            this.payments = JSON.parse(localStorage.getItem('apex_payments')) || [];
        },
        collectPayment() {
            if (!this.paymentForm.student || !this.paymentForm.amount) return;
            let students = JSON.parse(localStorage.getItem('apex_students')) || [];
            let student = students.find(s => s.code === this.paymentForm.student || s.name.includes(this.paymentForm.student));
            
            const newPayment = {
                id: Date.now(),
                date: new Date().toLocaleString('ar-EG'),
                code: student ? student.code : 'EXT',
                name: student ? student.name : this.paymentForm.student,
                amount: this.paymentForm.amount
            };
            
            this.payments.unshift(newPayment);
            localStorage.setItem('apex_payments', JSON.stringify(this.payments));
            alert('تم تحصيل الرسوم بنجاح');
            this.paymentForm = { student: '', amount: '' };
        }
    }
}