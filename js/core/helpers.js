class Helpers {
    static formatCurrency(val) {
        return Number(val || 0).toLocaleString('ar-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).replace('EGP', 'ج.م');
    }

    static getLocalDate() {
        const date = new Date();
        return date.toLocaleDateString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit' });
    }

    static getLocalTime() {
        const date = new Date();
        return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    static generateID() {
        return Date.now() + Math.floor(Math.random() * 1000);
    }

    static generateStudentCode(yearName) {
        const cleanYear = String(yearName || "STUD").replace(/\s+/g, '').substring(0, 4).toUpperCase();
        const rand = Math.floor(1000 + Math.random() * 9000);
        return `${cleanYear}-${rand}`;
    }

    static exportCSV(data, filename, headers) {
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
        csvContent += headers.join(",") + "\n";
        data.forEach(row => {
            csvContent += row.map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(",") + "\n";
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${filename}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    static printTable(title, headers, rows) {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        const headerCells = headers.map(h => `<th style="padding:12px; border:1px solid #cbd5e1; background-color:#f1f5f9; font-weight:700;">${h}</th>`).join('');
        const rowCells = rows.map(r => `
            <tr style="border-bottom: 1px solid #e2e8f0;">
                ${r.map(cell => `<td style="padding:10px; border:1px solid #cbd5e1; text-align:right;">${cell}</td>`).join('')}
            </tr>
        `).join('');

        printWindow.document.write(`
            <html dir="rtl" lang="ar">
            <head>
                <title>${title}</title>
                <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet">
                <style>
                    body { font-family: 'Cairo', sans-serif; padding: 20px; color: #1e293b; background: #fff; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
                    h2 { text-align: center; font-size: 18px; margin-bottom: 10px; }
                </style>
            </head>
            <body onload="window.print(); window.close();">
                <h2>${title}</h2>
                <p style="text-align:center; font-size:11px; color:#64748b;">تاريخ التوليد: ${Helpers.getLocalDate()} ${Helpers.getLocalTime()}</p>
                <table>
                    <thead><tr>${headerCells}</tr></thead>
                    <tbody>${rowCells}</tbody>
                </table>
            </body>
            </html>
        `);
        printWindow.document.close();
    }
}
window.Helpers = Helpers;