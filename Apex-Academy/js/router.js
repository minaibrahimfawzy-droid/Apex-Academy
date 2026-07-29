window.ApexRouter = {
    routes: {
        'dashboard': 'modules/dashboard/dashboard.html',
        'students': 'modules/students/students.html',
        'teachers': 'modules/teachers/teachers.html',
        'attendance': 'modules/attendance/attendance.html',
        'subscriptions': 'modules/subscriptions/subscriptions.html',
        'finance': 'modules/finance/finance.html',
        'reports': 'modules/reports/reports.html',
        'cards': 'modules/cards/cards.html',
        'qr': 'modules/qr/qr.html',
        'settings': 'modules/settings/settings.html',
        'backup': 'modules/backup/backup.html'
    },

    loadedAssets: new Set(),

    async loadRoute(routeId) {
        const contentContainer = document.getElementById('app-content');
        if (!contentContainer) return;

        const htmlPath = this.routes[routeId];
        if (!htmlPath) {
            contentContainer.innerHTML = '<div class="p-8 text-center text-rose-500 font-bold">القسم غير موجود</div>';
            return;
        }

        try {
            // Fetch HTML content
            const response = await fetch(htmlPath);
            if (!response.ok) throw new Error("تعذر تحميل الصفحة");
            const htmlContent = await response.text();

            // Inject HTML content into view
            contentContainer.innerHTML = htmlContent;

            // Dynamically load Module CSS if exists
            const cssPath = `modules/${routeId}/${routeId}.css`;
            this.loadCSS(cssPath);

            // Dynamically load Module JS if exists
            const jsPath = `modules/${routeId}/${routeId}.js`;
            await this.loadJS(jsPath);

            // Re-trigger Alpine initialization on injected dynamic content
            if (window.Alpine) {
                window.Alpine.discoverUninitializedComponents((el) => {
                    window.Alpine.initializeElements(el);
                });
            }
        } catch (error) {
            console.error("Router Error:", error);
            contentContainer.innerHTML = `<div class="p-8 text-center text-rose-500 font-bold">خطأ في تحميل القسم: ${error.message}</div>`;
        }
    },

    loadCSS(href) {
        if (this.loadedAssets.has(href)) return;
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
        this.loadedAssets.add(href);
    },

    loadJS(src) {
        return new Promise((resolve) => {
            if (this.loadedAssets.has(src)) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                this.loadedAssets.add(src);
                resolve();
            };
            script.onerror = () => resolve(); // Ignore failure if file doesn't exist
            document.body.appendChild(script);
        });
    }
};