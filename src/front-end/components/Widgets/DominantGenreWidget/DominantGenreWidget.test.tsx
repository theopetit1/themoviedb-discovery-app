// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import DominantGenreWidget from './DominantGenreWidget';

afterEach(cleanup);

describe('DominantGenreWidget', () => {
  it('renders nominal demonstration with "Drame" and "488 films"', () => {
    render(<DominantGenreWidget genreName="Drame" movieCount={488} />);

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Genre dominant',
      }),
    ).toBeTruthy();
    expect(screen.getByTestId('dominant-genre-name').textContent).toBe('Drame');
    expect(screen.getByTestId('dominant-genre-count').textContent).toBe('488');
    expect(screen.getByTestId('dominant-genre-unit').textContent).toBe('films');
  });

  it('renders singular unit "film" when movieCount is 1', () => {
    render(<DominantGenreWidget genreName="Western" movieCount={1} />);

    expect(screen.getByTestId('dominant-genre-name').textContent).toBe(
      'Western',
    );
    expect(screen.getByTestId('dominant-genre-count').textContent).toBe('1');
    expect(screen.getByTestId('dominant-genre-unit').textContent).toBe('film');
  });

  it('formats large counts with French number formatting', () => {
    render(<DominantGenreWidget genreName="Comédie" movieCount={1450} />);

    expect(screen.getByTestId('dominant-genre-count').textContent).toMatch(
      /1\s?450/,
    );
    expect(screen.getByTestId('dominant-genre-unit').textContent).toBe('films');
  });

  it('renders loading state when loading is true', () => {
    render(<DominantGenreWidget loading={true} />);
    expect(screen.getByLabelText('Chargement en cours')).toBeTruthy();
    expect(screen.getByText('Chargement...')).toBeTruthy();
  });

  it('renders error message when error is provided', () => {
    render(
      <DominantGenreWidget error="Erreur lors de la détermination du genre" />,
    );
    const alert = screen.getByRole('alert');
    expect(alert).toBeTruthy();
    expect(alert.textContent).toContain(
      'Erreur lors de la détermination du genre',
    );
  });

  it('renders empty state when genreName or movieCount is absent or invalid', () => {
    const { rerender } = render(<DominantGenreWidget />);
    expect(screen.getByText('Aucun genre connu')).toBeTruthy();
    expect(screen.getByText('—')).toBeTruthy();

    rerender(<DominantGenreWidget genreName="" movieCount={10} />);
    expect(screen.getByText('Aucun genre connu')).toBeTruthy();

    rerender(<DominantGenreWidget genreName="Drame" movieCount={0} />);
    expect(screen.getByText('Aucun genre connu')).toBeTruthy();

    rerender(<DominantGenreWidget genreName="Drame" movieCount={null} />);
    expect(screen.getByText('Aucun genre connu')).toBeTruthy();
  });
});
