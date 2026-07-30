/**
 * helpers.js - الدوال المساعدة المشتركة
 */
import { STUDENT_CODE_PREFIX, STUDENT_CODE_PADDING, STUDENT_CODE_START, QR_DELAY } from './constants.js';

// ===========================
// QR Code
// ===========================

/**
 * توليد QR Code داخل عنصر HTML
 * @param {string} containerId - معرّف العنصر
 * @param {string} code - النص المراد تحويله
 * @param {number} [width=80] - العرض
 * @param {number} [height=80] - الارتفاع
 */
export function generateQR(containerId, code, width = 80, height = 80) {
    setTimeout(() => {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        try {
            new QRCode(container, { text: code, width, height });
        } catch (e) {
            console.error('QR generation error:', e);
        }
    }, QR_DELAY);
}

// ===========================
// كود الطالب
// ===========================

/**
 * توليد الكود التسلسلي التالي للطالب
 * @param {Array} students - مصفوفة الطلاب
 * @returns {string}
 */
export function generateNextStudentCode(students) {
    const maxNum = students.reduce((max, s) => {
        const m = s.code ? s.code.match(/APEX-(\d+)/) : null;
        if (m) {
            const n = parseInt(m[1], 10);
            return n > max ? n : max;
        }
        return max;
    }, STUDENT_CODE_START);

    return STUDENT_CODE_PREFIX + String(maxNum + 1).padStart(STUDENT_CODE_PADDING, '0');
}

// ===========================
// CSV
// ===========================

/**
 * تصدير البيانات كملف CSV مع دعم العربية
 * @param {Array} data - صفوف البيانات
 * @param {string} filename - اسم الملف
 * @param {Array<string>} headers - رؤوس الأعمدة
 */
export function exportToCSV(data, filename, headers) {
    let csv = '\uFEFF' + headers.join(',') + '\n';

    csv += data.map(row =>
        row.map(val => {
            let s = String(val ?? '').replace(/"/g, '""');
            return (s.includes(',') || s.includes('\n')) ? `"${s}"` : s;
        }).join(',')
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
}

// ===========================
// طباعة
// ===========================

/**
 * طباعة جدول في نافذة جديدة
 * @param {string} title - عنوان التقرير
 * @param {Array<string>} headers - رؤوس الجدول
 * @param {Array<Array>} rows - صفوف البيانات
 */
export function printTable(title, headers, rows) {
    const win = window.open('', '_blank');
    if (!win) return;

    const thCells  = headers.map(h => `<th style="padding:10px;border:1px solid #cbd5e1;">${h}</th>`).join('');
    const trCells  = rows.map(row =>
        `<tr>${row.map(c => `<td style="padding:10px;border:1px solid #e2e8f0;">${c}</td>`).join('')}</tr>`
    ).join('');

    win.document.write(`<!DOCTYPE html><html><head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet">
        <style>
            body{font-family:'Cairo',sans-serif;padding:20px;direction:rtl;}
            h1{text-align:center;color:#1e293b;font-size:20px;}
            table{width:100%;border-collapse:collapse;margin-top:20px;direction:rtl;text-align:right;}
            thead tr{background:#f1f5f9;border-bottom:2px solid #cbd5e1;}
            .footer{text-align:center;margin-top:30px;font-size:11px;color:#64748b;}
        </style>
    </head><body>
        <h1>أكاديمية أبيكس - ${title}</h1>
        <table><thead><tr>${thCells}</tr></thead><tbody>${trCells}</tbody></table>
        <div class="footer">تم التوليد بواسطة نظام أبيكس لإدارة السنتر التعليمي - v115</div>
        <script>window.onload=function(){window.print();setTimeout(function(){window.close();},500);};<\/script>
    </body></html>`);
    win.document.close();
}

// ===========================
// تحميل الملفات
// ===========================

/**
 * تحميل Blob كملف
 * @param {Blob} blob
 * @param {string} filename
 */
export function downloadBlob(blob, filename) {
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href  = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * تحميل نص كملف JSON
 * @param {string} content - محتوى JSON
 * @param {string} filename - اسم الملف
 */
export function downloadJSON(content, filename) {
    const blob = new Blob([content], { type: 'application/json;charset=utf-8;' });
    downloadBlob(blob, filename);
}

// ===========================
// التاريخ والوقت
// ===========================

/**
 * تاريخ اليوم بالعربية
 * @returns {string}
 */
export function todayAr() {
    return new Date().toLocaleDateString('ar-EG');
}

/**
 * وقت الآن بالعربية (ساعة:دقيقة)
 * @returns {string}
 */
export function nowTimeAr() {
    return new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
}

// ===========================
// Debounce
// ===========================

/**
 * تأخير تنفيذ الدالة
 * @param {Function} fn
 * @param {number} [delay=300]
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

// ===========================
// تنسيق العملة
// ===========================

/**
 * تنسيق المبلغ بالجنيه المصري
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
    return `${Number(amount).toLocaleString('ar-EG')} ج.م`;
}

// ===========================
// ID عشوائي
// ===========================

/**
 * توليد ID فريد بناءً على الوقت
 * @returns {number}
 */
export function generateId() {
    return Date.now();
}
