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
window.ToastManager = ToastManager;