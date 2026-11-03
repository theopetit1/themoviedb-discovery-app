#!/usr/bin/env node
import { Command } from 'commander';
import { resolve } from 'node:path';
import { DEFAULT_DATABASE_PATH, getDatabase } from './database/schema.ts';
import {
  cleanUnusedGenres,
  upsertGenres,
} from './database/genre-repository.ts';
import { parseGenresCsv } from './utils/csv-parser.ts';

/** Command-line interface for movie database operations. */
export const program = new Command().description(
  'CLI for movie database operations',
);

program
  .command('create-database')
  .description('Create and initialize the movies database schema')
  .option(
    '-p, --path <path>',
    'path to the SQLite database file',
    DEFAULT_DATABASE_PATH,
  )
  .action(({ path }: { path: string }) => {
    const database = getDatabase(path);
    database.close();
    console.log(`Database available at ${resolve(path)}`);
  });

program
  .command('add-genres <csv-file>')
  .description('Import or update genres from a CSV file')
  .option(
    '-p, --path <path>',
    'path to the SQLite database file',
    DEFAULT_DATABASE_PATH,
  )
  .action((csvFile: string, { path }: { path: string }) => {
    // Validate CSV file before opening the database connection
    const genres = parseGenresCsv(csvFile);
    const database = getDatabase(path);
    try {
      upsertGenres(database, genres);
      console.log(
        `Imported ${genres.length} genres into database at ${resolve(path)}`,
      );
    } finally {
      database.close();
    }
  });

program
  .command('clean-genres')
  .description('Remove genres that are not associated with any movie')
  .option(
    '-p, --path <path>',
    'path to the SQLite database file',
    DEFAULT_DATABASE_PATH,
  )
  .action(({ path }: { path: string }) => {
    const database = getDatabase(path);
    try {
      const removedCount = cleanUnusedGenres(database);
      console.log(
        `Cleaned ${removedCount} unused genres from database at ${resolve(path)}`,
      );
    } finally {
      database.close();
    }
  });

program.parse();
