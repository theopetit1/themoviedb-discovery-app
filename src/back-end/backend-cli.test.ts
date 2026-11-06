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

const upsertCountriesMock = vi.fn();
const cleanUnusedCountriesMock = vi.fn(() => 5);
const parseCountriesCsvMock = vi.fn(() => [
  { code: 'FR', name: 'France' },
  { code: 'US', name: 'États-Unis' },
]);

const upsertMoviesMock = vi.fn();
const parseMoviesCsvMock = vi.fn(() => [
  {
    id: 550,
    title: 'Fight Club',
    original_title: 'Fight Club',
    original_language: 'en',
    overview: 'An insomniac office worker...',
    collected_at: '2026-11-06T12:00:00.000Z',
  },
  {
    id: 157336,
    title: 'Interstellar',
    original_title: 'Interstellar',
    original_language: 'en',
    overview: 'A team of explorers travel through a wormhole...',
    collected_at: '2026-11-06T12:00:00.000Z',
  },
]);

vi.mock('./database/schema.ts', () => ({
  DEFAULT_DATABASE_PATH,
  getDatabase: getDatabaseMock,
}));

vi.mock('./database/genre-repository.ts', () => ({
  upsertGenres: upsertGenresMock,
  cleanUnusedGenres: cleanUnusedGenresMock,
}));

vi.mock('./database/country-repository.ts', () => ({
  upsertCountries: upsertCountriesMock,
  cleanUnusedCountries: cleanUnusedCountriesMock,
}));

vi.mock('./database/movie-repository.ts', () => ({
  upsertMovies: upsertMoviesMock,
}));

vi.mock('./utils/csv-parser.ts', () => ({
  parseGenresCsv: parseGenresCsvMock,
  parseCountriesCsv: parseCountriesCsvMock,
  parseMoviesCsv: parseMoviesCsvMock,
}));

const updateGenresFromApiMock = vi.fn(() => [{ id: 1, name: 'Action' }]);
const updateCountriesFromApiMock = vi.fn(() => [
  { code: 'FR', name: 'France' },
]);
const updateMovieDetailsFromApiMock = vi.fn(() => ({
  id: 550,
  title: 'Fight Club',
}));
const updatePopularMoviesFromApiMock = vi.fn(() => [
  { id: 101, title: 'Popular 1' },
]);
const updateAllFromApiMock = vi.fn(() => ({
  genresCount: 19,
  countriesCount: 250,
  moviesCount: 20,
}));

vi.mock('./services/sync-service.ts', () => ({
  updateGenresFromApi: updateGenresFromApiMock,
  updateCountriesFromApi: updateCountriesFromApiMock,
  updateMovieDetailsFromApi: updateMovieDetailsFromApiMock,
  updatePopularMoviesFromApi: updatePopularMoviesFromApiMock,
  updateAllFromApi: updateAllFromApiMock,
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

  describe('add-countries', () => {
    it('parses CSV, opens default database, inserts countries and closes database', async () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      try {
        await runCliWithArgs(['add-countries', './data/countries.csv']);

        expect(parseCountriesCsvMock).toHaveBeenCalledWith(
          './data/countries.csv',
        );
        expect(getDatabaseMock).toHaveBeenCalledWith(DEFAULT_DATABASE_PATH);
        expect(upsertCountriesMock).toHaveBeenCalled();
        expect(closeMock).toHaveBeenCalledOnce();
        expect(logSpy).toHaveBeenCalledWith(
          `Imported 2 countries into database at ${resolve(DEFAULT_DATABASE_PATH)}`,
        );
      } finally {
        logSpy.mockRestore();
      }
    });

    it('uses custom --path when importing countries', async () => {
      const customDatabasePath = './data/custom-movies.sqlite';
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      try {
        await runCliWithArgs([
          'add-countries',
          './data/countries.csv',
          '--path',
          customDatabasePath,
        ]);

        expect(parseCountriesCsvMock).toHaveBeenCalledWith(
          './data/countries.csv',
        );
        expect(getDatabaseMock).toHaveBeenCalledWith(customDatabasePath);
        expect(upsertCountriesMock).toHaveBeenCalled();
        expect(closeMock).toHaveBeenCalledOnce();
        expect(logSpy).toHaveBeenCalledWith(
          `Imported 2 countries into database at ${resolve(customDatabasePath)}`,
        );
      } finally {
        logSpy.mockRestore();
      }
    });

    it('uses global --path placed before subcommand when importing countries', async () => {
      const customDatabasePath = './data/custom-movies.sqlite';
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      try {
        await runCliWithArgs([
          '--path',
          customDatabasePath,
          'add-countries',
          './data/countries.csv',
        ]);

        expect(parseCountriesCsvMock).toHaveBeenCalledWith(
          './data/countries.csv',
        );
        expect(getDatabaseMock).toHaveBeenCalledWith(customDatabasePath);
        expect(upsertCountriesMock).toHaveBeenCalled();
        expect(closeMock).toHaveBeenCalledOnce();
        expect(logSpy).toHaveBeenCalledWith(
          `Imported 2 countries into database at ${resolve(customDatabasePath)}`,
        );
      } finally {
        logSpy.mockRestore();
      }
    });

    it('validates CSV before opening the database and does not open database on failure', async () => {
      parseCountriesCsvMock.mockImplementationOnce(() => {
        throw new Error('Invalid Country CSV');
      });

      await expect(
        runCliWithArgs(['add-countries', './data/invalid.csv']),
      ).rejects.toThrow('Invalid Country CSV');

      expect(getDatabaseMock).not.toHaveBeenCalled();
      expect(closeMock).not.toHaveBeenCalled();
    });
  });

  describe('clean-countries', () => {
    it('cleans unused countries on default database and closes connection', async () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      try {
        await runCliWithArgs(['clean-countries']);

        expect(getDatabaseMock).toHaveBeenCalledWith(DEFAULT_DATABASE_PATH);
        expect(cleanUnusedCountriesMock).toHaveBeenCalled();
        expect(closeMock).toHaveBeenCalledOnce();
        expect(logSpy).toHaveBeenCalledWith(
          `Cleaned 5 unused countries from database at ${resolve(DEFAULT_DATABASE_PATH)}`,
        );
      } finally {
        logSpy.mockRestore();
      }
    });

    it('uses custom --path when cleaning unused countries', async () => {
      const customDatabasePath = './data/custom-movies.sqlite';
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      try {
        await runCliWithArgs(['clean-countries', '--path', customDatabasePath]);

        expect(getDatabaseMock).toHaveBeenCalledWith(customDatabasePath);
        expect(cleanUnusedCountriesMock).toHaveBeenCalled();
        expect(closeMock).toHaveBeenCalledOnce();
        expect(logSpy).toHaveBeenCalledWith(
          `Cleaned 5 unused countries from database at ${resolve(customDatabasePath)}`,
        );
      } finally {
        logSpy.mockRestore();
      }
    });

    it('uses global --path placed before subcommand when cleaning unused countries', async () => {
      const customDatabasePath = './data/custom-movies.sqlite';
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      try {
        await runCliWithArgs(['--path', customDatabasePath, 'clean-countries']);

        expect(getDatabaseMock).toHaveBeenCalledWith(customDatabasePath);
        expect(cleanUnusedCountriesMock).toHaveBeenCalled();
        expect(closeMock).toHaveBeenCalledOnce();
        expect(logSpy).toHaveBeenCalledWith(
          `Cleaned 5 unused countries from database at ${resolve(customDatabasePath)}`,
        );
      } finally {
        logSpy.mockRestore();
      }
    });
  });

  describe('add-movies', () => {
    it('parses movies CSV, opens default database, inserts movies and closes database', async () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      try {
        await runCliWithArgs(['add-movies', './data/movies.csv']);

        expect(parseMoviesCsvMock).toHaveBeenCalledWith('./data/movies.csv');
        expect(getDatabaseMock).toHaveBeenCalledWith(DEFAULT_DATABASE_PATH);
        expect(upsertMoviesMock).toHaveBeenCalledWith(
          expect.anything(),
          expect.arrayContaining([
            expect.objectContaining({ id: 550, title: 'Fight Club' }),
          ]),
        );
        expect(closeMock).toHaveBeenCalledOnce();
        expect(logSpy).toHaveBeenCalledWith(
          `Imported 2 movies into database at ${resolve(DEFAULT_DATABASE_PATH)}`,
        );
      } finally {
        logSpy.mockRestore();
      }
    });

    it('uses custom --path when passed to subcommand', async () => {
      const customDatabasePath = './data/custom-movies.sqlite';
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      try {
        await runCliWithArgs([
          'add-movies',
          './data/movies.csv',
          '--path',
          customDatabasePath,
        ]);

        expect(parseMoviesCsvMock).toHaveBeenCalledWith('./data/movies.csv');
        expect(getDatabaseMock).toHaveBeenCalledWith(customDatabasePath);
        expect(upsertMoviesMock).toHaveBeenCalled();
        expect(closeMock).toHaveBeenCalledOnce();
        expect(logSpy).toHaveBeenCalledWith(
          `Imported 2 movies into database at ${resolve(customDatabasePath)}`,
        );
      } finally {
        logSpy.mockRestore();
      }
    });

    it('uses global --path placed before subcommand', async () => {
      const customDatabasePath = './data/custom-movies.sqlite';
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      try {
        await runCliWithArgs([
          '--path',
          customDatabasePath,
          'add-movies',
          './data/movies.csv',
        ]);

        expect(parseMoviesCsvMock).toHaveBeenCalledWith('./data/movies.csv');
        expect(getDatabaseMock).toHaveBeenCalledWith(customDatabasePath);
        expect(upsertMoviesMock).toHaveBeenCalled();
        expect(closeMock).toHaveBeenCalledOnce();
        expect(logSpy).toHaveBeenCalledWith(
          `Imported 2 movies into database at ${resolve(customDatabasePath)}`,
        );
      } finally {
        logSpy.mockRestore();
      }
    });

    it('validates CSV before opening the database and does not open database on failure', async () => {
      parseMoviesCsvMock.mockImplementationOnce(() => {
        throw new Error('Invalid Movies CSV');
      });

      await expect(
        runCliWithArgs(['add-movies', './data/invalid.csv']),
      ).rejects.toThrow('Invalid Movies CSV');

      expect(getDatabaseMock).not.toHaveBeenCalled();
      expect(closeMock).not.toHaveBeenCalled();
    });

    it('closes database connection in finally block even if upsertMovies throws', async () => {
      upsertMoviesMock.mockImplementationOnce(() => {
        throw new Error('Database write error');
      });

      await expect(
        runCliWithArgs(['add-movies', './data/movies.csv']),
      ).rejects.toThrow('Database write error');

      expect(getDatabaseMock).toHaveBeenCalledWith(DEFAULT_DATABASE_PATH);
      expect(closeMock).toHaveBeenCalledOnce();
    });
  });

  describe('update-genres', () => {
    it('updates genres from API on default database and closes connection', async () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      try {
        await runCliWithArgs(['update-genres']);

        expect(getDatabaseMock).toHaveBeenCalledWith(DEFAULT_DATABASE_PATH);
        expect(updateGenresFromApiMock).toHaveBeenCalled();
        expect(closeMock).toHaveBeenCalledOnce();
        expect(logSpy).toHaveBeenCalledWith(
          `Updated 1 genres from API in database at ${resolve(DEFAULT_DATABASE_PATH)}`,
        );
      } finally {
        logSpy.mockRestore();
      }
    });

    it('uses custom --path when updating genres', async () => {
      const customDatabasePath = './data/custom.sqlite';
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      try {
        await runCliWithArgs(['update-genres', '--path', customDatabasePath]);

        expect(getDatabaseMock).toHaveBeenCalledWith(customDatabasePath);
        expect(updateGenresFromApiMock).toHaveBeenCalled();
        expect(closeMock).toHaveBeenCalledOnce();
      } finally {
        logSpy.mockRestore();
      }
    });

    it('closes database even when updateGenresFromApi throws', async () => {
      updateGenresFromApiMock.mockImplementationOnce(() => {
        throw new Error('API failure');
      });

      await expect(runCliWithArgs(['update-genres'])).rejects.toThrow(
        'API failure',
      );

      expect(getDatabaseMock).toHaveBeenCalledWith(DEFAULT_DATABASE_PATH);
      expect(closeMock).toHaveBeenCalledOnce();
    });
  });

  describe('update-countries', () => {
    it('updates countries from API on default database and closes connection', async () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      try {
        await runCliWithArgs(['update-countries']);

        expect(getDatabaseMock).toHaveBeenCalledWith(DEFAULT_DATABASE_PATH);
        expect(updateCountriesFromApiMock).toHaveBeenCalled();
        expect(closeMock).toHaveBeenCalledOnce();
        expect(logSpy).toHaveBeenCalledWith(
          `Updated 1 countries from API in database at ${resolve(DEFAULT_DATABASE_PATH)}`,
        );
      } finally {
        logSpy.mockRestore();
      }
    });

    it('uses custom --path when updating countries', async () => {
      const customDatabasePath = './data/custom.sqlite';
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      try {
        await runCliWithArgs([
          'update-countries',
          '--path',
          customDatabasePath,
        ]);

        expect(getDatabaseMock).toHaveBeenCalledWith(customDatabasePath);
        expect(updateCountriesFromApiMock).toHaveBeenCalled();
        expect(closeMock).toHaveBeenCalledOnce();
      } finally {
        logSpy.mockRestore();
      }
    });

    it('closes database even when updateCountriesFromApi throws', async () => {
      updateCountriesFromApiMock.mockImplementationOnce(() => {
        throw new Error('API country failure');
      });

      await expect(runCliWithArgs(['update-countries'])).rejects.toThrow(
        'API country failure',
      );

      expect(getDatabaseMock).toHaveBeenCalledWith(DEFAULT_DATABASE_PATH);
      expect(closeMock).toHaveBeenCalledOnce();
    });
  });

  describe('update-movies', () => {
    it('updates specific movie when --id is provided', async () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      try {
        await runCliWithArgs(['update-movies', '--id', '550']);

        expect(getDatabaseMock).toHaveBeenCalledWith(DEFAULT_DATABASE_PATH);
        expect(updateMovieDetailsFromApiMock).toHaveBeenCalledWith(
          expect.anything(),
          550,
        );
        expect(closeMock).toHaveBeenCalledOnce();
        expect(logSpy).toHaveBeenCalledWith(
          `Updated movie "Fight Club" (ID 550) in database at ${resolve(DEFAULT_DATABASE_PATH)}`,
        );
      } finally {
        logSpy.mockRestore();
      }
    });

    it('throws error when --id is not a valid positive integer', async () => {
      await expect(
        runCliWithArgs(['update-movies', '--id', 'invalid']),
      ).rejects.toThrow("Invalid movie ID: 'invalid'");
      expect(closeMock).toHaveBeenCalledOnce();

      await expect(
        runCliWithArgs(['update-movies', '--id', '99999999999999999999999999']),
      ).rejects.toThrow(/Invalid movie ID/);
    });

    it('updates popular movies across pages when --id is not provided', async () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      try {
        await runCliWithArgs(['update-movies', '--pages', '2']);

        expect(getDatabaseMock).toHaveBeenCalledWith(DEFAULT_DATABASE_PATH);
        expect(updatePopularMoviesFromApiMock).toHaveBeenCalledTimes(2);
        expect(closeMock).toHaveBeenCalledOnce();
        expect(logSpy).toHaveBeenCalledWith(
          `Updated 2 popular movies from API in database at ${resolve(DEFAULT_DATABASE_PATH)}`,
        );
      } finally {
        logSpy.mockRestore();
      }
    });

    it('closes database even when update-movies throws', async () => {
      updateMovieDetailsFromApiMock.mockImplementationOnce(() => {
        throw new Error('Movie API error');
      });

      await expect(
        runCliWithArgs(['update-movies', '--id', '123']),
      ).rejects.toThrow('Movie API error');

      expect(closeMock).toHaveBeenCalledOnce();
    });
  });

  describe('update-all', () => {
    it('orchestrates full update from API', async () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      try {
        await runCliWithArgs(['update-all', '--pages', '2']);

        expect(getDatabaseMock).toHaveBeenCalledWith(DEFAULT_DATABASE_PATH);
        expect(updateAllFromApiMock).toHaveBeenCalledWith(expect.anything(), {
          pages: 2,
        });
        expect(closeMock).toHaveBeenCalledOnce();
        expect(logSpy).toHaveBeenCalledWith(
          `Update completed: 19 genres, 250 countries, 20 movies at ${resolve(DEFAULT_DATABASE_PATH)}`,
        );
      } finally {
        logSpy.mockRestore();
      }
    });

    it('closes database even when updateAllFromApi throws', async () => {
      updateAllFromApiMock.mockImplementationOnce(() => {
        throw new Error('Sync all failure');
      });

      await expect(runCliWithArgs(['update-all'])).rejects.toThrow(
        'Sync all failure',
      );

      expect(closeMock).toHaveBeenCalledOnce();
    });
  });
});
