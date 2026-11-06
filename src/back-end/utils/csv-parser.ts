import { readFileSync } from 'node:fs';
import type { Country, DbMovie, Genre } from '../types/MoviesTypes';

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

/**
 * Parses and validates a CSV file containing movies.
 * Requires at least 'id', 'title', 'original_title', 'original_language', and 'overview' headers (case-insensitive).
 * Supports optional columns: 'release_date', 'popularity', 'vote_average', 'vote_count',
 * 'poster_path', 'backdrop_path', 'runtime_minutes', 'budget', 'revenue', 'collected_at',
 * 'genre_ids', 'production_country_codes'.
 * Empty lines are ignored; a file with only headers returns an empty array.
 * @param filePathOrContent The file path or raw CSV content string.
 * @param isContent Whether the first argument is raw CSV content instead of a file path.
 * @returns An array of validated DbMovie objects.
 */
export function parseMoviesCsv(
  filePathOrContent: string,
  isContent = false,
): DbMovie[] {
  const content = isContent
    ? filePathOrContent
    : readFileSync(filePathOrContent, 'utf-8');
  const rows = parseCsvRows(content);

  if (rows.length === 0) {
    throw new Error('Invalid CSV: file is empty');
  }

  const headerRow = rows[0].map((h) => h.toLowerCase());
  const requiredHeaders = [
    'id',
    'title',
    'original_title',
    'original_language',
    'overview',
  ];

  for (const required of requiredHeaders) {
    if (!headerRow.includes(required)) {
      throw new Error(
        `Invalid CSV headers: missing required column '${required}', received ${rows[0].join(', ')}`,
      );
    }
  }

  const idIndex = headerRow.indexOf('id');
  const titleIndex = headerRow.indexOf('title');
  const originalTitleIndex = headerRow.indexOf('original_title');
  const originalLanguageIndex = headerRow.indexOf('original_language');
  const overviewIndex = headerRow.indexOf('overview');
  const releaseDateIndex = headerRow.indexOf('release_date');
  const popularityIndex = headerRow.indexOf('popularity');
  const voteAverageIndex = headerRow.indexOf('vote_average');
  const voteCountIndex = headerRow.indexOf('vote_count');
  const posterPathIndex = headerRow.indexOf('poster_path');
  const backdropPathIndex = headerRow.indexOf('backdrop_path');
  const runtimeMinutesIndex = headerRow.indexOf('runtime_minutes');
  const budgetIndex = headerRow.indexOf('budget');
  const revenueIndex = headerRow.indexOf('revenue');
  const collectedAtIndex = headerRow.indexOf('collected_at');
  const genreIdsIndex = headerRow.indexOf('genre_ids');
  const productionCountryCodesIndex = headerRow.indexOf(
    'production_country_codes',
  );

  const movies: DbMovie[] = [];
  const countryCodeRegex = /^[A-Z]{2}$/;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length !== headerRow.length) {
      throw new Error(
        `Invalid CSV line ${i + 1}: expected ${headerRow.length} columns, received ${row.length}`,
      );
    }

    const rawId = row[idIndex].trim();
    if (!/^[1-9]\d*$/.test(rawId)) {
      throw new Error(
        `Invalid movie id at line ${i + 1}: id must be a positive integer, received '${rawId}'`,
      );
    }
    const id = Number(rawId);
    if (!Number.isSafeInteger(id)) {
      throw new Error(
        `Invalid movie id at line ${i + 1}: id exceeds safe integer limit, received '${rawId}'`,
      );
    }

    const title = row[titleIndex].trim();
    if (title.length === 0) {
      throw new Error(
        `Invalid movie title at line ${i + 1}: title must be non-empty`,
      );
    }

    const originalTitle = row[originalTitleIndex].trim();
    if (originalTitle.length === 0) {
      throw new Error(
        `Invalid original title at line ${i + 1}: original_title must be non-empty`,
      );
    }

    const originalLanguage = row[originalLanguageIndex].trim();
    if (originalLanguage.length === 0) {
      throw new Error(
        `Invalid original language at line ${i + 1}: original_language must be non-empty`,
      );
    }

    const overview = row[overviewIndex];

    const releaseDate =
      releaseDateIndex !== -1 && row[releaseDateIndex].trim().length > 0
        ? row[releaseDateIndex].trim()
        : null;

    let popularity: number | null = null;
    if (popularityIndex !== -1 && row[popularityIndex].trim().length > 0) {
      const val = Number(row[popularityIndex].trim());
      if (Number.isNaN(val) || val < 0) {
        throw new Error(
          `Invalid popularity at line ${i + 1}: must be a non-negative number, received '${row[popularityIndex].trim()}'`,
        );
      }
      popularity = val;
    }

    let voteAverage: number | null = null;
    if (voteAverageIndex !== -1 && row[voteAverageIndex].trim().length > 0) {
      const val = Number(row[voteAverageIndex].trim());
      if (Number.isNaN(val) || val < 0 || val > 10) {
        throw new Error(
          `Invalid vote_average at line ${i + 1}: must be a number between 0 and 10, received '${row[voteAverageIndex].trim()}'`,
        );
      }
      voteAverage = val;
    }

    let voteCount: number | null = null;
    if (voteCountIndex !== -1 && row[voteCountIndex].trim().length > 0) {
      const val = Number(row[voteCountIndex].trim());
      if (
        !/^\d+$/.test(row[voteCountIndex].trim()) ||
        !Number.isSafeInteger(val)
      ) {
        throw new Error(
          `Invalid vote_count at line ${i + 1}: must be a non-negative integer, received '${row[voteCountIndex].trim()}'`,
        );
      }
      voteCount = val;
    }

    const posterPath =
      posterPathIndex !== -1 && row[posterPathIndex].trim().length > 0
        ? row[posterPathIndex].trim()
        : null;

    const backdropPath =
      backdropPathIndex !== -1 && row[backdropPathIndex].trim().length > 0
        ? row[backdropPathIndex].trim()
        : null;

    let runtimeMinutes: number | null = null;
    if (
      runtimeMinutesIndex !== -1 &&
      row[runtimeMinutesIndex].trim().length > 0
    ) {
      const val = Number(row[runtimeMinutesIndex].trim());
      if (
        !/^[1-9]\d*$/.test(row[runtimeMinutesIndex].trim()) ||
        !Number.isSafeInteger(val)
      ) {
        throw new Error(
          `Invalid runtime_minutes at line ${i + 1}: must be a positive integer, received '${row[runtimeMinutesIndex].trim()}'`,
        );
      }
      runtimeMinutes = val;
    }

    let budget: number | null = null;
    if (budgetIndex !== -1 && row[budgetIndex].trim().length > 0) {
      const val = Number(row[budgetIndex].trim());
      if (
        !/^[1-9]\d*$/.test(row[budgetIndex].trim()) ||
        !Number.isSafeInteger(val)
      ) {
        throw new Error(
          `Invalid budget at line ${i + 1}: must be a positive integer, received '${row[budgetIndex].trim()}'`,
        );
      }
      budget = val;
    }

    let revenue: number | null = null;
    if (revenueIndex !== -1 && row[revenueIndex].trim().length > 0) {
      const val = Number(row[revenueIndex].trim());
      if (
        !/^[1-9]\d*$/.test(row[revenueIndex].trim()) ||
        !Number.isSafeInteger(val)
      ) {
        throw new Error(
          `Invalid revenue at line ${i + 1}: must be a positive integer, received '${row[revenueIndex].trim()}'`,
        );
      }
      revenue = val;
    }

    const collectedAt =
      collectedAtIndex !== -1 && row[collectedAtIndex].trim().length > 0
        ? row[collectedAtIndex].trim()
        : '2026-11-06T12:00:00.000Z';

    const genreIds: number[] = [];
    if (genreIdsIndex !== -1 && row[genreIdsIndex].trim().length > 0) {
      const items = row[genreIdsIndex]
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      for (const item of items) {
        if (!/^[1-9]\d*$/.test(item)) {
          throw new Error(
            `Invalid genre_id '${item}' at line ${i + 1}: must be a positive integer`,
          );
        }
        genreIds.push(Number(item));
      }
    }

    const productionCountryCodes: string[] = [];
    if (
      productionCountryCodesIndex !== -1 &&
      row[productionCountryCodesIndex].trim().length > 0
    ) {
      const items = row[productionCountryCodesIndex]
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      for (const item of items) {
        if (!countryCodeRegex.test(item)) {
          throw new Error(
            `Invalid country code '${item}' at line ${i + 1}: must be exactly 2 uppercase letters`,
          );
        }
        productionCountryCodes.push(item);
      }
    }

    movies.push({
      id,
      title,
      original_title: originalTitle,
      original_language: originalLanguage,
      overview,
      release_date: releaseDate,
      popularity,
      vote_average: voteAverage,
      vote_count: voteCount,
      poster_path: posterPath,
      backdrop_path: backdropPath,
      runtime_minutes: runtimeMinutes,
      budget,
      revenue,
      collected_at: collectedAt,
      genre_ids: genreIds,
      production_country_codes: productionCountryCodes,
    });
  }

  return movies;
}
