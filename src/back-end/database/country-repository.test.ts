import { DatabaseSync } from 'node:sqlite';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { initializeSchema } from './schema';
import {
  getCountryByCode,
  listCountries,
  upsertCountries,
} from './country-repository';
import type { Country } from '../types/MoviesTypes';

describe('country-repository.ts', () => {
  let database: DatabaseSync;

  beforeEach(() => {
    database = new DatabaseSync(':memory:');
    initializeSchema(database);
  });

  afterEach(() => {
    database.close();
  });

  describe('getCountryByCode', () => {
    it('returns undefined when the country does not exist', () => {
      expect(getCountryByCode(database, 'FR')).toBeUndefined();
    });

    it('returns the country when it exists in the database', () => {
      upsertCountries(database, [{ code: 'FR', name: 'France' }]);

      const country = getCountryByCode(database, 'FR');
      expect(country).toEqual({ code: 'FR', name: 'France' });
    });
  });

  describe('listCountries', () => {
    it('returns an empty array when no countries exist', () => {
      expect(listCountries(database)).toEqual([]);
    });

    it('returns all countries ordered by code ascending', () => {
      upsertCountries(database, [
        { code: 'US', name: 'États-Unis' },
        { code: 'FR', name: 'France' },
        { code: 'DE', name: 'Allemagne' },
        { code: 'CA', name: 'Canada' },
      ]);

      const countries = listCountries(database);
      expect(countries).toEqual([
        { code: 'CA', name: 'Canada' },
        { code: 'DE', name: 'Allemagne' },
        { code: 'FR', name: 'France' },
        { code: 'US', name: 'États-Unis' },
      ]);
    });
  });

  describe('upsertCountries', () => {
    it('inserts countries from an array', () => {
      upsertCountries(database, [
        { code: 'FR', name: 'France' },
        { code: 'JP', name: 'Japon' },
      ]);

      expect(listCountries(database)).toEqual([
        { code: 'FR', name: 'France' },
        { code: 'JP', name: 'Japon' },
      ]);
    });

    it('updates existing countries without creating duplicates', () => {
      upsertCountries(database, [{ code: 'FR', name: 'Fr' }]);
      upsertCountries(database, [{ code: 'FR', name: 'France' }]);

      expect(listCountries(database)).toEqual([{ code: 'FR', name: 'France' }]);
    });

    it('handles different types of iterables like Set and Generator', () => {
      const setInput = new Set<Country>([
        { code: 'GB', name: 'Royaume-Uni' },
        { code: 'IT', name: 'Italie' },
      ]);
      upsertCountries(database, setInput);

      function* countryGenerator(): Generator<Country> {
        yield { code: 'ES', name: 'Espagne' };
        yield { code: 'KR', name: 'Corée du Sud' };
      }
      upsertCountries(database, countryGenerator());

      const countries = listCountries(database);
      expect(countries).toHaveLength(4);
      expect(getCountryByCode(database, 'GB')).toEqual({
        code: 'GB',
        name: 'Royaume-Uni',
      });
      expect(getCountryByCode(database, 'KR')).toEqual({
        code: 'KR',
        name: 'Corée du Sud',
      });
    });

    it('leaves data unchanged when given an empty iterable', () => {
      upsertCountries(database, [{ code: 'FR', name: 'France' }]);
      upsertCountries(database, []);
      upsertCountries(database, new Set());

      expect(listCountries(database)).toEqual([{ code: 'FR', name: 'France' }]);
    });

    it('preserves the last name when a code is repeated within the iterable', () => {
      const repeatedCountries: Country[] = [
        { code: 'US', name: 'USA initial' },
        { code: 'FR', name: 'France' },
        { code: 'US', name: 'USA intermédiaire' },
        { code: 'US', name: 'États-Unis' },
      ];
      upsertCountries(database, repeatedCountries);

      expect(getCountryByCode(database, 'US')).toEqual({
        code: 'US',
        name: 'États-Unis',
      });
    });

    it('throws an error and rolls back when country code or name is invalid', () => {
      upsertCountries(database, [{ code: 'FR', name: 'France' }]);

      expect(() =>
        upsertCountries(database, [{ code: '', name: 'Empty' }]),
      ).toThrow(/Invalid country data/);

      expect(() =>
        upsertCountries(database, [{ code: 'DE', name: '' }]),
      ).toThrow(/Invalid country data/);

      expect(() =>
        upsertCountries(database, [{ code: '   ', name: 'Spaces' }]),
      ).toThrow(/Invalid country data/);

      expect(() =>
        upsertCountries(database, [{ code: 'ES', name: '   ' }]),
      ).toThrow(/Invalid country data/);

      expect(() =>
        upsertCountries(database, [{ code: 'IT' } as unknown as Country]),
      ).toThrow(/Invalid country data/);

      expect(() =>
        upsertCountries(database, [null as unknown as Country]),
      ).toThrow(/Invalid country data/);

      // Verify rollback preserved existing state
      expect(listCountries(database)).toEqual([{ code: 'FR', name: 'France' }]);
    });
  });
});
