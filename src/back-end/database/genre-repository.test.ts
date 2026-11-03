import { DatabaseSync } from 'node:sqlite';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initializeSchema } from './schema';
import {
  cleanUnusedGenres,
  getGenreById,
  listGenres,
  upsertGenres,
} from './genre-repository';
import type { Genre } from '../types/MoviesTypes';

describe('genre-repository.ts', () => {
  let database: DatabaseSync;

  beforeEach(() => {
    database = new DatabaseSync(':memory:');
    initializeSchema(database);
  });

  afterEach(() => {
    database.close();
  });

  describe('getGenreById', () => {
    it('returns undefined when the genre does not exist', () => {
      expect(getGenreById(database, 999)).toBeUndefined();
    });

    it('returns the genre when it exists in the database', () => {
      upsertGenres(database, [{ id: 28, name: 'Action' }]);

      const genre = getGenreById(database, 28);
      expect(genre).toEqual({ id: 28, name: 'Action' });
    });
  });

  describe('listGenres', () => {
    it('returns an empty array when no genres exist', () => {
      expect(listGenres(database)).toEqual([]);
    });

    it('returns all genres ordered by id ascending', () => {
      upsertGenres(database, [
        { id: 35, name: 'Comédie' },
        { id: 18, name: 'Drame' },
        { id: 28, name: 'Action' },
      ]);

      const genres = listGenres(database);
      expect(genres).toEqual([
        { id: 18, name: 'Drame' },
        { id: 28, name: 'Action' },
        { id: 35, name: 'Comédie' },
      ]);
    });
  });

  describe('upsertGenres', () => {
    it('inserts genres from an array', () => {
      upsertGenres(database, [
        { id: 12, name: 'Aventure' },
        { id: 16, name: 'Animation' },
      ]);

      expect(listGenres(database)).toEqual([
        { id: 12, name: 'Aventure' },
        { id: 16, name: 'Animation' },
      ]);
    });

    it('updates existing genres without creating duplicates', () => {
      upsertGenres(database, [{ id: 28, name: 'Act' }]);
      upsertGenres(database, [{ id: 28, name: 'Action' }]);

      expect(listGenres(database)).toEqual([{ id: 28, name: 'Action' }]);
    });

    it('handles different types of iterables like Set and Generator', () => {
      const setInput = new Set<Genre>([
        { id: 80, name: 'Crime' },
        { id: 99, name: 'Documentaire' },
      ]);
      upsertGenres(database, setInput);

      function* genreGenerator(): Generator<Genre> {
        yield { id: 14, name: 'Fantastique' };
        yield { id: 878, name: 'Science-Fiction' };
      }
      upsertGenres(database, genreGenerator());

      const genres = listGenres(database);
      expect(genres).toHaveLength(4);
      expect(getGenreById(database, 80)).toEqual({ id: 80, name: 'Crime' });
      expect(getGenreById(database, 878)).toEqual({
        id: 878,
        name: 'Science-Fiction',
      });
    });

    it('leaves data unchanged when given an empty iterable', () => {
      upsertGenres(database, [{ id: 18, name: 'Drame' }]);
      upsertGenres(database, []);
      upsertGenres(database, new Set());

      expect(listGenres(database)).toEqual([{ id: 18, name: 'Drame' }]);
    });

    it('preserves the last name when an id is repeated within the iterable', () => {
      const repeatedGenres: Genre[] = [
        { id: 28, name: 'Premier Nom' },
        { id: 18, name: 'Drame' },
        { id: 28, name: 'Deuxième Nom' },
        { id: 28, name: 'Nom Final' },
      ];
      upsertGenres(database, repeatedGenres);

      expect(getGenreById(database, 28)).toEqual({ id: 28, name: 'Nom Final' });
    });

    it('throws an error and rolls back when genre name is empty, whitespace, or invalid', () => {
      upsertGenres(database, [{ id: 10, name: 'Initial' }]);

      expect(() => upsertGenres(database, [{ id: 100, name: '' }])).toThrow(
        /Invalid genre/,
      );

      expect(() => upsertGenres(database, [{ id: 101, name: '   ' }])).toThrow(
        /Invalid genre/,
      );

      expect(() =>
        upsertGenres(database, [{ id: 102 } as unknown as Genre]),
      ).toThrow(/Invalid genre/);

      expect(() => upsertGenres(database, [null as unknown as Genre])).toThrow(
        /Invalid genre/,
      );

      expect(() =>
        upsertGenres(database, [{ id: 1.5, name: 'Dec' } as unknown as Genre]),
      ).toThrow(/Invalid genre/);

      // Verify that database remained in initial state (rollback verification)
      expect(listGenres(database)).toEqual([{ id: 10, name: 'Initial' }]);
    });
  });

  describe('cleanUnusedGenres', () => {
    it('returns 0 when no genres exist', () => {
      expect(cleanUnusedGenres(database)).toBe(0);
    });

    it('deletes only genres that are not associated with any movie', () => {
      upsertGenres(database, [
        { id: 28, name: 'Action' },
        { id: 35, name: 'Comédie' },
        { id: 18, name: 'Drame' },
      ]);

      // Insert a dummy movie and associate it with Action (28)
      database
        .prepare(`
          INSERT INTO movies (id, title, original_title, original_language, overview, collected_at)
          VALUES (1, 'Test Movie', 'Test Movie', 'fr', 'Overview', '2026-11-03')
        `)
        .run();
      database
        .prepare('INSERT INTO movie_genres (movie_id, genre_id) VALUES (1, 28)')
        .run();

      const deletedCount = cleanUnusedGenres(database);

      expect(deletedCount).toBe(2);
      expect(listGenres(database)).toEqual([{ id: 28, name: 'Action' }]);
    });

    it('rolls back and rethrows if an error occurs during cleanup', () => {
      // Mock prepare to throw on DELETE
      const originalPrepare = database.prepare.bind(database);
      const prepareSpy = vi
        .spyOn(database, 'prepare')
        .mockImplementation((sql: string) => {
          if (sql.includes('DELETE FROM genres')) {
            throw new Error('Database error during cleanup');
          }
          return originalPrepare(sql);
        });

      expect(() => cleanUnusedGenres(database)).toThrow(
        'Database error during cleanup',
      );
      prepareSpy.mockRestore();
    });
  });
});
