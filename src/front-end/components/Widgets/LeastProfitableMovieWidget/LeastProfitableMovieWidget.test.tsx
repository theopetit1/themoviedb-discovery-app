// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import LeastProfitableMovieWidget from './LeastProfitableMovieWidget';

afterEach(cleanup);

describe('LeastProfitableMovieWidget', () => {
  it('renders nominal demonstration with -99,99 % ROI, poster, title, and year', () => {
    render(
      <LeastProfitableMovieWidget
        title="The 13th Warrior"
        releaseYear={1999}
        roi={-99.99}
        posterPath="/13th-warrior.jpg"
      />,
    );

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Film le moins rentable',
      }),
    ).toBeTruthy();
    expect(screen.getByTestId('least-profitable-title').textContent).toBe(
      'The 13th Warrior',
    );
    expect(screen.getByTestId('least-profitable-year').textContent).toBe(
      '1999',
    );
    expect(screen.getByTestId('least-profitable-value').textContent).toMatch(
      /-99,99\s?%/,
    );
    expect(screen.getByText('ROI')).toBeTruthy();

    const posterImg = screen.getByRole('img', {
      name: 'Affiche de The 13th Warrior',
    });
    expect(posterImg.getAttribute('src')).toBe('/13th-warrior.jpg');
  });

  it('preserves full URL when posterPath starts with http', () => {
    render(
      <LeastProfitableMovieWidget
        title="John Carter"
        releaseYear="2012"
        roi={-62.5}
        posterPath="https://example.com/john-carter.jpg"
      />,
    );

    const posterImg = screen.getByRole('img', {
      name: 'Affiche de John Carter',
    });
    expect(posterImg.getAttribute('src')).toBe(
      'https://example.com/john-carter.jpg',
    );
    expect(screen.getByTestId('least-profitable-value').textContent).toMatch(
      /-62,50\s?%/,
    );
  });

  it('prepends TMDB base URL when posterPath is relative without leading slash', () => {
    render(
      <LeastProfitableMovieWidget
        title="Sinbad"
        releaseYear={2003}
        roi={-55.8}
        posterPath="sinbad.jpg"
      />,
    );

    const posterImg = screen.getByRole('img', {
      name: 'Affiche de Sinbad',
    });
    expect(posterImg.getAttribute('src')).toBe(
      'https://image.tmdb.org/t/p/w200sinbad.jpg',
    );
  });

  it('renders explicit poster placeholder when posterPath is absent or empty', () => {
    const { rerender } = render(
      <LeastProfitableMovieWidget
        title="Mars Needs Moms"
        releaseYear={2011}
        roi={-74.2}
        posterPath={null}
      />,
    );

    expect(
      screen.getByRole('img', { name: 'Affiche non disponible' }),
    ).toBeTruthy();
    expect(screen.getByText('Sans affiche')).toBeTruthy();

    rerender(
      <LeastProfitableMovieWidget
        title="Mars Needs Moms"
        releaseYear={2011}
        roi={-74.2}
        posterPath=""
      />,
    );
    expect(
      screen.getByRole('img', { name: 'Affiche non disponible' }),
    ).toBeTruthy();
  });

  it('renders "Année inconnue" when releaseYear is absent or empty', () => {
    const { rerender } = render(
      <LeastProfitableMovieWidget
        title="Film Déficitaire"
        releaseYear={null}
        roi={-30.0}
      />,
    );
    expect(screen.getByTestId('least-profitable-year').textContent).toBe(
      'Année inconnue',
    );

    rerender(
      <LeastProfitableMovieWidget
        title="Film Déficitaire"
        releaseYear="   "
        roi={-30.0}
      />,
    );
    expect(screen.getByTestId('least-profitable-year').textContent).toBe(
      'Année inconnue',
    );
  });

  it('renders loading state when loading is true', () => {
    render(<LeastProfitableMovieWidget loading={true} />);
    expect(screen.getByLabelText('Chargement en cours')).toBeTruthy();
    expect(screen.getByText('Chargement...')).toBeTruthy();
  });

  it('renders error message when error is provided', () => {
    render(<LeastProfitableMovieWidget error="Erreur de calcul du déficit" />);
    const alert = screen.getByRole('alert');
    expect(alert).toBeTruthy();
    expect(alert.textContent).toContain('Erreur de calcul du déficit');
  });

  it('renders empty state when title or roi is missing or invalid', () => {
    const { rerender } = render(<LeastProfitableMovieWidget />);
    expect(screen.getByText('Aucun film éligible')).toBeTruthy();
    expect(screen.getByText('—')).toBeTruthy();

    rerender(
      <LeastProfitableMovieWidget title="" releaseYear={2020} roi={-10.0} />,
    );
    expect(screen.getByText('Aucun film éligible')).toBeTruthy();

    rerender(
      <LeastProfitableMovieWidget title="Film" releaseYear={2020} roi={NaN} />,
    );
    expect(screen.getByText('Aucun film éligible')).toBeTruthy();
  });
});
