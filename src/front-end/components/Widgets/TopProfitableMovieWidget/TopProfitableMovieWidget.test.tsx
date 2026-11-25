// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import TopProfitableMovieWidget from './TopProfitableMovieWidget';

afterEach(cleanup);

describe('TopProfitableMovieWidget', () => {
  it('renders nominal demonstration with 69 667,36 % ROI, poster, title, and year', () => {
    render(
      <TopProfitableMovieWidget
        title="Paranormal Activity"
        releaseYear={2009}
        roi={69667.36}
        posterPath="/paranormal-activity.jpg"
      />,
    );

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Film le plus rentable',
      }),
    ).toBeTruthy();
    expect(screen.getByTestId('top-profitable-title').textContent).toBe(
      'Paranormal Activity',
    );
    expect(screen.getByTestId('top-profitable-year').textContent).toBe('2009');
    expect(screen.getByTestId('top-profitable-value').textContent).toMatch(
      /69\s?667,36\s?%/,
    );
    expect(screen.getByText('ROI')).toBeTruthy();

    const posterImg = screen.getByRole('img', {
      name: 'Affiche de Paranormal Activity',
    });
    expect(posterImg.getAttribute('src')).toBe('/paranormal-activity.jpg');
  });

  it('preserves full URL or leading absolute path when posterPath starts with http or /', () => {
    render(
      <TopProfitableMovieWidget
        title="Mad Max"
        releaseYear="1979"
        roi={24800.0}
        posterPath="https://example.com/madmax.jpg"
      />,
    );

    const posterImg = screen.getByRole('img', {
      name: 'Affiche de Mad Max',
    });
    expect(posterImg.getAttribute('src')).toBe(
      'https://example.com/madmax.jpg',
    );
    expect(screen.getByTestId('top-profitable-value').textContent).toMatch(
      /24\s?800,00\s?%/,
    );
  });

  it('prepends TMDB base URL when posterPath is relative without leading slash', () => {
    render(
      <TopProfitableMovieWidget
        title="Rocky"
        releaseYear={1976}
        roi={11600.5}
        posterPath="rocky.jpg"
      />,
    );

    const posterImg = screen.getByRole('img', {
      name: 'Affiche de Rocky',
    });
    expect(posterImg.getAttribute('src')).toBe(
      'https://image.tmdb.org/t/p/w200rocky.jpg',
    );
  });

  it('renders explicit poster placeholder when posterPath is absent or empty', () => {
    const { rerender } = render(
      <TopProfitableMovieWidget
        title="Halloween"
        releaseYear={1978}
        roi={14500.2}
        posterPath={null}
      />,
    );

    expect(
      screen.getByRole('img', { name: 'Affiche non disponible' }),
    ).toBeTruthy();
    expect(screen.getByText('Sans affiche')).toBeTruthy();

    rerender(
      <TopProfitableMovieWidget
        title="Halloween"
        releaseYear={1978}
        roi={14500.2}
        posterPath=""
      />,
    );
    expect(
      screen.getByRole('img', { name: 'Affiche non disponible' }),
    ).toBeTruthy();
  });

  it('renders "Année inconnue" when releaseYear is absent or empty', () => {
    const { rerender } = render(
      <TopProfitableMovieWidget
        title="Film Inconnu"
        releaseYear={null}
        roi={500.1}
      />,
    );
    expect(screen.getByTestId('top-profitable-year').textContent).toBe(
      'Année inconnue',
    );

    rerender(
      <TopProfitableMovieWidget
        title="Film Inconnu"
        releaseYear="   "
        roi={500.1}
      />,
    );
    expect(screen.getByTestId('top-profitable-year').textContent).toBe(
      'Année inconnue',
    );
  });

  it('renders loading state when loading is true', () => {
    render(<TopProfitableMovieWidget loading={true} />);
    expect(screen.getByLabelText('Chargement en cours')).toBeTruthy();
    expect(screen.getByText('Chargement...')).toBeTruthy();
  });

  it('renders error message when error is provided', () => {
    render(<TopProfitableMovieWidget error="Erreur de calcul du ROI" />);
    const alert = screen.getByRole('alert');
    expect(alert).toBeTruthy();
    expect(alert.textContent).toContain('Erreur de calcul du ROI');
  });

  it('renders empty state when title or roi is missing or invalid', () => {
    const { rerender } = render(<TopProfitableMovieWidget />);
    expect(screen.getByText('Aucun film éligible')).toBeTruthy();
    expect(screen.getByText('—')).toBeTruthy();

    rerender(
      <TopProfitableMovieWidget title="" releaseYear={2020} roi={150.0} />,
    );
    expect(screen.getByText('Aucun film éligible')).toBeTruthy();

    rerender(
      <TopProfitableMovieWidget title="Film" releaseYear={2020} roi={NaN} />,
    );
    expect(screen.getByText('Aucun film éligible')).toBeTruthy();
  });
});
