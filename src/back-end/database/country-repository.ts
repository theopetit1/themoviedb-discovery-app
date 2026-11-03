import { DatabaseSync } from 'node:sqlite';
import type { Country } from '../types/MoviesTypes.ts';

/**
 * Retrieves a country by its code.
 * @param database The SQLite database instance.
 * @param code The country code to look for.
 * @returns The matching Country object, or undefined if not found.
 */
export function getCountryByCode(
  database: DatabaseSync,
  code: string,
): Country | undefined {
  const statement = database.prepare(
    'SELECT code, name FROM countries WHERE code = ?;',
  );
  const row = statement.get(code) as Country | undefined;
  return row ?? undefined;
}

/**
 * Lists all countries ordered by code in ascending order.
 * @param database The SQLite database instance.
 * @returns An array of Country objects sorted by code ascending.
 */
export function listCountries(database: DatabaseSync): Country[] {
  const statement = database.prepare(
    'SELECT code, name FROM countries ORDER BY code ASC;',
  );
  return statement.all() as Country[];
}

/**
 * Inserts or updates an iterable collection of countries into the database.
 * If a country code already exists, its name is updated without creating duplicates.
 * If the same code appears multiple times in the iterable, the last name provided is preserved.
 * An empty iterable leaves the database unchanged.
 * Executes within a transaction for atomicity and data integrity.
 * @param database The SQLite database instance.
 * @param countries An iterable of Country objects.
 */
export function upsertCountries(
  database: DatabaseSync,
  countries: Iterable<Country>,
): void {
  database.exec('BEGIN TRANSACTION;');
  try {
    const statement = database.prepare(`
      INSERT INTO countries (code, name)
      VALUES (?, ?)
      ON CONFLICT(code) DO UPDATE SET name = excluded.name;
    `);

    for (const country of countries) {
      if (
        !country ||
        typeof country.code !== 'string' ||
        country.code.trim().length === 0 ||
        typeof country.name !== 'string' ||
        country.name.trim().length === 0
      ) {
        throw new Error(
          `Invalid country data: ${JSON.stringify(country)}. Code and non-empty name are required.`,
        );
      }
      statement.run(country.code.trim(), country.name.trim());
    }

    database.exec('COMMIT;');
  } catch (error) {
    database.exec('ROLLBACK;');
    throw error;
  }
}

/**
 * Deletes all countries that are not associated with any movie in the production_countries table.
 * Executes within a transaction for atomicity and data integrity.
 * @param database The SQLite database instance.
 * @returns The number of unused countries deleted.
 */
export function cleanUnusedCountries(database: DatabaseSync): number {
  database.exec('BEGIN TRANSACTION;');
  try {
    const result = database
      .prepare(
        'DELETE FROM countries WHERE code NOT IN (SELECT DISTINCT country_code FROM production_countries);',
      )
      .run();
    database.exec('COMMIT;');
    return Number(result.changes);
  } catch (error) {
    database.exec('ROLLBACK;');
    throw error;
  }
}
