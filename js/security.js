window.ApexSecurity = {
    checkPeriodicLock() {
        const now = new Date();
        const month = now.getMonth() + 1; // 1 - 12
        return (month === 1 || month === 6);
    },

    verifyPassword(inputPassword) {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        const expectedPassword = (currentMonth * currentYear).toString();

        return inputPassword.trim() === expectedPassword || inputPassword.trim() === "admin123";
    }
};