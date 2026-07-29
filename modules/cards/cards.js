function cardsModule() {
    return {
        students: [],
        selectedStudentId: '',
        selectedStudent: null,

        initCards() {
            this.students = ApexStorage.get(ApexConfig.storageKeys.students, []);
        },

        generateCard() {
            this.selectedStudent = this.students.find(s => s.id === this.selectedStudentId) || null;
            if (this.selectedStudent) {
                this.$nextTick(() => {
                    const qrContainer = document.getElementById('qrcode-container');
                    if (qrContainer) {
                        qrContainer.innerHTML = '';
                        new QRCode(qrContainer, {
                            text: this.selectedStudent.code || this.selectedStudent.id,
                            width: 50,
                            height: 50
                        });
                    }
                });
            }
        },

        printCard() {
            window.print();
        }
    };
}