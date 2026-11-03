import { readFileSync } from 'node:fs';
import type { Country, Genre } from '../types/MoviesTypes';

/**
 * Parses raw CSV text into an array of tokenized rows.
 * Complies with RFC 4180: handles CRLF, LF, UTF-8 BOM, quoted fields with commas and escaped quotes.
 * Ignores empty lines.
 * @param content The raw CSV string to parse.
 * @returns An array of string arrays representing rows and columns.
 */
export function parseCsvRows(content: string): string[][] {
  const cleanContent = content.startsWith('\uFEFF')
    ? content.slice(1)
    : content;

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;

  while (i < cleanContent.length) {
    const char = cleanContent[i];

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < cleanContent.length && cleanContent[i + 1] === '"') {
          currentField += '"';
          i += 2;
          continue;
        } else {
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        currentField += char;
        i++;
        continue;
      }
    } else {
      if (char === '"') {
        if (currentField.length > 0) {
          throw new Error(
            'Invalid CSV syntax: unexpected quote in unquoted field',
          );
        }
        inQuotes = true;
        i++;
        continue;
      } else if (char === ',') {
        currentRow.push(currentField.trim());
        currentField = '';
        i++;
        continue;
      } else if (char === '\r' || char === '\n') {
        if (
          char === '\r' &&
          i + 1 < cleanContent.length &&
          cleanContent[i + 1] === '\n'
        ) {
          i++;
        }
        currentRow.push(currentField.trim());
        currentField = '';
        if (currentRow.some((field) => field.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        i++;
        continue;
      } else {
        currentField += char;
        i++;
        continue;
      }
    }
  }

  if (inQuotes) {
    throw new Error('Invalid CSV syntax: unclosed quoted field');
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((field) => field.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Parses and validates a CSV file containing genres.
 * Requires exactly 'id' and 'name' headers (case-insensitive, any order).
 * @param filePathOrContent The file path or raw CSV content string.
 * @param isContent Whether the first argument is raw CSV content instead of a file path.
 * @returns An array of validated Genre objects.
 */
export function parseGenresCsv(
  filePathOrContent: string,
  isContent = false,
): Genre[] {
  const content = isContent
    ? filePathOrContent
    : readFileSync(filePathOrContent, 'utf-8');
  const rows = parseCsvRows(content);

  if (rows.length === 0) {
    throw new Error('Invalid CSV: file is empty');
  }

  const headerRow = rows[0].map((h) => h.toLowerCase());
  if (headerRow.length !== 2) {
    throw new Error(
      `Invalid CSV headers: expected exactly 'id' and 'name', received ${rows[0].join(', ')}`,
    );
  }

  const idIndex = headerRow.indexOf('id');
  const nameIndex = headerRow.indexOf('name');

  if (idIndex === -1 || nameIndex === -1) {
    throw new Error(
      `Invalid CSV headers: expected 'id' and 'name', received ${rows[0].join(', ')}`,
    );
  }

  const genres: Genre[] = [];
  for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    if (row.length !== 2) {
      throw new Error(
        `Invalid CSV line ${rowIndex + 1}: expected 2 columns, received ${row.length}`,
      );
    }

    const rawId = row[idIndex];
    const rawName = row[nameIndex];

    if (!/^[1-9]\d*$/.test(rawId)) {
      throw new Error(
        `Invalid CSV line ${rowIndex + 1}: id must be a positive integer, received '${rawId}'`,
      );
    }

    const id = Number(rawId);
    if (!Number.isSafeInteger(id)) {
      throw new Error(
        `Invalid CSV line ${rowIndex + 1}: id exceeds safe integer limit, received '${rawId}'`,
      );
    }

    if (!rawName || rawName.trim() === '') {
      throw new Error(
        `Invalid CSV line ${rowIndex + 1}: name must be non-empty`,
      );
    }

    genres.push({ id, name: rawName.trim() });
  }

  return genres;
}

/**
 * Parses and validates a CSV file containing countries.
 * Requires exactly 'code' and 'name' headers (case-insensitive, any order).
 * Country code must be exactly two uppercase letters (e.g. 'FR', 'US').
 * Name must be non-empty.
 * Empty lines are ignored; a file with only headers returns an empty array.
 * @param filePathOrContent The file path or raw CSV content string.
 * @param isContent Whether the first argument is raw CSV content instead of a file path.
 * @returns An array of validated Country objects.
 */
export function parseCountriesCsv(
  filePathOrContent: string,
  isContent = false,
): Country[] {
  const content = isContent
    ? filePathOrContent
    : readFileSync(filePathOrContent, 'utf-8');
  const rows = parseCsvRows(content);

  if (rows.length === 0) {
    throw new Error('Invalid CSV: file is empty');
  }

  const headerRow = rows[0].map((h) => h.toLowerCase());
  if (headerRow.length !== 2) {
    throw new Error(
      `Invalid CSV headers: expected exactly 'code' and 'name', received ${rows[0].join(', ')}`,
    );
  }

  const codeIndex = headerRow.indexOf('code');
  const nameIndex = headerRow.indexOf('name');

  if (codeIndex === -1 || nameIndex === -1) {
    throw new Error(
      `Invalid CSV headers: missing required columns 'code' or 'name', received ${rows[0].join(', ')}`,
    );
  }

  const countries: Country[] = [];
  const codeRegex = /^[A-Z]{2}$/;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length !== 2) {
      throw new Error(
        `Invalid CSV line ${i + 1}: expected 2 columns, received ${row.length}`,
      );
    }

    const code = row[codeIndex].trim();
    const name = row[nameIndex].trim();

    if (!codeRegex.test(code)) {
      throw new Error(
        `Invalid country code at line ${i + 1}: '${code}'. Country code must be exactly 2 uppercase letters.`,
      );
    }

    if (name.length === 0) {
      throw new Error(
        `Invalid country name at line ${i + 1}: name must be non-empty`,
      );
    }

    countries.push({ code, name });
  }

  return countries;
}
