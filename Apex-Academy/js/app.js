async function loadModule(moduleName) {
    const container = document.getElementById('module-container');
    if (!container) return;

    try {
        // استخدام المسار النسبي ./modules/
        const response = await fetch(`./modules/${moduleName}.html`);
        if (!response.ok) throw new Error('Module not found');
        
        const html = await response.text();
        container.innerHTML = html;
        
        // إعادة تهيئة Alpine.js للمكونات الديناميكية إن وجدت
        if (window.Alpine) {
            Alpine.initTree(container);
        }
    } catch (error) {
        console.error('Error loading module:', error);
        container.innerHTML = `<div class="p-4 bg-red-50 text-red-600 rounded-xl">عذراً، تعذر تحميل القسم (${moduleName}). تأكد من وجود الملف في مجلد modules.</div>`;
    }
}