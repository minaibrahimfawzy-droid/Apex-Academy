function generateCardQR(code) {
    setTimeout(() => {
        const target = document.getElementById('qrcode-card-box');
        if (!target) return;
        target.innerHTML = '';
        new QRCode(target, {
            text: String(code),
            width: 75,
            height: 75
        });
    }, 100);
}

function downloadSingleCard(st) {
    if (!st) return;
    const element = document.getElementById('card-preview-area');
    const opt = {
        margin: 0,
        filename: 'Card_' + st.code + '.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 3, useCORS: true },
        jsPDF: { unit: 'mm', format: [85, 55], orientation: 'landscape' }
    };
    html2pdf().from(element).set(opt).save();
}

function printAllCards(students, cardTemplate) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    let cardsHtml = '';
    
    students.forEach(st => {
        cardsHtml += `
            <div class="card-item" style="width: 85mm; height: 55mm; border: 1px solid #ddd; border-radius: 12px; position: relative; margin: 10px; display: inline-flex; flex-direction: column; justify-content: space-between; background: ${cardTemplate ? `url(${cardTemplate})` : 'linear-gradient(135deg, #4f46e5, #0ea5e9)'}; color: ${cardTemplate ? '#333' : '#fff'}; font-family: 'Cairo', sans-serif; direction: rtl; box-sizing: border-box; padding: 15px; page-break-inside: avoid;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 800;">${st.name}</h4>
                        <p style="margin: 0; font-size: 10px; opacity: 0.9;">${st.year}</p>
                        <p style="margin: 2px 0 0 0; font-size: 10px; opacity: 0.9; font-weight: bold;">${st.group}</p>
                        <p style="margin: 4px 0 0 0; font-size: 9px; opacity: 0.8;">الهاتف: ${st.phone || '-'}</p>
                    </div>
                    <div style="text-align: center;">
                        <img src="${st.image || 'https://via.placeholder.com/50'}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover; border: 2px solid #fff; margin-bottom: 4px;" />
                        <div id="print-qr-${st.id}" style="background: white; padding: 2px; border-radius: 4px; display: inline-block;"></div>
                    </div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: flex-end; font-size: 9px; opacity: 0.9; font-family: monospace;">
                    <span style="font-weight: bold;">${st.code}</span>
                    <span>أكاديمية أبيكس التعليمية</span>
                </div>
            </div>
        `;
    });
    
    printWindow.document.write(`
        <html>
        <head>
            <title>طباعة الكارنيهات</title>
            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;800&display=swap" rel="stylesheet">
            <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
            <style>
                body { font-family: 'Cairo', sans-serif; margin: 0; padding: 15px; text-align: center; background: #fff; }
                .card-item { page-break-inside: avoid; }
                @media print { body { padding: 0; } }
            </style>
        </head>
        <body>
            <div style="display: flex; flex-wrap: wrap; justify-content: center;">
                ${cardsHtml}
            </div>
            <script>
                setTimeout(() => {
                    ${students.map(st => `try { new QRCode(document.getElementById('print-qr-${st.id}'), { text: '${st.code}', width: 40, height: 40 }); } catch(e) {}`).join('\n')}
                    window.print();
                    setTimeout(() => { window.close(); }, 1000);
                }, 800);
            <\/script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

window._apexCards = { printAllCards, generateCardQR, downloadSingleCard };