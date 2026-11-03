import { DatabaseSync } from 'node:sqlite';
import type { Genre } from '../types/MoviesTypes';

/**
 * Retrieves a genre by its unique identifier.
 * @param database The SQLite database instance.
 * @param id The unique identifier of the genre.
 * @returns The Genre entity if found, otherwise undefined.
 */
export function getGenreById(
  database: DatabaseSync,
  id: number,
): Genre | undefined {
  const row = database
    .prepare('SELECT id, name FROM genres WHERE id = ?')
    .get(id) as { id: number; name: string } | undefined;

  return row ? { id: Number(row.id), name: String(row.name) } : undefined;
}

/**
 * Lists all genres stored in the database, ordered by identifier ascending.
 * @param database The SQLite database instance.
 * @returns An array of genres sorted by id.
 */
export function listGenres(database: DatabaseSync): Genre[] {
  const rows = database
    .prepare('SELECT id, name FROM genres ORDER BY id ASC')
    .all() as Array<{ id: number; name: string }>;

  return rows.map((row) => ({
    id: Number(row.id),
    name: String(row.name),
  }));
}

/**
 * Inserts or updates an iterable of genres in a single transaction.
 * If a genre with the same identifier already exists, its name is updated.
 * If an identifier appears multiple times within the iterable, the last name is preserved.
 * An empty iterable leaves the database unchanged.
 * @param database The SQLite database instance.
 * @param genres An iterable collection of Genre entities.
 */
export function upsertGenres(
  database: DatabaseSync,
  genres: Iterable<Genre>,
): void {
  const statement = database.prepare(`
    INSERT INTO genres (id, name)
    VALUES (?, ?)
    ON CONFLICT(id) DO UPDATE SET name = excluded.name;
  `);

  database.exec('BEGIN TRANSACTION;');
  try {
    for (const genre of genres) {
      if (
        !genre ||
        typeof genre.id !== 'number' ||
        !Number.isInteger(genre.id) ||
        typeof genre.name !== 'string' ||
        genre.name.trim() === ''
      ) {
        throw new Error(
          'Invalid genre: id must be an integer and name must be a non-empty string',
        );
      }
      statement.run(genre.id, genre.name);
    }
    database.exec('COMMIT;');
  } catch (error) {
    database.exec('ROLLBACK;');
    throw error;
  }
}
