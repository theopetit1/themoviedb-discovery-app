// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import MoviesCountWidget from './MoviesCountWidget';

afterEach(cleanup);

describe('MoviesCountWidget', () => {
  it('renders the nominal state with formatted count and plural unit', () => {
    render(<MoviesCountWidget count={1250} />);

    expect(
      screen.getByRole('heading', { level: 3, name: 'Films en base' }),
    ).toBeTruthy();
    expect(screen.getByTestId('movies-count-value').textContent).toMatch(
      /1\s?250/,
    );
    expect(screen.getByText('films enregistrés')).toBeTruthy();
  });

  it('renders the singular unit when count is 1', () => {
    render(<MoviesCountWidget count={1} />);

    expect(screen.getByTestId('movies-count-value').textContent).toBe('1');
    expect(screen.getByText('film enregistré')).toBeTruthy();
  });

  it('renders 0 correctly with plural unit', () => {
    render(<MoviesCountWidget count={0} />);

    expect(screen.getByTestId('movies-count-value').textContent).toBe('0');
    expect(screen.getByText('film enregistré')).toBeTruthy();
  });

  it('renders the loading state when loading is true', () => {
    render(<MoviesCountWidget loading={true} />);

    expect(screen.getByLabelText('Chargement en cours')).toBeTruthy();
    expect(screen.getByText('Chargement...')).toBeTruthy();
    expect(screen.queryByTestId('movies-count-value')).toBeNull();
  });

  it('renders the error state when an error message is provided', () => {
    render(<MoviesCountWidget error="Erreur de connexion" />);

    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText('Erreur de connexion')).toBeTruthy();
  });

  it('renders the empty state when count is null or undefined', () => {
    const { rerender } = render(<MoviesCountWidget count={null} />);

    expect(screen.getByText('—')).toBeTruthy();
    expect(screen.getByText('Aucune donnée')).toBeTruthy();

    rerender(<MoviesCountWidget count={undefined} />);
    expect(screen.getByText('—')).toBeTruthy();
  });
});
