window.ApexUI = {
    showToast(message, type = 'success') {
        if (window.AlpineStore) {
            window.AlpineStore.addToast(message, type);
        }
    }
};