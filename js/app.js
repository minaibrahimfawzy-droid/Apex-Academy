/**
 * Apex Academy - Main Application Script
 * نظام إدارة الأكاديمية الذكي
 */

// دالة تحميل الأقسام (الموديولات)
async function loadModule(moduleName) {
    const container = document.getElementById('module-container') || 
                      document.getElementById('content') || 
                      document.getElementById('app');
    
    if (!container) {
        console.error('لم يتم العثور على عنصر التغليف الرئيسي (module-container)!');
        return;
    }

    if (!moduleName) return;

    // تنظيف اسم الموديول وتحويله لحروف صغيرة
    const cleanModuleName = moduleName.toLowerCase().trim();

    // قائمة بالمسارات المحتملة للقسم لمراعاة تركيبة المجلدات المختلفة
    const possibleUrls = [
        `./modules/${cleanModuleName}/${cleanModuleName}.html`,
        `./modules/${cleanModuleName}/index.html`,
        `./modules/${cleanModuleName}.html`
    ];

    // 1. إظهار مؤشر التحميل
    container.innerHTML = `
        <div class="flex items-center justify-center min-h-[300px] dir-rtl">
            <div class="text-center p-6">
                <div class="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p class="text-gray-600 font-medium">جاري تحميل قسم (${cleanModuleName})...</p>
            </div>
        </div>
    `;

    let htmlContent = null;
    let successfulUrl = '';
    let lastError = null;

    // 2. تجربة المسارات المحتملة واحداً تلو الآخر حتى العثور على الملف
    for (const url of possibleUrls) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                htmlContent = await response.text();
                successfulUrl = url;
                break; // تم العثور على الملف بنجاح
            }
        } catch (err) {
            lastError = err;
        }
    }

    // 3. معالجة وتثبيت المحتوى
    if (htmlContent !== null) {
        container.innerHTML = htmlContent;

        // إعادة تفعيل مكتبة Alpine.js للتفاعل والمكونات إن وجد
        if (window.Alpine) {
            window.Alpine.initTree(container);
        }

        // التمرير لأعلى الصفحة تلقائياً
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        console.error('Module load error:', lastError);

        // 4. عرض كارت خطأ تفصيلي موضح فيه المسارات المرفوضة في حال عدم العثور على الملف
        container.innerHTML = `
            <div class="p-6 m-4 bg-red-50 border border-red-300 rounded-2xl shadow-sm text-right dir-rtl max-w-2xl mx-auto">
                <div class="flex items-center space-x-3 space-x-reverse text-red-600 mb-2">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h3 class="font-bold text-lg">تعذر تحميل القسم (${cleanModuleName})</h3>
                </div>
                <p class="text-red-700 text-sm leading-relaxed mb-4">
                    لم يتم العثور على ملف هذا القسم في المجلدات المرفوعة. تأكد من أسماء الملفات داخل مجلدات الأقسام على GitHub.
                </p>
                <div class="bg-white p-3 rounded-lg border border-red-200 text-xs font-mono text-gray-700 dir-ltr text-left overflow-x-auto">
                    Searched Paths:<br>
                    ${possibleUrls.map(u => `- ${u}`).join('<br>')}
                </div>
            </div>
        `;
    }
}

// ربط الدالة بـ window لتكون متاحة لجميع الأزرار (onclick="loadModule('students')")
window.loadModule = loadModule;

// تشغيل القسم الرئيسي الافتراضي عند فتح التطبيق
document.addEventListener('DOMContentLoaded', () => {
    console.log('Apex Academy app loaded successfully.');

    // يمكنك تغيير 'dashboard' إلى اسم القسم الأول لديك (مثل: dashboard أو home أو students)
    const defaultModule = 'dashboard';
    
    const container = document.getElementById('module-container') || 
                      document.getElementById('content') || 
                      document.getElementById('app');
                      
    if (container && (!container.children || container.children.length === 0)) {
        loadModule(defaultModule);
    }
});