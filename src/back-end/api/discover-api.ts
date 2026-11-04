import type { Express } from 'express';
import express from 'express';
import {
  DEFAULT_LANGUAGE,
  DEFAULT_PAGE,
  DEFAULT_REGION,
} from '../utils/constants.ts';
import { tmdbAccessToken } from '../utils/config.ts';
import { toSupportedMovie } from '../utils/converter.ts';
import type {
  MoviesApiResponse,
  TmdbMoviesRawResponse,
} from '../types/MoviesTypes.ts';

/**
 * Registers the discover API route on the given Express application instance.
 * @param app - The Express application instance to register the discover API route on.
 */
export function registerDiscoverApi(app: Express): void {
  app.get(
    '/api/discover/movies',
    async (req: express.Request, res: express.Response): Promise<void> => {
      const year = req.query.year;

      // Validate year parameter: must be a 4-digit string between 1000 and 9999
      if (
        typeof year !== 'string' ||
        !/^\d{4}$/.test(year) ||
        Number(year) < 1000 ||
        Number(year) > 9999
      ) {
        res.status(400).json({
          error:
            'Invalid or missing year parameter: must be a 4-digit string between 1000 and 9999',
        });
        return;
      }

      // Resolve optional parameters with their default values
      const language =
        typeof req.query.language === 'string' &&
        req.query.language.trim() !== ''
          ? req.query.language.trim()
          : DEFAULT_LANGUAGE;

      const page =
        typeof req.query.page === 'string' && req.query.page.trim() !== ''
          ? req.query.page.trim()
          : String(DEFAULT_PAGE);

      const region =
        typeof req.query.region === 'string' && req.query.region.trim() !== ''
          ? req.query.region.trim()
          : DEFAULT_REGION;

      try {
        const queryParams = new URLSearchParams({
          primary_release_year: year,
          language,
          page,
          region,
        });

        const response = await fetch(
          `https://api.themoviedb.org/3/discover/movie?${queryParams.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${tmdbAccessToken}`,
              'Content-Type': 'application/json;charset=utf-8',
            },
          },
        );

        if (!response.ok) {
          throw new Error(
            `TMDB API request failed with status ${response.status}`,
          );
        }

        const rawData = (await response.json()) as TmdbMoviesRawResponse;

        const data: MoviesApiResponse = {
          page: rawData.page,
          results: rawData.results.map(toSupportedMovie),
          total_pages: rawData.total_pages,
          total_results: rawData.total_results,
        };

        res.json(data);
      } catch (error) {
        console.error('Error discovering movies:', error);
        res.status(500).json({ error: 'Failed to discover movies' });
      }
    },
  );
}
