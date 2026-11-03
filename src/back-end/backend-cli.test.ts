import { resolve } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const DEFAULT_DATABASE_PATH = '/tmp/movies-default.sqlite';

const closeMock = vi.fn();
const getDatabaseMock = vi.fn(() => ({
  close: closeMock,
}));

const upsertGenresMock = vi.fn();
const cleanUnusedGenresMock = vi.fn(() => 3);
const parseGenresCsvMock = vi.fn(() => [
  { id: 28, name: 'Action' },
  { id: 35, name: 'Comédie' },
]);

vi.mock('./database/schema.ts', () => ({
  DEFAULT_DATABASE_PATH,
  getDatabase: getDatabaseMock,
}));

vi.mock('./database/genre-repository.ts', () => ({
  upsertGenres: upsertGenresMock,
  cleanUnusedGenres: cleanUnusedGenresMock,
}));

vi.mock('./utils/csv-parser.ts', () => ({
  parseGenresCsv: parseGenresCsvMock,
}));

/**
 * Executes the backend CLI with the specified command-line arguments
 * @param args The command-line arguments to pass to the CLI
 */
async function runCliWithArgs(args: string[]): Promise<void> {
  const originalArgv = process.argv;
  process.argv = ['node', 'src/back-end/backend-cli.ts', ...args];
  try {
    await import('./backend-cli.ts');
  } finally {
    process.argv = originalArgv;
  }
}

describe('backend-cli.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe('create-database', () => {
    it('uses the default database path when the subcommand has no path option', async () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      try {
        await runCliWithArgs(['create-database']);

        expect(getDatabaseMock).toHaveBeenCalledWith(DEFAULT_DATABASE_PATH);
        expect(closeMock).toHaveBeenCalledOnce();
        expect(logSpy).toHaveBeenCalledWith(
          `Database available at ${resolve(DEFAULT_DATABASE_PATH)}`,
        );
      } finally {
        logSpy.mockRestore();
      }
    });

    it('uses the path passed in --path', async () => {
      const customDatabasePath = './data/custom-movies.sqlite';
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      try {
        await runCliWithArgs(['create-database', '--path', customDatabasePath]);

        expect(getDatabaseMock).toHaveBeenCalledWith(customDatabasePath);
        expect(closeMock).toHaveBeenCalledOnce();
        expect(logSpy).toHaveBeenCalledWith(
          `Database available at ${resolve(customDatabasePath)}`,
        );
      } finally {
        logSpy.mockRestore();
      }
    });
  });

  describe('add-genres', () => {
    it('parses CSV, opens default database, inserts genres and closes database', async () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      try {
        await runCliWithArgs(['add-genres', './data/genres.csv']);

        expect(parseGenresCsvMock).toHaveBeenCalledWith('./data/genres.csv');
        expect(getDatabaseMock).toHaveBeenCalledWith(DEFAULT_DATABASE_PATH);
        expect(upsertGenresMock).toHaveBeenCalled();
        expect(closeMock).toHaveBeenCalledOnce();
        expect(logSpy).toHaveBeenCalledWith(
          `Imported 2 genres into database at ${resolve(DEFAULT_DATABASE_PATH)}`,
        );
      } finally {
        logSpy.mockRestore();
      }
    });

    it('uses custom --path when importing genres', async () => {
      const customDatabasePath = './data/custom-movies.sqlite';
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      try {
        await runCliWithArgs([
          'add-genres',
          './data/genres.csv',
          '--path',
          customDatabasePath,
        ]);

        expect(parseGenresCsvMock).toHaveBeenCalledWith('./data/genres.csv');
        expect(getDatabaseMock).toHaveBeenCalledWith(customDatabasePath);
        expect(upsertGenresMock).toHaveBeenCalled();
        expect(closeMock).toHaveBeenCalledOnce();
        expect(logSpy).toHaveBeenCalledWith(
          `Imported 2 genres into database at ${resolve(customDatabasePath)}`,
        );
      } finally {
        logSpy.mockRestore();
      }
    });

    it('validates CSV before opening the database and does not open database on failure', async () => {
      parseGenresCsvMock.mockImplementationOnce(() => {
        throw new Error('Invalid CSV');
      });

      await expect(
        runCliWithArgs(['add-genres', './data/invalid.csv']),
      ).rejects.toThrow('Invalid CSV');

      expect(getDatabaseMock).not.toHaveBeenCalled();
      expect(closeMock).not.toHaveBeenCalled();
    });
  });

  describe('clean-genres', () => {
    it('cleans unused genres on default database and closes connection', async () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      try {
        await runCliWithArgs(['clean-genres']);

        expect(getDatabaseMock).toHaveBeenCalledWith(DEFAULT_DATABASE_PATH);
        expect(cleanUnusedGenresMock).toHaveBeenCalled();
        expect(closeMock).toHaveBeenCalledOnce();
        expect(logSpy).toHaveBeenCalledWith(
          `Cleaned 3 unused genres from database at ${resolve(DEFAULT_DATABASE_PATH)}`,
        );
      } finally {
        logSpy.mockRestore();
      }
    });

    it('uses custom --path when cleaning unused genres', async () => {
      const customDatabasePath = './data/custom-movies.sqlite';
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      try {
        await runCliWithArgs(['clean-genres', '--path', customDatabasePath]);

        expect(getDatabaseMock).toHaveBeenCalledWith(customDatabasePath);
        expect(cleanUnusedGenresMock).toHaveBeenCalled();
        expect(closeMock).toHaveBeenCalledOnce();
        expect(logSpy).toHaveBeenCalledWith(
          `Cleaned 3 unused genres from database at ${resolve(customDatabasePath)}`,
        );
      } finally {
        logSpy.mockRestore();
      }
    });
  });
});
