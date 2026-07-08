import { readFileSync } from 'node:fs';

/** Minimal RFC-style CSV parse (quoted fields, commas in values). */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n' || (char === '\r' && next === '\n')) {
      row.push(field);
      field = '';
      if (row.some((cell) => String(cell).trim() !== '')) {
        rows.push(row);
      }
      row = [];
      if (char === '\r') i += 1;
    } else if (char !== '\r') {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((cell) => String(cell).trim() !== '')) {
      rows.push(row);
    }
  }

  return rows;
}

export function readCsvAsSheetValues(path) {
  return parseCsv(readFileSync(path, 'utf8'));
}

/** `_Settings.csv` key,value rows → map. */
export function readSettingsCsv(path) {
  const rows = readCsvAsSheetValues(path);
  const settings = {};
  for (let i = 1; i < rows.length; i += 1) {
    const [key, ...rest] = rows[i];
    if (!key?.trim()) continue;
    settings[key.trim()] = rest.join(',').trim();
  }
  return settings;
}
