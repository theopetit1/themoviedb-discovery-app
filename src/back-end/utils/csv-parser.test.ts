import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseCountriesCsv, parseCsvRows, parseGenresCsv } from './csv-parser';

describe('csv-parser.ts', () => {
  describe('parseCsvRows', () => {
    it('parses standard LF and CRLF lines', () => {
      const csv = 'id,name\n1,Action\r\n2,Drama\n';
      expect(parseCsvRows(csv)).toEqual([
        ['id', 'name'],
        ['1', 'Action'],
        ['2', 'Drama'],
      ]);
    });

    it('strips UTF-8 BOM and ignores empty lines', () => {
      const csv = '\uFEFFid,name\n\n1,Comédie\n\r\n\n';
      expect(parseCsvRows(csv)).toEqual([
        ['id', 'name'],
        ['1', 'Comédie'],
      ]);
    });

    it('parses quoted fields with commas and escaped quotes', () => {
      const csv = 'id,name\n1,"Film, Action"\n2,"He said ""Hello""!"\n';
      expect(parseCsvRows(csv)).toEqual([
        ['id', 'name'],
        ['1', 'Film, Action'],
        ['2', 'He said "Hello"!'],
      ]);
    });

    it('throws on unexpected quote inside unquoted field', () => {
      expect(() => parseCsvRows('id,na"me\n1,Action')).toThrow(
        /unexpected quote/,
      );
    });

    it('throws on unclosed quoted field', () => {
      expect(() => parseCsvRows('id,name\n1,"Action')).toThrow(/unclosed/);
    });

    it('ignores trailing whitespace-only fields without adding an empty row', () => {
      const csv = 'id,name\n1,Action\n   ,   ';
      expect(parseCsvRows(csv)).toEqual([
        ['id', 'name'],
        ['1', 'Action'],
      ]);
    });
  });

  describe('parseGenresCsv', () => {
    it('reads CSV directly from a file path when isContent is false', () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'csv-test-'));
      const filePath = join(tempDir, 'genres.csv');
      writeFileSync(filePath, 'id,name\n28,Action\n', 'utf-8');
      try {
        const genres = parseGenresCsv(filePath);
        expect(genres).toEqual([{ id: 28, name: 'Action' }]);
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('parses valid CSV content with id and name', () => {
      const csv = 'id,name\n12,Aventure\n18,Drame\n';
      const genres = parseGenresCsv(csv, true);
      expect(genres).toEqual([
        { id: 12, name: 'Aventure' },
        { id: 18, name: 'Drame' },
      ]);
    });

    it('accepts headers in inverted order and different case', () => {
      const csv = 'NAME,ID\nComédie,35\nAction,28\n';
      const genres = parseGenresCsv(csv, true);
      expect(genres).toEqual([
        { id: 35, name: 'Comédie' },
        { id: 28, name: 'Action' },
      ]);
    });

    it('throws error when file is empty', () => {
      expect(() => parseGenresCsv('\n\n', true)).toThrow(/empty/);
    });

    it('throws error when headers do not match id and name exactly', () => {
      expect(() => parseGenresCsv('id,title\n1,Test', true)).toThrow(
        /expected 'id' and 'name'/,
      );
      expect(() => parseGenresCsv('id,name,extra\n1,Test,X', true)).toThrow(
        /expected exactly 'id' and 'name'/,
      );
    });

    it('throws error when row columns length is invalid', () => {
      expect(() => parseGenresCsv('id,name\n1,Action,Extra', true)).toThrow(
        /expected 2 columns/,
      );
    });

    it('throws error on non-positive or invalid integer id', () => {
      expect(() => parseGenresCsv('id,name\n0,Zero', true)).toThrow(
        /positive integer/,
      );
      expect(() => parseGenresCsv('id,name\n-1,Negative', true)).toThrow(
        /positive integer/,
      );
      expect(() => parseGenresCsv('id,name\nabc,String', true)).toThrow(
        /positive integer/,
      );
      expect(() => parseGenresCsv('id,name\n1.5,Float', true)).toThrow(
        /positive integer/,
      );
    });

    it('throws error when id exceeds safe integer limit', () => {
      const hugeId = '9007199254740999999999';
      expect(() => parseGenresCsv(`id,name\n${hugeId},Huge`, true)).toThrow(
        /safe integer limit/,
      );
    });

    it('throws error when name is empty or only whitespace', () => {
      expect(() => parseGenresCsv('id,name\n10,   ', true)).toThrow(
        /name must be non-empty/,
      );
    });
  });

  describe('parseCountriesCsv', () => {
    it('reads CSV directly from a file path when isContent is false', () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'countries-csv-test-'));
      const filePath = join(tempDir, 'countries.csv');
      writeFileSync(filePath, 'code,name\nFR,France\n', 'utf-8');
      try {
        const countries = parseCountriesCsv(filePath);
        expect(countries).toEqual([{ code: 'FR', name: 'France' }]);
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('parses valid CSV content with code and name in any order and case', () => {
      const csv = 'NAME,CODE\nFrance,FR\n"United States",US\n';
      const countries = parseCountriesCsv(csv, true);
      expect(countries).toEqual([
        { code: 'FR', name: 'France' },
        { code: 'US', name: 'United States' },
      ]);
    });

    it('returns an empty array when CSV only contains headers', () => {
      expect(parseCountriesCsv('code,name\n', true)).toEqual([]);
    });

    it('throws error when CSV is completely empty', () => {
      expect(() => parseCountriesCsv('', true)).toThrow(/file is empty/);
    });

    it('throws error when headers length is not 2', () => {
      expect(() =>
        parseCountriesCsv('code,name,extra\nFR,France,X', true),
      ).toThrow(/expected exactly 'code' and 'name'/);
    });

    it('throws error when code or name header is missing', () => {
      expect(() => parseCountriesCsv('iso,name\nFR,France', true)).toThrow(
        /missing required columns/,
      );
    });

    it('throws error when row columns length is invalid', () => {
      expect(() =>
        parseCountriesCsv('code,name\nFR,France,Extra', true),
      ).toThrow(/expected 2 columns/);
    });

    it('throws error when country code is not exactly 2 uppercase letters', () => {
      expect(() => parseCountriesCsv('code,name\nfr,France', true)).toThrow(
        /Country code must be exactly 2 uppercase letters/,
      );
      expect(() => parseCountriesCsv('code,name\nFRA,France', true)).toThrow(
        /Country code must be exactly 2 uppercase letters/,
      );
      expect(() => parseCountriesCsv('code,name\nF,France', true)).toThrow(
        /Country code must be exactly 2 uppercase letters/,
      );
      expect(() => parseCountriesCsv('code,name\nF1,France', true)).toThrow(
        /Country code must be exactly 2 uppercase letters/,
      );
    });

    it('throws error when name is empty or only whitespace', () => {
      expect(() => parseCountriesCsv('code,name\nFR,   ', true)).toThrow(
        /name must be non-empty/,
      );
    });
  });
});
