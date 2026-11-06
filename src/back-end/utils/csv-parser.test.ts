import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  parseCountriesCsv,
  parseCsvRows,
  parseGenresCsv,
  parseMoviesCsv,
} from './csv-parser';

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

  describe('parseMoviesCsv', () => {
    const fullHeader =
      'id,title,original_title,original_language,overview,release_date,popularity,vote_average,vote_count,poster_path,backdrop_path,runtime_minutes,budget,revenue,collected_at,genre_ids,production_country_codes';

    it('parses a valid CSV file with full fields and associations from file', () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'movies-csv-test-'));
      const filePath = join(tempDir, 'movies.csv');
      const csvContent = `${fullHeader}\n550,Fight Club,Fight Club,en,"A ticking-time-bomb insomniac...",1999-10-15,61.4,8.4,26000,/poster.jpg,/backdrop.jpg,139,63000000,100000000,2026-11-06T12:00:00.000Z,18;53,US;DE`;

      writeFileSync(filePath, csvContent, 'utf-8');

      try {
        const movies = parseMoviesCsv(filePath);
        expect(movies).toHaveLength(1);
        expect(movies[0]).toEqual({
          id: 550,
          title: 'Fight Club',
          original_title: 'Fight Club',
          original_language: 'en',
          overview: 'A ticking-time-bomb insomniac...',
          release_date: '1999-10-15',
          popularity: 61.4,
          vote_average: 8.4,
          vote_count: 26000,
          poster_path: '/poster.jpg',
          backdrop_path: '/backdrop.jpg',
          runtime_minutes: 139,
          budget: 63000000,
          revenue: 100000000,
          collected_at: '2026-11-06T12:00:00.000Z',
          genre_ids: [18, 53],
          production_country_codes: ['US', 'DE'],
        });
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('parses minimal CSV with only required headers and null/empty optional fields', () => {
      const minimalHeader =
        'id,title,original_title,original_language,overview';
      const content = `${minimalHeader}\n10,Title,Original,fr,"Overview"`;
      const movies = parseMoviesCsv(content, true);

      expect(movies).toHaveLength(1);
      expect(movies[0].id).toBe(10);
      expect(movies[0].title).toBe('Title');
      expect(movies[0].release_date).toBeNull();
      expect(movies[0].popularity).toBeNull();
      expect(movies[0].vote_average).toBeNull();
      expect(movies[0].vote_count).toBeNull();
      expect(movies[0].poster_path).toBeNull();
      expect(movies[0].backdrop_path).toBeNull();
      expect(movies[0].runtime_minutes).toBeNull();
      expect(movies[0].budget).toBeNull();
      expect(movies[0].revenue).toBeNull();
      expect(movies[0].collected_at).toBe('2026-11-06T12:00:00.000Z');
      expect(movies[0].genre_ids).toEqual([]);
      expect(movies[0].production_country_codes).toEqual([]);
    });

    it('returns empty array when CSV contains only headers', () => {
      expect(
        parseMoviesCsv(
          'id,title,original_title,original_language,overview\n',
          true,
        ),
      ).toEqual([]);
    });

    it('throws error when CSV is empty', () => {
      expect(() => parseMoviesCsv('', true)).toThrow(/file is empty/);
    });

    it('throws error when required headers are missing', () => {
      expect(() => parseMoviesCsv('id,title,overview\n1,A,B', true)).toThrow(
        /missing required column 'original_title'/,
      );
    });

    it('throws error when row columns count does not match header count', () => {
      expect(() =>
        parseMoviesCsv(
          'id,title,original_title,original_language,overview\n1,A,B,fr',
          true,
        ),
      ).toThrow(/expected 5 columns/);
    });

    it('throws error when id is invalid or exceeds safe integer', () => {
      const header = 'id,title,original_title,original_language,overview';
      expect(() => parseMoviesCsv(`${header}\n0,A,B,fr,O`, true)).toThrow(
        /id must be a positive integer/,
      );
      expect(() => parseMoviesCsv(`${header}\n-5,A,B,fr,O`, true)).toThrow(
        /id must be a positive integer/,
      );
      expect(() => parseMoviesCsv(`${header}\nabc,A,B,fr,O`, true)).toThrow(
        /id must be a positive integer/,
      );
      expect(() =>
        parseMoviesCsv(`${header}\n999999999999999999999,A,B,fr,O`, true),
      ).toThrow(/id exceeds safe integer limit/);
    });

    it('throws error when title, original_title or original_language is empty', () => {
      const header = 'id,title,original_title,original_language,overview';
      expect(() => parseMoviesCsv(`${header}\n1,   ,B,fr,O`, true)).toThrow(
        /title must be non-empty/,
      );
      expect(() => parseMoviesCsv(`${header}\n1,A,   ,fr,O`, true)).toThrow(
        /original_title must be non-empty/,
      );
      expect(() => parseMoviesCsv(`${header}\n1,A,B,   ,O`, true)).toThrow(
        /original_language must be non-empty/,
      );
    });

    it('throws error when popularity, vote_average or vote_count are invalid', () => {
      expect(() =>
        parseMoviesCsv(
          `${fullHeader}\n1,A,B,fr,O,2020-01-01,-1,5,10,/p,/b,100,10,20,2026-11-06T12:00:00.000Z,,`,
          true,
        ),
      ).toThrow(/Invalid popularity/);
      expect(() =>
        parseMoviesCsv(
          `${fullHeader}\n1,A,B,fr,O,2020-01-01,abc,5,10,/p,/b,100,10,20,2026-11-06T12:00:00.000Z,,`,
          true,
        ),
      ).toThrow(/Invalid popularity/);

      expect(() =>
        parseMoviesCsv(
          `${fullHeader}\n1,A,B,fr,O,2020-01-01,5,-0.5,10,/p,/b,100,10,20,2026-11-06T12:00:00.000Z,,`,
          true,
        ),
      ).toThrow(/Invalid vote_average/);
      expect(() =>
        parseMoviesCsv(
          `${fullHeader}\n1,A,B,fr,O,2020-01-01,5,10.5,10,/p,/b,100,10,20,2026-11-06T12:00:00.000Z,,`,
          true,
        ),
      ).toThrow(/Invalid vote_average/);
      expect(() =>
        parseMoviesCsv(
          `${fullHeader}\n1,A,B,fr,O,2020-01-01,5,bad,10,/p,/b,100,10,20,2026-11-06T12:00:00.000Z,,`,
          true,
        ),
      ).toThrow(/Invalid vote_average/);

      expect(() =>
        parseMoviesCsv(
          `${fullHeader}\n1,A,B,fr,O,2020-01-01,5,5,-10,/p,/b,100,10,20,2026-11-06T12:00:00.000Z,,`,
          true,
        ),
      ).toThrow(/Invalid vote_count/);
      expect(() =>
        parseMoviesCsv(
          `${fullHeader}\n1,A,B,fr,O,2020-01-01,5,5,10.5,/p,/b,100,10,20,2026-11-06T12:00:00.000Z,,`,
          true,
        ),
      ).toThrow(/Invalid vote_count/);
      expect(() =>
        parseMoviesCsv(
          `${fullHeader}\n1,A,B,fr,O,2020-01-01,5,5,999999999999999999999,/p,/b,100,10,20,2026-11-06T12:00:00.000Z,,`,
          true,
        ),
      ).toThrow(/Invalid vote_count/);
    });

    it('throws error when runtime_minutes, budget or revenue are invalid', () => {
      expect(() =>
        parseMoviesCsv(
          `${fullHeader}\n1,A,B,fr,O,2020-01-01,5,5,10,/p,/b,0,10,20,2026-11-06T12:00:00.000Z,,`,
          true,
        ),
      ).toThrow(/Invalid runtime_minutes/);
      expect(() =>
        parseMoviesCsv(
          `${fullHeader}\n1,A,B,fr,O,2020-01-01,5,5,10,/p,/b,999999999999999999999,10,20,2026-11-06T12:00:00.000Z,,`,
          true,
        ),
      ).toThrow(/Invalid runtime_minutes/);

      expect(() =>
        parseMoviesCsv(
          `${fullHeader}\n1,A,B,fr,O,2020-01-01,5,5,10,/p,/b,100,0,20,2026-11-06T12:00:00.000Z,,`,
          true,
        ),
      ).toThrow(/Invalid budget/);
      expect(() =>
        parseMoviesCsv(
          `${fullHeader}\n1,A,B,fr,O,2020-01-01,5,5,10,/p,/b,100,999999999999999999999,20,2026-11-06T12:00:00.000Z,,`,
          true,
        ),
      ).toThrow(/Invalid budget/);

      expect(() =>
        parseMoviesCsv(
          `${fullHeader}\n1,A,B,fr,O,2020-01-01,5,5,10,/p,/b,100,10,0,2026-11-06T12:00:00.000Z,,`,
          true,
        ),
      ).toThrow(/Invalid revenue/);
      expect(() =>
        parseMoviesCsv(
          `${fullHeader}\n1,A,B,fr,O,2020-01-01,5,5,10,/p,/b,100,10,999999999999999999999,2026-11-06T12:00:00.000Z,,`,
          true,
        ),
      ).toThrow(/Invalid revenue/);
    });

    it('throws error when genre_ids or country_codes are invalid', () => {
      expect(() =>
        parseMoviesCsv(
          `${fullHeader}\n1,A,B,fr,O,2020-01-01,5,5,10,/p,/b,100,10,20,2026-11-06T12:00:00.000Z,bad;12,US`,
          true,
        ),
      ).toThrow(/Invalid genre_id 'bad'/);

      expect(() =>
        parseMoviesCsv(
          `${fullHeader}\n1,A,B,fr,O,2020-01-01,5,5,10,/p,/b,100,10,20,2026-11-06T12:00:00.000Z,12,usa`,
          true,
        ),
      ).toThrow(/Invalid country code 'usa'/);
    });
  });
});
