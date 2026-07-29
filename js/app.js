/**
 * Apex Academy - Main Application Script
 * نظام إدارة الأكاديمية الذكي
 */

// دالة تحميل الأقسام (الموديولات)
async function loadModule(moduleName) {
    // العثور على العنصر المستهدف لاراض الأقسام
    const container = document.getElementById('module-container') || 
                      document.getElementById('content') || 
                      document.getElementById('app');
    
    if (!container) {
        console.error('لم يتم العثور على عنصر التغليف الرئيسي (module-container)!');
        return;
    }

    if (!moduleName) return;

    // تنظيف اسم الموديول وتحويله لحروف صغيرة لمنع مشاكل الحروف الكبيرة والصغيرة على GitHub
    const cleanModuleName = moduleName.toLowerCase().trim();
    const targetUrl = `./modules/${cleanModuleName}.html`;

    // 1. إظهار مؤشر التحميل
    container.innerHTML = `
        <div class="flex items-center justify-center min-h-[300px] dir-rtl">
            <div class="text-center p-6">
                <div class="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p class="text-gray-600 font-medium">جاري تحميل قسم (${cleanModuleName})...</p>
            </div>
        </div>
    `;

    try {
        // 2. طلب ملف القسم من السيرفر
        const response = await fetch(targetUrl);

        if (!response.ok) {
            throw new Error(`تعذر فتح الملف (رمز الخطأ: ${response.status} ${response.statusText}).\nتأكد من وجود الملف باسم "${cleanModuleName}.html" بحروف صغيرة داخل مجلد modules على GitHub.`);
        }

        const html = await response.text();
        container.innerHTML = html;

        // 3. إعادة تفعيل مكتبة Alpine.js إذا كانت مستخدمة في المشهد
        if (window.Alpine) {
            window.Alpine.initTree(container);
        }

        // التمرير لأعلى الصفحة عند الانتقال لقسم جديد
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
        console.error('Module load error:', error);

        // 4. عرض رسالة خطأ تفصيلية على الشاشة لمعرفة السبب بدقة
        container.innerHTML = `
            <div class="p-6 m-4 bg-red-50 border border-red-300 rounded-2xl shadow-sm text-right dir-rtl max-w-2xl mx-auto">
                <div class="flex items-center space-x-3 space-x-reverse text-red-600 mb-2">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h3 class="font-bold text-lg">تعذر تحميل القسم (${cleanModuleName})</h3>
                </div>
                <p class="text-red-700 text-sm whitespace-pre-line leading-relaxed mb-4">${error.message}</p>
                <div class="bg-white p-3 rounded-lg border border-red-200 text-xs font-mono text-gray-700 dir-ltr text-left overflow-x-auto">
                    Target Path: ${targetUrl}
                </div>
            </div>
        `;
    }
}

// ربط الدالة بـ window لتكون متاحة لجميع أزرار الـ HTML (onclick="loadModule('...')")
window.loadModule = loadModule;

// تشغيل الكود تلقائياً عند فتح الصفحة
document.addEventListener('DOMContentLoaded', () => {
    console.log('Apex Academy app loaded successfully.');

    // يمكنك تغيير 'home' إلى اسم القسم الأول الرئيسي لديك (مثل: home أو dashboard أو students)
    const defaultModule = 'home';
    
    const container = document.getElementById('module-container') || 
                      document.getElementById('content') || 
                      document.getElementById('app');
                      
    if (container && (!container.children || container.children.length === 0)) {
        loadModule(defaultModule);
    }
});