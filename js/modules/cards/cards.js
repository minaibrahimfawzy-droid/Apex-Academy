/**
 * cards/cards.js - الكارنيهات وطباعتها
 */
import { generateQR } from '../../core/helpers.js';
import { saveCardTemplate } from '../../core/storage.js';
import { QR_CARD, QR_PRINT, CARD_PDF_OPTIONS } from '../../core/constants.js';

/**
 * رفع قالب كارنيه من ملف صورة
 * @param {object} store
 * @param {File} file
 * @returns {Promise<boolean>}
 */
export function uploadCardTemplate(store, file) {
    return new Promise((resolve) => {
        if (!file) return resolve(false);
        const reader = new FileReader();
        reader.onload = (e) => {
            store.cardTemplate = e.target.result;
            saveCardTemplate(store.cardTemplate);
            resolve(true);
        };
        reader.onerror = () => resolve(false);
        reader.readAsDataURL(file);
    });
}

/**
 * توليد QR للبطاقة
 * @param {string} code - كود الطالب
 */
export function generateCardQR(code) {
    generateQR('qrcode-card-box', code, QR_CARD.width, QR_CARD.height);
}

/**
 * تحميل كارنيه واحد كـ PDF
 * @param {object} student - بيانات الطالب
 */
export function downloadSingleCard(student) {
    if (!student) return;
    const element = document.getElementById('card-preview-area');
    if (!element) return;

    const opt = {
        ...CARD_PDF_OPTIONS,
        filename: `Card_${student.code}.pdf`,
    };

    if (typeof html2pdf === 'undefined') {
        console.error('html2pdf غير محمّل');
        return;
    }
    html2pdf().from(element).set(opt).save();
}

/**
 * بناء HTML لكارنيه طالب واحد للطباعة الجماعية
 * @param {object} st - بيانات الطالب
 * @param {string} cardTemplate - صورة القالب أو فارغ
 * @returns {string}
 */
function buildCardHtml(st, cardTemplate) {
    const bg = cardTemplate
        ? `url(${cardTemplate}) center/cover no-repeat`
        : 'linear-gradient(135deg, #4f46e5, #0ea5e9)';
    const textColor = cardTemplate ? '#333' : '#fff';

    return `
    <div class="card-item" style="width:85mm;height:55mm;border:1px solid #ddd;border-radius:12px;
         position:relative;margin:10px;display:inline-flex;flex-direction:column;
         justify-content:space-between;background:${bg};color:${textColor};
         font-family:'Cairo',sans-serif;direction:rtl;box-sizing:border-box;padding:15px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div>
          <h4 style="margin:0 0 4px 0;font-size:14px;font-weight:800;">${st.name}</h4>
          <p style="margin:0;font-size:10px;opacity:.9;">${st.year}</p>
          <p style="margin:2px 0 0 0;font-size:10px;opacity:.9;font-weight:bold;">${st.group}</p>
          <p style="margin:4px 0 0 0;font-size:9px;opacity:.8;">الهاتف: ${st.phone || '-'}</p>
        </div>
        <div style="text-align:center;">
          <img src="${st.image || 'https://via.placeholder.com/50'}"
               style="width:50px;height:50px;border-radius:8px;object-fit:cover;border:2px solid #fff;margin-bottom:4px;" />
          <div id="print-qr-${st.id}" style="background:white;padding:2px;border-radius:4px;display:inline-block;"></div>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:flex-end;font-size:9px;opacity:.9;font-family:monospace;">
        <span style="font-weight:bold;">${st.code}</span>
        <span>أكاديمية أبيكس التعليمية</span>
      </div>
    </div>`;
}

/**
 * طباعة جميع الكارنيهات في نافذة جديدة
 * @param {Array} students
 * @param {string} cardTemplate
 */
export function printAllCards(students, cardTemplate) {
    if (!students || students.length === 0) return;

    const win = window.open('', '_blank');
    if (!win) return;

    const cardsHtml = students.map(st => buildCardHtml(st, cardTemplate)).join('');
    const qrScripts = students.map(st =>
        `try{new QRCode(document.getElementById('print-qr-${st.id}'),{text:'${st.code}',width:40,height:40});}catch(e){}`
    ).join('\n');

    win.document.write(`<!DOCTYPE html><html><head>
    <meta charset="UTF-8">
    <title>طباعة الكارنيهات - أكاديمية أبيكس v115</title>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;800&display=swap" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
    <style>
        body{font-family:'Cairo',sans-serif;margin:0;padding:15px;text-align:center;background:#fff;}
        .card-item{page-break-inside:avoid;}
        @media print{body{padding:0;}}
    </style>
    </head><body>
    <div style="display:flex;flex-wrap:wrap;justify-content:center;">${cardsHtml}</div>
    <script>
        window.onload = function() {
            setTimeout(function(){
                ${qrScripts}
                setTimeout(function(){
                    window.print();
                    setTimeout(function(){window.close();},1000);
                }, 600);
            }, 400);
        };
    <\/script>
    </body></html>`);
    win.document.close();
}
