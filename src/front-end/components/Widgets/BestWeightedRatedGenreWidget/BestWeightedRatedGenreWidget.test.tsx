// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import BestWeightedRatedGenreWidget from './BestWeightedRatedGenreWidget';

afterEach(cleanup);

describe('BestWeightedRatedGenreWidget', () => {
  it('renders nominal demonstration with "Animation" and "7,68 / 10"', () => {
    render(
      <BestWeightedRatedGenreWidget genreName="Animation" rating={7.68} />,
    );

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Meilleure note pondérée',
      }),
    ).toBeTruthy();
    expect(
      screen.getByTestId('best-weighted-rated-genre-name').textContent,
    ).toBe('Animation');
    expect(
      screen.getByTestId('best-weighted-rated-genre-value').textContent,
    ).toBe('7,68');
    expect(
      screen.getByTestId('best-weighted-rated-genre-scale').textContent,
    ).toBe('/ 10');
  });

  it('formats weighted rating with two decimal places in French locale', () => {
    render(<BestWeightedRatedGenreWidget genreName="Drame" rating={8} />);

    expect(
      screen.getByTestId('best-weighted-rated-genre-value').textContent,
    ).toBe('8,00');
  });

  it('renders loading state when loading is true', () => {
    render(<BestWeightedRatedGenreWidget loading={true} />);
    expect(screen.getByLabelText('Chargement en cours')).toBeTruthy();
    expect(screen.getByText('Chargement...')).toBeTruthy();
  });

  it('renders error message when error is provided', () => {
    render(
      <BestWeightedRatedGenreWidget error="Erreur de pondération bayésienne" />,
    );
    const alert = screen.getByRole('alert');
    expect(alert).toBeTruthy();
    expect(alert.textContent).toContain('Erreur de pondération bayésienne');
  });

  it('renders empty state when genreName or rating is absent or out of bounds', () => {
    const { rerender } = render(<BestWeightedRatedGenreWidget />);
    expect(screen.getByText('Aucune note pondérée')).toBeTruthy();
    expect(screen.getByText('—')).toBeTruthy();

    rerender(<BestWeightedRatedGenreWidget genreName="" rating={7.5} />);
    expect(screen.getByText('Aucune note pondérée')).toBeTruthy();

    rerender(<BestWeightedRatedGenreWidget genreName="Animation" rating={0} />);
    expect(screen.getByText('Aucune note pondérée')).toBeTruthy();

    rerender(
      <BestWeightedRatedGenreWidget genreName="Animation" rating={11} />,
    );
    expect(screen.getByText('Aucune note pondérée')).toBeTruthy();

    rerender(
      <BestWeightedRatedGenreWidget genreName="Animation" rating={null} />,
    );
    expect(screen.getByText('Aucune note pondérée')).toBeTruthy();

    rerender(
      <BestWeightedRatedGenreWidget genreName="Animation" rating={NaN} />,
    );
    expect(screen.getByText('Aucune note pondérée')).toBeTruthy();
  });
});
