import QRCode from 'qrcode'
import JsBarcode from 'jsbarcode'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

// Generate QR Code as Data URL
export async function generateQRCode(text, options = {}) {
  try {
    return await QRCode.toDataURL(text, {
      width: options.width || 200,
      margin: options.margin || 1,
      color: {
        dark: options.dark || '#000000',
        light: options.light || '#ffffff'
      },
      errorCorrectionLevel: options.errorCorrectionLevel || 'M'
    })
  } catch (error) {
    console.error('QR Code generation error:', error)
    throw error
  }
}

// Generate Barcode SVG
export function generateBarcode(code, format = 'EAN13') {
  try {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    JsBarcode(svg, code, {
      format,
      width: 1.4,
      height: 25,
      displayValue: true,
      fontSize: 12,
      margin: 0
    })
    return new XMLSerializer().serializeToString(svg)
  } catch (error) {
    console.error('Barcode generation error:', error)
    return ''
  }
}

// Print Mask Label
export async function printMaskLabel(mask) {
  const qrDataUrl = await generateQRCode(mask.serial, { width: 150 })
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @page { size: 58mm 40mm; margin: 0; }
        body { margin: 0; font-family: Arial, sans-serif; }
        .label {
          width: 58mm; height: 40mm;
          display: flex; border: 1px dashed #ddd;
          box-sizing: border-box; overflow: hidden;
        }
        .qr-section {
          width: 40mm; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
        }
        .qr-section img { width: 65px; height: 65px; }
        .serial { font-weight: 800; font-size: 16px; font-family: monospace; margin-top: 4px; }
        .info-section {
          width: 18mm; background: #000; color: #fff;
          display: flex; flex-direction: column; justify-content: center;
          align-items: center; writing-mode: vertical-rl; transform: rotate(180deg);
          font-weight: bold;
        }
        .model { font-size: 12px; }
        .size { font-size: 14px; margin-top: 2px; }
      </style>
    </head>
    <body>
      <div class="label">
        <div class="qr-section">
          <img src="${qrDataUrl}" alt="QR">
          <div class="serial">${mask.serial}</div>
        </div>
        <div class="info-section">
          <div class="model">${getModelDisplay(mask.model)}</div>
          <div class="size">${mask.size}</div>
        </div>
      </div>
      <script>setTimeout(() => window.print(), 500);</script>
    </body>
    </html>
  `
  
  const win = window.open('', '', 'width=400,height=400')
  win.document.write(html)
  win.document.close()
}

// Print Spool Label
export async function printSpoolLabel(spool, eanCode) {
  const qrDataUrl = await generateQRCode(String(spool.globalSeq), { width: 180 })
  const barcodeSvg = eanCode ? generateBarcode(eanCode) : ''
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @page { size: 58mm 40mm; margin: 0; }
        body { margin: 0; font-family: Arial, sans-serif; }
        .label {
          width: 58mm; height: 40mm;
          display: flex; flex-direction: column;
          justify-content: center; align-items: center;
          border: 1px dashed #ddd; box-sizing: border-box;
          padding: 2px;
        }
        .qr-section {
          display: flex; flex-direction: column;
          align-items: center; margin-bottom: 0;
        }
        .qr-section img { width: 80px; height: 80px; }
        .serial { font-weight: 800; font-size: 14px; font-family: monospace; margin-top: 2px; }
        .barcode-section { margin-top: 2px; }
        .barcode-section svg { max-width: 100%; height: auto; }
      </style>
    </head>
    <body>
      <div class="label">
        <div class="qr-section">
          <img src="${qrDataUrl}" alt="QR">
          <div class="serial">${spool.serial}</div>
        </div>
        ${barcodeSvg ? `<div class="barcode-section">${barcodeSvg}</div>` : ''}
      </div>
      <script>setTimeout(() => window.print(), 500);</script>
    </body>
    </html>
  `
  
  const win = window.open('', '', 'width=400,height=400')
  win.document.write(html)
  win.document.close()
}

// Print Spool Passport
export async function printSpoolPassport(spool, monthNames) {
  const monthName = monthNames[(spool.month || 1) - 1]
  const dateStr = `${monthName} ${spool.year || new Date().getFullYear()}`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @page { size: 58mm 40mm; margin: 0; }
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
        .label {
          width: 58mm; height: 40mm; padding: 2mm 3mm;
          box-sizing: border-box; display: flex;
          flex-direction: column; justify-content: space-between;
          text-align: center;
        }
        .header { font-weight: bold; font-size: 11pt; line-height: 1.1; margin-bottom: 2mm; }
        .main-info { text-align: left; font-size: 9pt; line-height: 1.3; margin-bottom: 2mm; }
        .row { display: block; }
        .label-text { font-weight: normal; }
        .value { font-weight: bold; padding-left: 3px; }
        .manufacturer { text-align: left; font-size: 8pt; line-height: 1.2; }
        .man-label { font-weight: normal; }
        .man-value { font-weight: bold; }
        .footer { font-size: 7pt; font-weight: bold; margin-top: auto; }
      </style>
    </head>
    <body>
      <div class="label">
        <div class="header">Катушка-сматыватель<br>«Малевич»</div>
        <div class="main-info">
          <div class="row">
            <span class="label-text">Серийный номер:</span>
            <span class="value">${spool.serial}</span>
          </div>
          <div class="row">
            <span class="label-text">Дата изготовления:</span>
            <span class="value">${dateStr}</span>
          </div>
        </div>
        <div class="manufacturer">
          <div class="man-label">Производитель:</div>
          <div class="man-value">ООО «Юпитер»</div>
        </div>
        <div class="footer">Сделано в России</div>
      </div>
      <script>setTimeout(() => window.print(), 500);</script>
    </body>
    </html>
  `
  
  const win = window.open('', '', 'width=400,height=400')
  win.document.write(html)
  win.document.close()
}

// Print Shipment List
export function printShipmentList(items, title = 'Упаковочный лист') {
  const itemsHtml = items.map((item, index) => `
    <tr>
      <td>${index + 1}</td>
      <td><strong>${item.serial}</strong></td>
      <td>${item.model || item.wireType || '-'}</td>
      <td>${item.size || '-'}</td>
      <td>${item.lining || item.spoolModel || '-'}</td>
      <td>${item.month}.${item.year}</td>
    </tr>
  `).join('')
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: sans-serif; padding: 20px; color: #333; }
        .header {
          margin-bottom: 20px; border-bottom: 2px solid #333;
          padding-bottom: 10px; display: flex;
          justify-content: space-between; align-items: flex-end;
        }
        table {
          width: 100%; border-collapse: collapse;
          margin-top: 20px; font-size: 14px;
        }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th {
          background-color: #f8f9fa; font-weight: bold;
          text-transform: uppercase; font-size: 12px;
        }
        tr:nth-child(even) { background-color: #f9f9f9; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h2>${title}</h2>
          <div>ООО "Юпитер"</div>
        </div>
        <div style="text-align:right;">
          <div><strong>Дата:</strong> ${new Date().toLocaleDateString('ru-RU')}</div>
          <div><strong>Всего позиций:</strong> ${items.length}</div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width: 40px;">№</th>
            <th>Серийный номер</th>
            <th>Тип/Модель</th>
            <th>Размер</th>
            <th>Спец.</th>
            <th>Дата</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <script>setTimeout(() => window.print(), 500);</script>
    </body>
    </html>
  `
  
  const win = window.open('', '', 'width=800,height=600')
  win.document.write(html)
  win.document.close()
}

// Helper
function getModelDisplay(model) {
  const map = {
    'Рапира': 'FOIL',
    'Шпага': 'EPEE',
    'Сабля': 'SABRE',
    'Тренер': 'COACH'
  }
  return map[model] || model
}

