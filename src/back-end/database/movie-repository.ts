import { DatabaseSync } from 'node:sqlite';
import type { DbMovie } from '../types/MoviesTypes.ts';

/**
 * Retrieves a movie by its identifier along with its associated genres and production countries.
 * @param database The SQLite database instance.
 * @param id The movie identifier.
 * @returns The matching DbMovie object, or undefined if not found.
 */
export function getMovieById(
  database: DatabaseSync,
  id: number,
): DbMovie | undefined {
  const statement = database.prepare('SELECT * FROM movies WHERE id = ?;');
  const row = statement.get(id) as Record<string, unknown> | undefined;

  if (!row) {
    return undefined;
  }

  const genreStatement = database.prepare(
    'SELECT genre_id FROM movie_genres WHERE movie_id = ? ORDER BY genre_id ASC;',
  );
  const genreRows = genreStatement.all(id) as Array<{ genre_id: number }>;
  const genreIds = genreRows.map((g) => Number(g.genre_id));

  const countryStatement = database.prepare(
    'SELECT country_code FROM production_countries WHERE movie_id = ? ORDER BY country_code ASC;',
  );
  const countryRows = countryStatement.all(id) as Array<{
    country_code: string;
  }>;
  const countryCodes = countryRows.map((c) => String(c.country_code));

  return {
    id: Number(row.id),
    title: String(row.title),
    original_title: String(row.original_title),
    original_language: String(row.original_language),
    overview: String(row.overview),
    release_date: row.release_date != null ? String(row.release_date) : null,
    release_year: row.release_year != null ? Number(row.release_year) : null,
    popularity: row.popularity != null ? Number(row.popularity) : null,
    vote_average: row.vote_average != null ? Number(row.vote_average) : null,
    vote_count: row.vote_count != null ? Number(row.vote_count) : null,
    poster_path: row.poster_path != null ? String(row.poster_path) : null,
    backdrop_path: row.backdrop_path != null ? String(row.backdrop_path) : null,
    runtime_minutes:
      row.runtime_minutes != null ? Number(row.runtime_minutes) : null,
    budget: row.budget != null ? Number(row.budget) : null,
    revenue: row.revenue != null ? Number(row.revenue) : null,
    collected_at: String(row.collected_at),
    genre_ids: genreIds,
    production_country_codes: countryCodes,
  };
}

/**
 * Lists all movies ordered by identifier in ascending order.
 * @param database The SQLite database instance.
 * @returns An array of DbMovie objects sorted by id ascending.
 */
export function listMovies(database: DatabaseSync): DbMovie[] {
  const statement = database.prepare('SELECT * FROM movies ORDER BY id ASC;');
  const rows = statement.all() as Array<Record<string, unknown>>;

  const genreStatement = database.prepare(
    'SELECT genre_id FROM movie_genres WHERE movie_id = ? ORDER BY genre_id ASC;',
  );
  const countryStatement = database.prepare(
    'SELECT country_code FROM production_countries WHERE movie_id = ? ORDER BY country_code ASC;',
  );

  return rows.map((row) => {
    const movieId = Number(row.id);
    const genreRows = genreStatement.all(movieId) as Array<{
      genre_id: number;
    }>;
    const countryRows = countryStatement.all(movieId) as Array<{
      country_code: string;
    }>;

    return {
      id: movieId,
      title: String(row.title),
      original_title: String(row.original_title),
      original_language: String(row.original_language),
      overview: String(row.overview),
      release_date: row.release_date != null ? String(row.release_date) : null,
      release_year: row.release_year != null ? Number(row.release_year) : null,
      popularity: row.popularity != null ? Number(row.popularity) : null,
      vote_average: row.vote_average != null ? Number(row.vote_average) : null,
      vote_count: row.vote_count != null ? Number(row.vote_count) : null,
      poster_path: row.poster_path != null ? String(row.poster_path) : null,
      backdrop_path:
        row.backdrop_path != null ? String(row.backdrop_path) : null,
      runtime_minutes:
        row.runtime_minutes != null ? Number(row.runtime_minutes) : null,
      budget: row.budget != null ? Number(row.budget) : null,
      revenue: row.revenue != null ? Number(row.revenue) : null,
      collected_at: String(row.collected_at),
      genre_ids: genreRows.map((g) => Number(g.genre_id)),
      production_country_codes: countryRows.map((c) => String(c.country_code)),
    };
  });
}

/**
 * Inserts or updates an iterable collection of movies into the database.
 * If a movie id already exists, its information is updated without creating duplicates.
 * An empty iterable leaves the database unchanged.
 * Executes within a transaction for atomicity and data integrity.
 * @param database The SQLite database instance.
 * @param movies An iterable of DbMovie objects.
 */
export function upsertMovies(
  database: DatabaseSync,
  movies: Iterable<DbMovie>,
): void {
  database.exec('BEGIN TRANSACTION;');
  try {
    const upsertStatement = database.prepare(`
      INSERT INTO movies (
        id, title, original_title, original_language, overview,
        release_date, popularity, vote_average, vote_count,
        poster_path, backdrop_path, runtime_minutes, budget, revenue, collected_at
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?
      )
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        original_title = excluded.original_title,
        original_language = excluded.original_language,
        overview = excluded.overview,
        release_date = excluded.release_date,
        popularity = excluded.popularity,
        vote_average = excluded.vote_average,
        vote_count = excluded.vote_count,
        poster_path = excluded.poster_path,
        backdrop_path = excluded.backdrop_path,
        runtime_minutes = excluded.runtime_minutes,
        budget = excluded.budget,
        revenue = excluded.revenue,
        collected_at = excluded.collected_at;
    `);

    const deleteGenresStatement = database.prepare(
      'DELETE FROM movie_genres WHERE movie_id = ?;',
    );
    const insertGenreStatement = database.prepare(
      'INSERT OR IGNORE INTO movie_genres (movie_id, genre_id) VALUES (?, ?);',
    );

    const deleteCountriesStatement = database.prepare(
      'DELETE FROM production_countries WHERE movie_id = ?;',
    );
    const insertCountryStatement = database.prepare(
      'INSERT OR IGNORE INTO production_countries (movie_id, country_code) VALUES (?, ?);',
    );

    for (const movie of movies) {
      if (
        !movie ||
        typeof movie.id !== 'number' ||
        !Number.isInteger(movie.id) ||
        movie.id <= 0 ||
        typeof movie.title !== 'string' ||
        movie.title.trim().length === 0 ||
        typeof movie.original_title !== 'string' ||
        movie.original_title.trim().length === 0 ||
        typeof movie.original_language !== 'string' ||
        movie.original_language.trim().length === 0 ||
        typeof movie.overview !== 'string' ||
        typeof movie.collected_at !== 'string' ||
        movie.collected_at.trim().length === 0
      ) {
        throw new Error(
          `Invalid movie data: ${JSON.stringify(movie)}. Required fields: positive integer id, non-empty title, original_title, original_language, overview, and collected_at.`,
        );
      }

      if (
        movie.runtime_minutes != null &&
        (!Number.isInteger(movie.runtime_minutes) || movie.runtime_minutes <= 0)
      ) {
        throw new Error(
          `Invalid movie runtime_minutes: '${movie.runtime_minutes}'. Must be a positive integer or null.`,
        );
      }

      if (
        movie.budget != null &&
        (!Number.isInteger(movie.budget) || movie.budget <= 0)
      ) {
        throw new Error(
          `Invalid movie budget: '${movie.budget}'. Must be a positive integer or null.`,
        );
      }

      if (
        movie.revenue != null &&
        (!Number.isInteger(movie.revenue) || movie.revenue <= 0)
      ) {
        throw new Error(
          `Invalid movie revenue: '${movie.revenue}'. Must be a positive integer or null.`,
        );
      }

      upsertStatement.run(
        movie.id,
        movie.title.trim(),
        movie.original_title.trim(),
        movie.original_language.trim(),
        movie.overview,
        movie.release_date ?? null,
        movie.popularity ?? null,
        movie.vote_average ?? null,
        movie.vote_count ?? null,
        movie.poster_path ?? null,
        movie.backdrop_path ?? null,
        movie.runtime_minutes ?? null,
        movie.budget ?? null,
        movie.revenue ?? null,
        movie.collected_at.trim(),
      );

      if (Array.isArray(movie.genre_ids)) {
        deleteGenresStatement.run(movie.id);
        for (const genreId of movie.genre_ids) {
          insertGenreStatement.run(movie.id, genreId);
        }
      }

      if (Array.isArray(movie.production_country_codes)) {
        deleteCountriesStatement.run(movie.id);
        for (const countryCode of movie.production_country_codes) {
          insertCountryStatement.run(movie.id, countryCode);
        }
      }
    }

    database.exec('COMMIT;');
  } catch (error) {
    database.exec('ROLLBACK;');
    throw error;
  }
}
