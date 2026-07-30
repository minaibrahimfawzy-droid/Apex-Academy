class AuthHandler {
    static isUnlocked() {
        return localStorage.getItem(window.STORAGE_KEYS.SESSION) === 'true';
    }

    static verify(input, correctPassword) {
        if (String(input).trim() === String(correctPassword).trim()) {
            localStorage.setItem(window.STORAGE_KEYS.SESSION, 'true');
            return true;
        }
        return false;
    }

    static lock() {
        localStorage.removeItem(window.STORAGE_KEYS.SESSION);
    }
}
window.AuthHandler = AuthHandler;