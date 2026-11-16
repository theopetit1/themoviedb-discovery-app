import { DatabaseSync } from 'node:sqlite';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initializeSchema } from './schema';
import { upsertGenres } from './genre-repository';
import { upsertCountries } from './country-repository';
import { getMovieById, listMovies, upsertMovies } from './movie-repository';
import type { DbMovie } from '../types/MoviesTypes';

describe('movie-repository.ts', () => {
  let database: DatabaseSync;

  beforeEach(() => {
    database = new DatabaseSync(':memory:');
    initializeSchema(database);

    // Pre-populate some genres and countries for foreign key relations
    upsertGenres(database, [
      { id: 28, name: 'Action' },
      { id: 12, name: 'Aventure' },
      { id: 35, name: 'Comédie' },
    ]);

    upsertCountries(database, [
      { code: 'FR', name: 'France' },
      { code: 'US', name: 'États-Unis' },
      { code: 'GB', name: 'Royaume-Uni' },
    ]);
  });

  afterEach(() => {
    database.close();
  });

  describe('getMovieById', () => {
    it('returns undefined when the movie does not exist', () => {
      expect(getMovieById(database, 999)).toBeUndefined();
    });

    it('returns the movie when it exists in the database with genres and countries', () => {
      const sampleMovie: DbMovie = {
        id: 1,
        title: 'Inception',
        original_title: 'Inception',
        original_language: 'en',
        overview: 'A mind-bending thriller.',
        release_date: '2010-07-16',
        popularity: 92.4,
        vote_average: 8.4,
        vote_count: 32000,
        poster_path: '/inception.jpg',
        backdrop_path: '/inception_backdrop.jpg',
        runtime_minutes: 148,
        budget: 160000000,
        revenue: 825532764,
        collected_at: '2026-11-04T10:00:00Z',
        genre_ids: [28, 12],
        production_country_codes: ['US', 'GB'],
      };

      upsertMovies(database, [sampleMovie]);

      const movie = getMovieById(database, 1);
      expect(movie).toBeDefined();
      expect(movie?.id).toBe(1);
      expect(movie?.title).toBe('Inception');
      expect(movie?.release_year).toBe(2010);
      expect(movie?.genre_ids).toEqual([12, 28]);
      expect(movie?.production_country_codes).toEqual(['GB', 'US']);
    });

    it('handles nullable fields gracefully when fetching a movie', () => {
      const minimalMovie: DbMovie = {
        id: 2,
        title: 'Minimal Movie',
        original_title: 'Minimal Movie',
        original_language: 'fr',
        overview: 'Overview',
        collected_at: '2026-11-04T10:00:00Z',
      };

      upsertMovies(database, [minimalMovie]);

      const movie = getMovieById(database, 2);
      expect(movie).toBeDefined();
      expect(movie?.release_date).toBeNull();
      expect(movie?.release_year).toBeNull();
      expect(movie?.popularity).toBeNull();
      expect(movie?.vote_average).toBeNull();
      expect(movie?.vote_count).toBeNull();
      expect(movie?.poster_path).toBeNull();
      expect(movie?.backdrop_path).toBeNull();
      expect(movie?.runtime_minutes).toBeNull();
      expect(movie?.budget).toBeNull();
      expect(movie?.revenue).toBeNull();
      expect(movie?.genre_ids).toEqual([]);
      expect(movie?.production_country_codes).toEqual([]);
    });
  });

  describe('listMovies', () => {
    it('returns an empty array when no movies exist', () => {
      expect(listMovies(database)).toEqual([]);
    });

    it('returns all movies ordered by id ascending with associations (full and minimal)', () => {
      const fullMovie: DbMovie = {
        id: 5,
        title: 'Film 5',
        original_title: 'Film 5',
        original_language: 'fr',
        overview: 'Overview 5',
        release_date: '2022-01-01',
        popularity: 50.5,
        vote_average: 7.5,
        vote_count: 1200,
        poster_path: '/poster5.jpg',
        backdrop_path: '/backdrop5.jpg',
        runtime_minutes: 120,
        budget: 50000000,
        revenue: 150000000,
        collected_at: '2026-11-04T10:00:00Z',
        genre_ids: [35],
        production_country_codes: ['US'],
      };

      const minimalMovie: DbMovie = {
        id: 10,
        title: 'Film 10',
        original_title: 'Film 10',
        original_language: 'fr',
        overview: 'Overview 10',
        collected_at: '2026-11-04T10:00:00Z',
        genre_ids: [28],
        production_country_codes: ['FR'],
      };

      upsertMovies(database, [minimalMovie, fullMovie]);

      const movies = listMovies(database);
      expect(movies).toHaveLength(2);
      expect(movies[0].id).toBe(5);
      expect(movies[0].release_year).toBe(2022);
      expect(movies[0].popularity).toBe(50.5);
      expect(movies[0].vote_average).toBe(7.5);
      expect(movies[0].vote_count).toBe(1200);
      expect(movies[0].poster_path).toBe('/poster5.jpg');
      expect(movies[0].backdrop_path).toBe('/backdrop5.jpg');
      expect(movies[0].runtime_minutes).toBe(120);
      expect(movies[0].budget).toBe(50000000);
      expect(movies[0].revenue).toBe(150000000);
      expect(movies[0].genre_ids).toEqual([35]);
      expect(movies[0].production_country_codes).toEqual(['US']);

      expect(movies[1].id).toBe(10);
      expect(movies[1].release_date).toBeNull();
      expect(movies[1].release_year).toBeNull();
      expect(movies[1].genre_ids).toEqual([28]);
      expect(movies[1].production_country_codes).toEqual(['FR']);
    });
  });

  describe('upsertMovies', () => {
    it('updates existing movies without creating duplicates', () => {
      const initial: DbMovie = {
        id: 1,
        title: 'Initial Title',
        original_title: 'Initial Title',
        original_language: 'en',
        overview: 'Overview',
        collected_at: '2026-11-04T10:00:00Z',
        genre_ids: [28],
      };

      const updated: DbMovie = {
        id: 1,
        title: 'Updated Title',
        original_title: 'Initial Title',
        original_language: 'en',
        overview: 'Updated Overview',
        collected_at: '2026-11-04T11:00:00Z',
        genre_ids: [35],
      };

      upsertMovies(database, [initial]);
      upsertMovies(database, [updated]);

      const movies = listMovies(database);
      expect(movies).toHaveLength(1);
      expect(movies[0].title).toBe('Updated Title');
      expect(movies[0].overview).toBe('Updated Overview');
      expect(movies[0].genre_ids).toEqual([35]);
    });

    it('handles iterables such as Set and Generator', () => {
      const movie1: DbMovie = {
        id: 101,
        title: 'Set Movie',
        original_title: 'Set Movie',
        original_language: 'en',
        overview: 'Overview',
        collected_at: '2026-11-04T10:00:00Z',
      };

      upsertMovies(database, new Set([movie1]));

      function* movieGenerator(): Generator<DbMovie> {
        yield {
          id: 102,
          title: 'Generator Movie',
          original_title: 'Generator Movie',
          original_language: 'fr',
          overview: 'Overview',
          collected_at: '2026-11-04T10:00:00Z',
        };
      }

      upsertMovies(database, movieGenerator());

      const movies = listMovies(database);
      expect(movies).toHaveLength(2);
      expect(getMovieById(database, 101)).toBeDefined();
      expect(getMovieById(database, 102)).toBeDefined();
    });

    it('leaves data unchanged when given an empty iterable', () => {
      const movie: DbMovie = {
        id: 1,
        title: 'Movie',
        original_title: 'Movie',
        original_language: 'fr',
        overview: 'Overview',
        collected_at: '2026-11-04T10:00:00Z',
      };

      upsertMovies(database, [movie]);
      upsertMovies(database, []);
      upsertMovies(database, new Set());

      expect(listMovies(database)).toHaveLength(1);
    });

    it('throws error and rolls back when movie data is invalid', () => {
      const validMovie: DbMovie = {
        id: 1,
        title: 'Valid',
        original_title: 'Valid',
        original_language: 'fr',
        overview: 'Overview',
        collected_at: '2026-11-04T10:00:00Z',
      };
      upsertMovies(database, [validMovie]);

      // Invalid movie object
      expect(() =>
        upsertMovies(database, [null as unknown as DbMovie]),
      ).toThrow(/Invalid movie data/);

      // Invalid ID
      expect(() => upsertMovies(database, [{ ...validMovie, id: 0 }])).toThrow(
        /Invalid movie data/,
      );
      expect(() => upsertMovies(database, [{ ...validMovie, id: -1 }])).toThrow(
        /Invalid movie data/,
      );
      expect(() =>
        upsertMovies(database, [{ ...validMovie, id: 1.5 }]),
      ).toThrow(/Invalid movie data/);

      // Invalid title
      expect(() =>
        upsertMovies(database, [{ ...validMovie, id: 2, title: '' }]),
      ).toThrow(/Invalid movie data/);
      expect(() =>
        upsertMovies(database, [{ ...validMovie, id: 2, title: '   ' }]),
      ).toThrow(/Invalid movie data/);

      // Invalid original_title
      expect(() =>
        upsertMovies(database, [{ ...validMovie, id: 2, original_title: '' }]),
      ).toThrow(/Invalid movie data/);

      // Invalid original_language
      expect(() =>
        upsertMovies(database, [
          { ...validMovie, id: 2, original_language: '' },
        ]),
      ).toThrow(/Invalid movie data/);

      // Invalid overview
      expect(() =>
        upsertMovies(database, [
          { ...validMovie, id: 2, overview: 123 as unknown as string },
        ]),
      ).toThrow(/Invalid movie data/);

      // Invalid collected_at
      expect(() =>
        upsertMovies(database, [{ ...validMovie, id: 2, collected_at: '' }]),
      ).toThrow(/Invalid movie data/);

      // Invalid runtime_minutes
      expect(() =>
        upsertMovies(database, [{ ...validMovie, id: 2, runtime_minutes: 0 }]),
      ).toThrow(/Invalid movie runtime_minutes/);
      expect(() =>
        upsertMovies(database, [
          { ...validMovie, id: 2, runtime_minutes: -10 },
        ]),
      ).toThrow(/Invalid movie runtime_minutes/);
      expect(() =>
        upsertMovies(database, [
          { ...validMovie, id: 2, runtime_minutes: 12.5 },
        ]),
      ).toThrow(/Invalid movie runtime_minutes/);

      // Invalid budget
      expect(() =>
        upsertMovies(database, [{ ...validMovie, id: 2, budget: 0 }]),
      ).toThrow(/Invalid movie budget/);
      expect(() =>
        upsertMovies(database, [{ ...validMovie, id: 2, budget: -50 }]),
      ).toThrow(/Invalid movie budget/);
      expect(() =>
        upsertMovies(database, [{ ...validMovie, id: 2, budget: 100.5 }]),
      ).toThrow(/Invalid movie budget/);

      // Invalid revenue
      expect(() =>
        upsertMovies(database, [{ ...validMovie, id: 2, revenue: 0 }]),
      ).toThrow(/Invalid movie revenue/);
      expect(() =>
        upsertMovies(database, [{ ...validMovie, id: 2, revenue: -500 }]),
      ).toThrow(/Invalid movie revenue/);
      expect(() =>
        upsertMovies(database, [{ ...validMovie, id: 2, revenue: 1000.75 }]),
      ).toThrow(/Invalid movie revenue/);

      // Verify rollback preserved existing state
      const movies = listMovies(database);
      expect(movies).toHaveLength(1);
      expect(movies[0].id).toBe(1);
    });

    it('rolls back and rethrows if an error occurs during database execution', () => {
      const validMovie: DbMovie = {
        id: 1,
        title: 'Valid',
        original_title: 'Valid',
        original_language: 'fr',
        overview: 'Overview',
        collected_at: '2026-11-04T10:00:00Z',
      };
      const originalPrepare = database.prepare.bind(database);
      const prepareSpy = vi
        .spyOn(database, 'prepare')
        .mockImplementation((sql: string) => {
          if (sql.includes('INSERT INTO movies')) {
            throw new Error('Database disk error');
          }
          return originalPrepare(sql);
        });
      expect(() => upsertMovies(database, [validMovie])).toThrow(
        'Database disk error',
      );
      prepareSpy.mockRestore();
    });
  });
});
