// api/_files.cjs — სერვერზე Excel ფაილის აწყობა (ExcelJS)
const ExcelJS = require('exceljs');

async function buildXlsxBuffer(sheets) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'DNG Solutions';
  wb.created = new Date();

  for (const s of sheets) {
    const headers = (s.headers || []).map((h) => String(h));
    const ws = wb.addWorksheet(String(s.name || 'Sheet').slice(0, 31));
    ws.addRow(headers);

    const head = ws.getRow(1);
    head.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    head.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
    head.alignment = { vertical: 'middle', horizontal: 'center' };
    ws.views = [{ state: 'frozen', ySplit: 1 }];

    for (const r of s.rows || []) {
      ws.addRow(r.map((v) => (typeof v === 'number' ? v : String(v ?? ''))));
    }

    headers.forEach((h, i) => {
      let max = h.length;
      for (const r of s.rows || []) max = Math.max(max, String(r[i] ?? '').length);
      ws.getColumn(i + 1).width = Math.min(max + 2, 40);
    });
  }

  if (wb.worksheets.length === 0) wb.addWorksheet('Sheet1');
  return Buffer.from(await wb.xlsx.writeBuffer());
}

module.exports = { buildXlsxBuffer };