#!/usr/bin/env node
import { Command } from 'commander';
import { resolve } from 'node:path';
import { DEFAULT_DATABASE_PATH, getDatabase } from './database/schema.ts';
import {
  cleanUnusedGenres,
  upsertGenres,
} from './database/genre-repository.ts';
import {
  cleanUnusedCountries,
  upsertCountries,
} from './database/country-repository.ts';
import { upsertMovies } from './database/movie-repository.ts';
import {
  parseCountriesCsv,
  parseGenresCsv,
  parseMoviesCsv,
} from './utils/csv-parser.ts';
import {
  updateAllFromApi,
  updateCountriesFromApi,
  updateGenresFromApi,
  updateMovieDetailsFromApi,
  updatePopularMoviesFromApi,
} from './services/sync-service.ts';

/** Command-line interface for movie database operations. */
export const program = new Command()
  .description('CLI for movie database operations')
  .option('-p, --path <path>', 'path to the SQLite database file');

/**
 * Resolves the database path using subcommand options falling back to global options.
 */
function getTargetDatabasePath(options?: { path?: string }): string {
  return options?.path ?? program.opts().path ?? DEFAULT_DATABASE_PATH;
}

program
  .command('create-database')
  .description('Create and initialize the movies database schema')
  .option('-p, --path <path>', 'path to the SQLite database file')
  .action((options: { path?: string }) => {
    const dbPath = getTargetDatabasePath(options);
    const database = getDatabase(dbPath);
    database.close();
    console.log(`Database available at ${resolve(dbPath)}`);
  });

program
  .command('add-genres <csv-file>')
  .description('Import or update genres from a CSV file')
  .option('-p, --path <path>', 'path to the SQLite database file')
  .action((csvFile: string, options: { path?: string }) => {
    // Validate CSV file before opening the database connection
    const genres = parseGenresCsv(csvFile);
    const dbPath = getTargetDatabasePath(options);
    const database = getDatabase(dbPath);
    try {
      upsertGenres(database, genres);
      console.log(
        `Imported ${genres.length} genres into database at ${resolve(dbPath)}`,
      );
    } finally {
      database.close();
    }
  });

program
  .command('clean-genres')
  .description('Remove genres that are not associated with any movie')
  .option('-p, --path <path>', 'path to the SQLite database file')
  .action((options: { path?: string }) => {
    const dbPath = getTargetDatabasePath(options);
    const database = getDatabase(dbPath);
    try {
      const removedCount = cleanUnusedGenres(database);
      console.log(
        `Cleaned ${removedCount} unused genres from database at ${resolve(dbPath)}`,
      );
    } finally {
      database.close();
    }
  });

program
  .command('add-countries <csv-file>')
  .description('Import or update countries from a CSV file')
  .option('-p, --path <path>', 'path to the SQLite database file')
  .action((csvFile: string, options: { path?: string }) => {
    // Validate CSV file before opening the database connection
    const countries = parseCountriesCsv(csvFile);
    const dbPath = getTargetDatabasePath(options);
    const database = getDatabase(dbPath);
    try {
      upsertCountries(database, countries);
      console.log(
        `Imported ${countries.length} countries into database at ${resolve(dbPath)}`,
      );
    } finally {
      database.close();
    }
  });

program
  .command('clean-countries')
  .description('Remove countries that are not associated with any movie')
  .option('-p, --path <path>', 'path to the SQLite database file')
  .action((options: { path?: string }) => {
    const dbPath = getTargetDatabasePath(options);
    const database = getDatabase(dbPath);
    try {
      const removedCount = cleanUnusedCountries(database);
      console.log(
        `Cleaned ${removedCount} unused countries from database at ${resolve(dbPath)}`,
      );
    } finally {
      database.close();
    }
  });

program
  .command('add-movies <csv-file>')
  .description('Import or update movies from a CSV file')
  .option('-p, --path <path>', 'path to the SQLite database file')
  .action((csvFile: string, options: { path?: string }) => {
    // Validate CSV file before opening the database connection
    const movies = parseMoviesCsv(csvFile);
    const dbPath = getTargetDatabasePath(options);
    const database = getDatabase(dbPath);
    try {
      upsertMovies(database, movies);
      console.log(
        `Imported ${movies.length} movies into database at ${resolve(dbPath)}`,
      );
    } finally {
      database.close();
    }
  });

program
  .command('update-genres')
  .description('Update genres in the database from TMDB API')
  .option('-p, --path <path>', 'path to the SQLite database file')
  .action(async (options: { path?: string }) => {
    const dbPath = getTargetDatabasePath(options);
    const database = getDatabase(dbPath);
    try {
      const genres = await updateGenresFromApi(database);
      console.log(
        `Updated ${genres.length} genres from API in database at ${resolve(dbPath)}`,
      );
    } finally {
      database.close();
    }
  });

program
  .command('update-countries')
  .description('Update countries in the database from TMDB API')
  .option('-p, --path <path>', 'path to the SQLite database file')
  .action(async (options: { path?: string }) => {
    const dbPath = getTargetDatabasePath(options);
    const database = getDatabase(dbPath);
    try {
      const countries = await updateCountriesFromApi(database);
      console.log(
        `Updated ${countries.length} countries from API in database at ${resolve(dbPath)}`,
      );
    } finally {
      database.close();
    }
  });

program
  .command('update-movies')
  .description('Update movies in the database from TMDB API')
  .option('-p, --path <path>', 'path to the SQLite database file')
  .option('--id <id>', 'TMDB movie ID to fetch details for')
  .option('--pages <pages>', 'number of popular movie pages to import', '1')
  .action(async (options: { path?: string; id?: string; pages?: string }) => {
    const dbPath = getTargetDatabasePath(options);
    const database = getDatabase(dbPath);
    try {
      if (options.id) {
        const movieId = Number(options.id);
        if (!/^[1-9]\d*$/.test(options.id) || !Number.isSafeInteger(movieId)) {
          throw new Error(`Invalid movie ID: '${options.id}'`);
        }
        const movie = await updateMovieDetailsFromApi(database, movieId);
        console.log(
          `Updated movie "${movie.title}" (ID ${movie.id}) in database at ${resolve(dbPath)}`,
        );
      } else {
        const pages = Number(options.pages ?? '1');
        let total = 0;
        for (let p = 1; p <= pages; p++) {
          const movies = await updatePopularMoviesFromApi(database, {
            page: p,
          });
          total += movies.length;
        }
        console.log(
          `Updated ${total} popular movies from API in database at ${resolve(dbPath)}`,
        );
      }
    } finally {
      database.close();
    }
  });

program
  .command('update-all')
  .description(
    'Update genres, countries and popular movies in the database from TMDB API',
  )
  .option('-p, --path <path>', 'path to the SQLite database file')
  .option('--pages <pages>', 'number of popular movie pages to import', '1')
  .action(async (options: { path?: string; pages?: string }) => {
    const dbPath = getTargetDatabasePath(options);
    const database = getDatabase(dbPath);
    try {
      const pages = Number(options.pages ?? '1');
      const summary = await updateAllFromApi(database, { pages });
      console.log(
        `Update completed: ${summary.genresCount} genres, ${summary.countriesCount} countries, ${summary.moviesCount} movies at ${resolve(dbPath)}`,
      );
    } finally {
      database.close();
    }
  });

program.parse();
