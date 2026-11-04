import type { Express, Request, RequestHandler, Response } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_LANGUAGE,
  DEFAULT_PAGE,
  DEFAULT_REGION,
} from '../utils/constants';
import { tmdbAccessToken } from '../utils/config';
import { registerDiscoverApi } from './discover-api';
import type {
  Movie,
  TmdbMovie,
  TmdbMoviesRawResponse,
} from '../types/MoviesTypes';

const { toSupportedMovieMock } = vi.hoisted(() => ({
  toSupportedMovieMock: vi.fn(),
}));

vi.mock('../utils/converter', () => ({
  toSupportedMovie: toSupportedMovieMock,
}));

vi.mock('../utils/config', () => ({
  tmdbAccessToken: 'test-access-token',
}));

type RouteHandler = (
  req: Request,
  res: Response,
  next?: (error?: unknown) => void,
) => void | Promise<void>;

const handlers = new Map<string, RequestHandler>();
const app = {
  get: (path: string, handler: RequestHandler) => handlers.set(path, handler),
} as unknown as Express;

function getHandler(path: string): RouteHandler {
  const handler = handlers.get(path);
  if (!handler) throw new Error(`No handler registered for ${path}`);
  return handler as RouteHandler;
}

function createResponse() {
  const response = { json: vi.fn(), status: vi.fn() };
  response.status.mockReturnValue(response);
  return response as unknown as Response & {
    json: ReturnType<typeof vi.fn>;
    status: ReturnType<typeof vi.fn>;
  };
}

function tmdbResponse(data: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: () =>
      ok ? Promise.resolve(data) : Promise.reject(new Error('Invalid JSON')),
  };
}

describe('discover-api.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    handlers.clear();
    registerDiscoverApi(app);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/discover/movies', () => {
    const rawMovie: TmdbMovie = {
      adult: false,
      backdrop_path: '/path.jpg',
      genre_ids: [28, 12],
      id: 101,
      original_language: 'en',
      original_title: 'Raw Movie',
      overview: 'Overview',
      popularity: 88.5,
      poster_path: '/poster.jpg',
      release_date: '2020-05-15',
      title: 'Supported Movie',
      video: false,
      vote_average: 7.8,
      vote_count: 1500,
    };

    const supportedMovie: Movie = {
      backdrop_path: '/path.jpg',
      genre_ids: [28, 12],
      id: 101,
      original_language: 'en',
      original_title: 'Raw Movie',
      overview: 'Overview',
      popularity: 88.5,
      poster_path: '/poster.jpg',
      release_date: '2020-05-15',
      title: 'Supported Movie',
      vote_average: 7.8,
      vote_count: 1500,
    };

    it('queries TMDB Discover with default options when only valid year is provided', async () => {
      const rawTmdbData: TmdbMoviesRawResponse = {
        page: 1,
        results: [rawMovie],
        total_pages: 5,
        total_results: 100,
      };

      toSupportedMovieMock.mockReturnValue(supportedMovie);
      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(
          tmdbResponse(rawTmdbData) as unknown as globalThis.Response,
        );

      const req = {
        query: { year: '2020' },
      } as unknown as Request;
      const res = createResponse();

      const handler = getHandler('/api/discover/movies');
      await handler(req, res);

      const expectedUrl = `https://api.themoviedb.org/3/discover/movie?primary_release_year=2020&language=${DEFAULT_LANGUAGE}&page=${DEFAULT_PAGE}&region=${DEFAULT_REGION}`;
      expect(fetchSpy).toHaveBeenCalledWith(expectedUrl, {
        headers: {
          Authorization: `Bearer ${tmdbAccessToken}`,
          'Content-Type': 'application/json;charset=utf-8',
        },
      });

      expect(toSupportedMovieMock).toHaveBeenCalledWith(rawMovie, 0, [
        rawMovie,
      ]);
      expect(res.json).toHaveBeenCalledWith({
        page: 1,
        results: [supportedMovie],
        total_pages: 5,
        total_results: 100,
      });
      expect(res.status).not.toHaveBeenCalled();
    });

    it('queries TMDB Discover with custom language, page, and region', async () => {
      const rawTmdbData: TmdbMoviesRawResponse = {
        page: 2,
        results: [rawMovie],
        total_pages: 10,
        total_results: 200,
      };

      toSupportedMovieMock.mockReturnValue(supportedMovie);
      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(
          tmdbResponse(rawTmdbData) as unknown as globalThis.Response,
        );

      const req = {
        query: {
          year: '2019',
          language: 'en-US',
          page: '2',
          region: 'US',
        },
      } as unknown as Request;
      const res = createResponse();

      const handler = getHandler('/api/discover/movies');
      await handler(req, res);

      const expectedUrl =
        'https://api.themoviedb.org/3/discover/movie?primary_release_year=2019&language=en-US&page=2&region=US';
      expect(fetchSpy).toHaveBeenCalledWith(expectedUrl, {
        headers: {
          Authorization: `Bearer ${tmdbAccessToken}`,
          'Content-Type': 'application/json;charset=utf-8',
        },
      });

      expect(res.json).toHaveBeenCalledWith({
        page: 2,
        results: [supportedMovie],
        total_pages: 10,
        total_results: 200,
      });
    });

    it('handles an empty results list from TMDB and preserves pagination info', async () => {
      const emptyTmdbData: TmdbMoviesRawResponse = {
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0,
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        tmdbResponse(emptyTmdbData) as unknown as globalThis.Response,
      );

      const req = {
        query: { year: '2025' },
      } as unknown as Request;
      const res = createResponse();

      const handler = getHandler('/api/discover/movies');
      await handler(req, res);

      expect(toSupportedMovieMock).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0,
      });
    });

    it('returns 400 when year parameter is missing, invalid or structured', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch');
      const handler = getHandler('/api/discover/movies');

      const invalidCases = [
        {},
        { year: '' },
        { year: '   ' },
        { year: '20' },
        { year: '20202' },
        { year: 'abcd' },
        { year: '0999' },
        { year: ['2020', '2021'] },
        { year: { value: '2020' } },
      ];

      for (const query of invalidCases) {
        const req = { query } as unknown as Request;
        const res = createResponse();

        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: expect.stringMatching(/Invalid or missing year parameter/),
          }),
        );
      }

      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('logs error and returns 500 when TMDB returns a non-OK HTTP status', async () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 401,
      } as unknown as globalThis.Response);

      const req = {
        query: { year: '2020' },
      } as unknown as Request;
      const res = createResponse();

      const handler = getHandler('/api/discover/movies');
      await handler(req, res);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error discovering movies:',
        expect.any(Error),
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to discover movies',
      });
    });

    it('logs error and returns 500 when fetch throws a network error', async () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(
        new Error('Network connection failed'),
      );

      const req = {
        query: { year: '2020' },
      } as unknown as Request;
      const res = createResponse();

      const handler = getHandler('/api/discover/movies');
      await handler(req, res);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error discovering movies:',
        expect.any(Error),
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to discover movies',
      });
    });

    it('logs error and returns 500 when response JSON parsing fails', async () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.reject(new Error('SyntaxError: Unexpected token')),
      } as unknown as globalThis.Response);

      const req = {
        query: { year: '2020' },
      } as unknown as Request;
      const res = createResponse();

      const handler = getHandler('/api/discover/movies');
      await handler(req, res);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error discovering movies:',
        expect.any(Error),
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to discover movies',
      });
    });
  });
});
