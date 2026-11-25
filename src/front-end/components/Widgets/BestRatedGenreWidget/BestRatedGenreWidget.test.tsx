// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import BestRatedGenreWidget from './BestRatedGenreWidget';

afterEach(cleanup);

describe('BestRatedGenreWidget', () => {
  it('renders nominal demonstration with "Animation" and "7,41 / 10"', () => {
    render(<BestRatedGenreWidget genreName="Animation" rating={7.41} />);

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Meilleure note',
      }),
    ).toBeTruthy();
    expect(screen.getByTestId('best-rated-genre-name').textContent).toBe(
      'Animation',
    );
    expect(screen.getByTestId('best-rated-genre-value').textContent).toBe(
      '7,41',
    );
    expect(screen.getByTestId('best-rated-genre-scale').textContent).toBe(
      '/ 10',
    );
  });

  it('formats rating with two decimal places in French locale', () => {
    render(<BestRatedGenreWidget genreName="Drame" rating={8} />);

    expect(screen.getByTestId('best-rated-genre-value').textContent).toBe(
      '8,00',
    );
  });

  it('renders loading state when loading is true', () => {
    render(<BestRatedGenreWidget loading={true} />);
    expect(screen.getByLabelText('Chargement en cours')).toBeTruthy();
    expect(screen.getByText('Chargement...')).toBeTruthy();
  });

  it('renders error message when error is provided', () => {
    render(
      <BestRatedGenreWidget error="Erreur lors du calcul de la meilleure note" />,
    );
    const alert = screen.getByRole('alert');
    expect(alert).toBeTruthy();
    expect(alert.textContent).toContain(
      'Erreur lors du calcul de la meilleure note',
    );
  });

  it('renders empty state when genreName or rating is absent or out of bounds', () => {
    const { rerender } = render(<BestRatedGenreWidget />);
    expect(screen.getByText('Aucune note')).toBeTruthy();
    expect(screen.getByText('—')).toBeTruthy();

    rerender(<BestRatedGenreWidget genreName="" rating={7.5} />);
    expect(screen.getByText('Aucune note')).toBeTruthy();

    rerender(<BestRatedGenreWidget genreName="Animation" rating={0} />);
    expect(screen.getByText('Aucune note')).toBeTruthy();

    rerender(<BestRatedGenreWidget genreName="Animation" rating={11} />);
    expect(screen.getByText('Aucune note')).toBeTruthy();

    rerender(<BestRatedGenreWidget genreName="Animation" rating={null} />);
    expect(screen.getByText('Aucune note')).toBeTruthy();

    rerender(<BestRatedGenreWidget genreName="Animation" rating={NaN} />);
    expect(screen.getByText('Aucune note')).toBeTruthy();
  });
});
