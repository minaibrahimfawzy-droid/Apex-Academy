class PaymentHandler {
    static save(db, paymentData) {
        const newPayment = {
            id: window.Helpers.generateID(),
            date: window.Helpers.getLocalDate(),
            time: window.Helpers.getLocalTime(),
            ...paymentData
        };
        db.payments.push(newPayment);

        const student = db.students.find(s => s.id === Number(paymentData.studentId));
        db.logs.push({
            action: "تحصيل اشتراك",
            detail: `تم سداد مبلغ ${paymentData.amount} ج.م للطالب ${student ? student.name : 'مجهول'}`,
            time: window.Helpers.getLocalTime()
        });

        return newPayment;
    }
}
window.PaymentHandler = PaymentHandler;