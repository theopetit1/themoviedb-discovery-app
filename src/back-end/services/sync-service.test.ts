import { DatabaseSync } from 'node:sqlite';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../utils/config.ts', () => ({
  tmdbAccessToken: 'test-token',
}));

import { initializeSchema } from '../database/schema.ts';
import { listGenres, upsertGenres } from '../database/genre-repository.ts';
import {
  listCountries,
  upsertCountries,
} from '../database/country-repository.ts';
import { getMovieById } from '../database/movie-repository.ts';
import {
  updateAllFromApi,
  updateCountriesFromApi,
  updateGenresFromApi,
  updateMovieDetailsFromApi,
  updatePopularMoviesFromApi,
} from './sync-service.ts';

describe('sync-service.ts', () => {
  let database: DatabaseSync;

  beforeEach(() => {
    database = new DatabaseSync(':memory:');
    initializeSchema(database);
  });

  afterEach(() => {
    database.close();
  });

  describe('updateGenresFromApi', () => {
    it('fetches genres from API and saves them into the database', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          genres: [
            { id: 28, name: 'Action' },
            { id: 35, name: 'Comédie' },
            { id: 'invalid', name: 'Ignore' },
          ],
        }),
      });

      const genres = await updateGenresFromApi(database, {
        fetchFn: mockFetch as unknown as typeof fetch,
        accessToken: 'test-token',
        apiBaseUrl: 'https://test-api.tmdb.org/3',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-api.tmdb.org/3/genre/movie/list',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        }),
      );

      expect(genres).toEqual([
        { id: 28, name: 'Action' },
        { id: 35, name: 'Comédie' },
      ]);

      const storedGenres = listGenres(database);
      expect(storedGenres).toHaveLength(2);
      expect(storedGenres[0]).toEqual({ id: 28, name: 'Action' });
      expect(storedGenres[1]).toEqual({ id: 35, name: 'Comédie' });
    });

    it('handles empty response gracefully when genres field is missing', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      const genres = await updateGenresFromApi(database, {
        fetchFn: mockFetch as unknown as typeof fetch,
      });

      expect(genres).toEqual([]);
      expect(listGenres(database)).toEqual([]);
    });

    it('throws error when API response is not ok', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
      });

      await expect(
        updateGenresFromApi(database, {
          fetchFn: mockFetch as unknown as typeof fetch,
        }),
      ).rejects.toThrow('Failed to fetch genres from API: HTTP 401');
    });
  });

  describe('updateCountriesFromApi', () => {
    it('fetches countries from API, filters valid ISO codes and persists them', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          { iso_3166_1: 'FR', english_name: 'France' },
          { iso_3166_1: 'US', english_name: 'United States' },
          { iso_3166_1: 'JP', english_name: '', native_name: 'Japan' },
          { iso_3166_1: 'INVALID', english_name: 'Invalid Code' },
          { iso_3166_1: 'DE', english_name: '   ' },
          { english_name: 'No ISO' } as unknown as {
            iso_3166_1: string;
            english_name: string;
          },
          { iso_3166_1: 'IT', english_name: '', native_name: '' },
        ],
      });

      const countries = await updateCountriesFromApi(database, {
        fetchFn: mockFetch as unknown as typeof fetch,
        accessToken: 'test-token',
      });

      expect(countries).toEqual([
        { code: 'FR', name: 'France' },
        { code: 'US', name: 'United States' },
        { code: 'JP', name: 'Japan' },
      ]);

      const storedCountries = listCountries(database);
      expect(storedCountries).toHaveLength(3);
      expect(storedCountries.map((c) => c.code)).toEqual(['FR', 'JP', 'US']);
    });

    it('throws error when API response is not ok', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(
        updateCountriesFromApi(database, {
          fetchFn: mockFetch as unknown as typeof fetch,
        }),
      ).rejects.toThrow('Failed to fetch countries from API: HTTP 500');
    });
  });

  describe('updateMovieDetailsFromApi', () => {
    it('fetches full movie details, synchronizes embedded genres and countries, and persists movie', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 550,
          title: 'Fight Club',
          original_title: 'Fight Club',
          original_language: 'en',
          overview: 'An insomniac office worker...',
          release_date: '1999-10-15',
          popularity: 61.4,
          vote_average: 8.4,
          vote_count: 26000,
          poster_path: '/poster.jpg',
          backdrop_path: '/backdrop.jpg',
          runtime: 139,
          budget: 63000000,
          revenue: 100000000,
          genres: [
            { id: 18, name: 'Drame' },
            { id: 53, name: 'Thriller' },
          ],
          production_countries: [
            { iso_3166_1: 'US', name: 'United States' },
            { iso_3166_1: 'DE', name: 'Germany' },
          ],
        }),
      });

      const movie = await updateMovieDetailsFromApi(database, 550, {
        fetchFn: mockFetch as unknown as typeof fetch,
      });

      expect(movie.id).toBe(550);
      expect(movie.title).toBe('Fight Club');
      expect(movie.runtime_minutes).toBe(139);
      expect(movie.budget).toBe(63000000);
      expect(movie.revenue).toBe(100000000);
      expect(movie.genre_ids).toEqual([18, 53]);
      expect(movie.production_country_codes).toEqual(['US', 'DE']);

      // Check that movie, genres and countries are stored in SQLite
      const storedMovie = getMovieById(database, 550);
      expect(storedMovie).toBeDefined();
      expect(storedMovie?.title).toBe('Fight Club');
      expect(listGenres(database)).toHaveLength(2);
      expect(listCountries(database)).toHaveLength(2);
    });

    it('handles minimal movie details with null/zero budget and fallbacks', async () => {
      // Pre-populate genre and country for foreign key constraint
      upsertGenres(database, [{ id: 99, name: 'Fallback Genre' }]);
      upsertCountries(database, [{ code: 'FR', name: 'France' }]);

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 10,
          title: 'Minimal Movie',
          original_title: 'Minimal Movie',
          original_language: 'fr',
          release_date: '',
          popularity: -5, // invalid -> null
          vote_average: 15, // invalid -> null
          vote_count: -1, // invalid -> null
          runtime: 0, // non-positive -> null
          budget: 0, // non-positive -> null
          revenue: -100, // non-positive -> null
          genre_ids: [99],
          production_country_codes: ['FR'],
        }),
      });

      const movie = await updateMovieDetailsFromApi(database, 10, {
        fetchFn: mockFetch as unknown as typeof fetch,
      });

      expect(movie.id).toBe(10);
      expect(movie.overview).toBe('');
      expect(movie.popularity).toBeNull();
      expect(movie.vote_average).toBeNull();
      expect(movie.vote_count).toBeNull();
      expect(movie.runtime_minutes).toBeNull();
      expect(movie.budget).toBeNull();
      expect(movie.revenue).toBeNull();
      expect(movie.release_date).toBeNull();
      expect(movie.genre_ids).toEqual([99]);
      expect(movie.production_country_codes).toEqual(['FR']);
    });

    it('throws error when movie details request fails', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });

      await expect(
        updateMovieDetailsFromApi(database, 999999, {
          fetchFn: mockFetch as unknown as typeof fetch,
        }),
      ).rejects.toThrow(
        'Failed to fetch movie details for ID 999999 from API: HTTP 404',
      );
    });
  });

  describe('updatePopularMoviesFromApi', () => {
    it('fetches popular movies list and updates each movie with full details', async () => {
      const mockFetch = vi.fn().mockImplementation(async (url: string) => {
        if (url.includes('/movie/popular')) {
          return {
            ok: true,
            json: async () => ({
              page: 1,
              results: [{ id: 101 }, { id: 102 }],
            }),
          };
        }
        if (url.includes('/movie/101')) {
          return {
            ok: true,
            json: async () => ({
              id: 101,
              title: 'Movie 101',
              original_title: 'Movie 101',
              original_language: 'en',
              overview: 'Overview 101',
            }),
          };
        }
        if (url.includes('/movie/102')) {
          return {
            ok: true,
            json: async () => ({
              id: 102,
              title: 'Movie 102',
              original_title: 'Movie 102',
              original_language: 'fr',
              overview: 'Overview 102',
            }),
          };
        }
        return { ok: false, status: 404 };
      });

      const movies = await updatePopularMoviesFromApi(database, {
        fetchFn: mockFetch as unknown as typeof fetch,
        page: 1,
        language: 'fr-FR',
        region: 'FR',
      });

      expect(movies).toHaveLength(2);
      expect(movies[0].id).toBe(101);
      expect(movies[1].id).toBe(102);
      expect(getMovieById(database, 101)).toBeDefined();
      expect(getMovieById(database, 102)).toBeDefined();
    });

    it('handles empty results in popular movies', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      const movies = await updatePopularMoviesFromApi(database, {
        fetchFn: mockFetch as unknown as typeof fetch,
      });

      expect(movies).toEqual([]);
    });

    it('throws error when popular movies request fails', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(
        updatePopularMoviesFromApi(database, {
          fetchFn: mockFetch as unknown as typeof fetch,
        }),
      ).rejects.toThrow('Failed to fetch popular movies from API: HTTP 500');
    });
  });

  describe('updateAllFromApi', () => {
    it('orchestrates update of genres, countries and multiple pages of movies', async () => {
      const mockFetch = vi.fn().mockImplementation(async (url: string) => {
        if (url.includes('/genre/movie/list')) {
          return {
            ok: true,
            json: async () => ({
              genres: [{ id: 1, name: 'Genre 1' }],
            }),
          };
        }
        if (url.includes('/configuration/countries')) {
          return {
            ok: true,
            json: async () => [{ iso_3166_1: 'FR', english_name: 'France' }],
          };
        }
        if (url.includes('/movie/popular')) {
          return {
            ok: true,
            json: async () => ({
              results: [{ id: 201 }],
            }),
          };
        }
        if (url.includes('/movie/201')) {
          return {
            ok: true,
            json: async () => ({
              id: 201,
              title: 'Movie 201',
              original_title: 'Movie 201',
              original_language: 'en',
              overview: 'Overview 201',
            }),
          };
        }
        return { ok: false, status: 404 };
      });

      const summary = await updateAllFromApi(database, {
        fetchFn: mockFetch as unknown as typeof fetch,
        pages: 2,
      });

      expect(summary).toEqual({
        genresCount: 1,
        countriesCount: 1,
        moviesCount: 2,
      });
    });

    it('uses global fetch and default options when options parameter is omitted', async () => {
      const originalFetch = globalThis.fetch;
      const globalFetchMock = vi
        .fn()
        .mockImplementation(async (url: string) => {
          if (url.includes('/genre/movie/list')) {
            return {
              ok: true,
              json: async () => ({
                genres: [{ id: 1, name: 'Default Genre' }],
              }),
            };
          }
          if (url.includes('/configuration/countries')) {
            return {
              ok: true,
              json: async () => [{ iso_3166_1: 'FR', english_name: 'France' }],
            };
          }
          if (url.includes('/movie/popular')) {
            return {
              ok: true,
              json: async () => ({
                results: [{ id: 301 }],
              }),
            };
          }
          if (url.includes('/movie/301')) {
            return {
              ok: true,
              json: async () => ({
                id: 301,
                title: 'Default Movie',
                original_title: 'Default Movie',
                original_language: 'en',
                overview: 'Overview',
                runtime_minutes: 110,
                genres: [{ id: 'bad', name: 'Bad' }],
                production_countries: [
                  { iso_3166_1: 'INVALID', name: 'Ignore' },
                  { iso_3166_1: 'FR', name: '' },
                  { name: 'Missing Code' },
                  { iso_3166_1: 'US' },
                ],
              }),
            };
          }
          return { ok: false, status: 404 };
        });

      globalThis.fetch = globalFetchMock as unknown as typeof fetch;

      try {
        const summary = await updateAllFromApi(database);
        expect(summary.moviesCount).toBe(1);
        expect(summary.genresCount).toBe(1);
        expect(summary.countriesCount).toBe(1);
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });
});
