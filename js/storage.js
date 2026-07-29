window.ApexStorage = {
    get(key, defaultValue = []) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error("Storage Reading Error [" + key + "]:", e);
            return defaultValue;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error("Storage Writing Error [" + key + "]:", e);
            return false;
        }
    },

    remove(key) {
        localStorage.removeItem(key);
    }
};