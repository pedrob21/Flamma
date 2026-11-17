/**
 * FLAMMA — Integração do sorteio com o Google Sheets
 *
 * Cole este código em Extensões > Apps Script da planilha
 * e publique como App da Web (veja README.md).
 */

const SHEET_NAME = 'Inscrições';
const HEADERS = ['Data/Hora', 'Nome completo', 'WhatsApp', 'Instagram', 'Aceite'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const p = (e && e.parameter) || {};
    const nome = clean(p.nome, 120);
    const whatsapp = clean(p.whatsapp, 20);
    const instagram = clean(p.instagram, 32);
    const digits = whatsapp.replace(/\D/g, '');

    if (!nome || digits.length < 10 || instagram.length < 2 || p.aceite !== 'sim') {
      return json({ ok: false, error: 'Dados inválidos' });
    }

    const sheet = getSheet();
    const last = sheet.getLastRow();
    if (last > 1) {
      const existing = sheet.getRange(2, 3, last - 1, 1).getValues()
        .map(function (r) { return String(r[0]).replace(/\D/g, ''); });
      if (existing.indexOf(digits) !== -1) return json({ ok: true, duplicate: true });
    }

    sheet.appendRow([new Date(), nome, whatsapp, instagram, 'Sim']);
    return json({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

/** Permite testar abrindo a URL no navegador. */
function doGet() {
  return json({ ok: true, message: 'FLAMMA sorteio online' });
}

/**
 * Sorteia um vencedor entre as inscrições.
 * Rode pelo editor do Apps Script (selecione "sortear" e clique em Executar)
 * ou pelo menu "FLAMMA" que aparece na planilha.
 */
function sortear() {
  const sheet = getSheet();
  const last = sheet.getLastRow();
  if (last < 2) {
    SpreadsheetApp.getUi().alert('Ainda não há inscrições.');
    return;
  }
  const rows = sheet.getRange(2, 1, last - 1, HEADERS.length).getValues();
  const idx = Math.floor(Math.random() * rows.length);
  const w = rows[idx];
  const msg = 'Vencedor(a): ' + w[1] + '\nWhatsApp: ' + w[2] + '\nInstagram: ' + w[3] +
              '\n\n(' + rows.length + ' participantes — linha ' + (idx + 2) + ')';
  sheet.getRange(idx + 2, 1, 1, HEADERS.length).setBackground('#ffd6f6');
  Logger.log(msg);
  try { SpreadsheetApp.getUi().alert('🔥 Sorteio FLAMMA', msg, SpreadsheetApp.getUi().ButtonSet.OK); } catch (err) {}
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu('FLAMMA').addItem('Sortear vencedor', 'sortear').addToUi();
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#fc06d8').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
    sheet.getRange('C:C').setNumberFormat('@');
  }
  return sheet;
}

/** Remove espaços extras e impede que o texto vire fórmula na planilha. */
function clean(v, max) {
  let s = String(v || '').trim().slice(0, max);
  if (/^[=+\-@]/.test(s) && !/^@[a-z0-9._]+$/i.test(s)) s = "'" + s;
  return s;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
