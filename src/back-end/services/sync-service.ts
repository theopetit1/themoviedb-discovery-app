import type { DatabaseSync } from 'node:sqlite';
import { tmdbAccessToken } from '../utils/config.ts';
import { upsertGenres } from '../database/genre-repository.ts';
import { upsertCountries } from '../database/country-repository.ts';
import { upsertMovies } from '../database/movie-repository.ts';
import type { Country, DbMovie, Genre } from '../types/MoviesTypes.ts';

export type SyncServiceOptions = {
  apiBaseUrl?: string;
  accessToken?: string;
  fetchFn?: typeof fetch;
};

export type SyncSummary = {
  genresCount: number;
  countriesCount: number;
  moviesCount: number;
};

type TmdbCountryResponse = {
  iso_3166_1: string;
  english_name: string;
  native_name?: string;
};

type TmdbMovieFullDetails = {
  id: number;
  title: string;
  original_title: string;
  original_language: string;
  overview: string;
  release_date?: string | null;
  popularity?: number | null;
  vote_average?: number | null;
  vote_count?: number | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  runtime?: number | null;
  runtime_minutes?: number | null;
  budget?: number | null;
  revenue?: number | null;
  genres?: Array<{ id: number; name: string }>;
  genre_ids?: number[];
  production_countries?: Array<{
    iso_3166_1?: string;
    code?: string;
    name: string;
  }>;
  production_country_codes?: string[];
};

/**
 * Updates the genres catalog in the database by fetching the latest genres from TMDB API.
 * @param database The SQLite database connection.
 * @param options Configuration options including custom fetch or token.
 * @returns Array of updated Genre objects.
 */
export async function updateGenresFromApi(
  database: DatabaseSync,
  options?: SyncServiceOptions,
): Promise<Genre[]> {
  const fetcher = options?.fetchFn ?? fetch;
  const token = options?.accessToken ?? tmdbAccessToken;
  const baseUrl = options?.apiBaseUrl ?? 'https://api.themoviedb.org/3';

  const response = await fetcher(`${baseUrl}/genre/movie/list`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json;charset=utf-8',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch genres from API: HTTP ${response.status}`);
  }

  const data = (await response.json()) as {
    genres?: Array<{ id: number; name: string }>;
  };
  const rawGenres = data.genres ?? [];

  const genres: Genre[] = rawGenres
    .filter((g) => typeof g.id === 'number' && typeof g.name === 'string')
    .map((g) => ({ id: g.id, name: g.name.trim() }));

  upsertGenres(database, genres);
  return genres;
}

/**
 * Updates the countries catalog in the database by fetching supported countries from TMDB configuration API.
 * @param database The SQLite database connection.
 * @param options Configuration options including custom fetch or token.
 * @returns Array of updated Country objects.
 */
export async function updateCountriesFromApi(
  database: DatabaseSync,
  options?: SyncServiceOptions,
): Promise<Country[]> {
  const fetcher = options?.fetchFn ?? fetch;
  const token = options?.accessToken ?? tmdbAccessToken;
  const baseUrl = options?.apiBaseUrl ?? 'https://api.themoviedb.org/3';

  const response = await fetcher(`${baseUrl}/configuration/countries`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json;charset=utf-8',
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch countries from API: HTTP ${response.status}`,
    );
  }

  const rawCountries = (await response.json()) as TmdbCountryResponse[];
  const codeRegex = /^[A-Z]{2}$/;

  const countries: Country[] = [];
  for (const c of rawCountries) {
    const code = (c.iso_3166_1 ?? '').trim().toUpperCase();
    const name = (c.english_name || c.native_name || '').trim();
    if (codeRegex.test(code) && name.length > 0) {
      countries.push({ code, name });
    }
  }

  upsertCountries(database, countries);
  return countries;
}

/**
 * Updates or creates a movie in the database with full metadata and associations from API.
 * Also synchronizes its embedded genres and production countries.
 * @param database The SQLite database connection.
 * @param movieId The TMDB movie identifier.
 * @param options Configuration options including custom fetch or token.
 * @returns The persisted DbMovie object.
 */
export async function updateMovieDetailsFromApi(
  database: DatabaseSync,
  movieId: number,
  options?: SyncServiceOptions,
): Promise<DbMovie> {
  const fetcher = options?.fetchFn ?? fetch;
  const token = options?.accessToken ?? tmdbAccessToken;
  const baseUrl = options?.apiBaseUrl ?? 'https://api.themoviedb.org/3';

  const response = await fetcher(`${baseUrl}/movie/${movieId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json;charset=utf-8',
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch movie details for ID ${movieId} from API: HTTP ${response.status}`,
    );
  }

  const details = (await response.json()) as TmdbMovieFullDetails;

  // Synchronize embedded genres if available
  const genreIds: number[] = [];
  if (Array.isArray(details.genres) && details.genres.length > 0) {
    const validGenres: Genre[] = details.genres
      .filter((g) => typeof g.id === 'number' && typeof g.name === 'string')
      .map((g) => ({ id: g.id, name: g.name.trim() }));
    if (validGenres.length > 0) {
      upsertGenres(database, validGenres);
      genreIds.push(...validGenres.map((g) => g.id));
    }
  } else if (Array.isArray(details.genre_ids)) {
    genreIds.push(...details.genre_ids);
  }

  // Synchronize embedded production countries if available
  const productionCountryCodes: string[] = [];
  if (
    Array.isArray(details.production_countries) &&
    details.production_countries.length > 0
  ) {
    const codeRegex = /^[A-Z]{2}$/;
    const validCountries: Country[] = [];
    for (const item of details.production_countries) {
      const code = (item.iso_3166_1 ?? '').trim().toUpperCase();
      const name = (item.name ?? '').trim();
      if (codeRegex.test(code) && name.length > 0) {
        validCountries.push({ code, name });
        productionCountryCodes.push(code);
      }
    }
    if (validCountries.length > 0) {
      upsertCountries(database, validCountries);
    }
  } else if (Array.isArray(details.production_country_codes)) {
    productionCountryCodes.push(...details.production_country_codes);
  }

  const runtime = details.runtime ?? details.runtime_minutes ?? null;
  const validRuntime =
    runtime !== null && runtime > 0 && Number.isSafeInteger(runtime)
      ? runtime
      : null;

  const validBudget =
    typeof details.budget === 'number' &&
    details.budget > 0 &&
    Number.isSafeInteger(details.budget)
      ? details.budget
      : null;

  const validRevenue =
    typeof details.revenue === 'number' &&
    details.revenue > 0 &&
    Number.isSafeInteger(details.revenue)
      ? details.revenue
      : null;

  const validVoteAverage =
    typeof details.vote_average === 'number' &&
    details.vote_average >= 0 &&
    details.vote_average <= 10
      ? details.vote_average
      : null;

  const validPopularity =
    typeof details.popularity === 'number' && details.popularity >= 0
      ? details.popularity
      : null;

  const validVoteCount =
    typeof details.vote_count === 'number' &&
    details.vote_count >= 0 &&
    Number.isSafeInteger(details.vote_count)
      ? details.vote_count
      : null;

  const dbMovie: DbMovie = {
    id: details.id,
    title: details.title.trim(),
    original_title: details.original_title.trim(),
    original_language: details.original_language.trim(),
    overview: details.overview ?? '',
    release_date: details.release_date || null,
    popularity: validPopularity,
    vote_average: validVoteAverage,
    vote_count: validVoteCount,
    poster_path: details.poster_path || null,
    backdrop_path: details.backdrop_path || null,
    runtime_minutes: validRuntime,
    budget: validBudget,
    revenue: validRevenue,
    collected_at: new Date().toISOString(),
    genre_ids: Array.from(new Set(genreIds)),
    production_country_codes: Array.from(new Set(productionCountryCodes)),
  };

  upsertMovies(database, [dbMovie]);
  return dbMovie;
}

/**
 * Updates popular movies in the database by querying the popular movies endpoint
 * and enriching each movie with full details.
 * @param database The SQLite database connection.
 * @param options Query and configuration options.
 * @returns Array of updated DbMovie objects.
 */
export async function updatePopularMoviesFromApi(
  database: DatabaseSync,
  options?: SyncServiceOptions & {
    page?: number;
    region?: string;
    language?: string;
  },
): Promise<DbMovie[]> {
  const fetcher = options?.fetchFn ?? fetch;
  const token = options?.accessToken ?? tmdbAccessToken;
  const baseUrl = options?.apiBaseUrl ?? 'https://api.themoviedb.org/3';
  const page = options?.page ?? 1;

  const queryParams = new URLSearchParams({
    page: String(page),
  });
  if (options?.language) queryParams.set('language', options.language);
  if (options?.region) queryParams.set('region', options.region);

  const response = await fetcher(
    `${baseUrl}/movie/popular?${queryParams.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json;charset=utf-8',
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch popular movies from API: HTTP ${response.status}`,
    );
  }

  const rawData = (await response.json()) as {
    results?: Array<{ id: number }>;
  };
  const results = rawData.results ?? [];

  const movies: DbMovie[] = [];
  for (const item of results) {
    const updatedMovie = await updateMovieDetailsFromApi(
      database,
      item.id,
      options,
    );
    movies.push(updatedMovie);
  }

  return movies;
}

/**
 * Full synchronization of catalog genres, countries, and popular movies.
 * @param database The SQLite database connection.
 * @param options Configuration options.
 * @returns Summary of synchronized entity counts.
 */
export async function updateAllFromApi(
  database: DatabaseSync,
  options?: SyncServiceOptions & { pages?: number },
): Promise<SyncSummary> {
  const genres = await updateGenresFromApi(database, options);
  const countries = await updateCountriesFromApi(database, options);

  const pages = options?.pages ?? 1;
  let moviesCount = 0;

  for (let p = 1; p <= pages; p++) {
    const movies = await updatePopularMoviesFromApi(database, {
      ...options,
      page: p,
    });
    moviesCount += movies.length;
  }

  return {
    genresCount: genres.length,
    countriesCount: countries.length,
    moviesCount,
  };
}
