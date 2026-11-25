// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import TopRatedMovieWidget from './TopRatedMovieWidget';

afterEach(cleanup);

describe('TopRatedMovieWidget', () => {
  it('renders nominal demonstration with 9,1 / 10 rating, poster, title, and year', () => {
    render(
      <TopRatedMovieWidget
        title="Le Parrain"
        releaseYear={1972}
        rating={9.1}
        posterPath="/3bhkrj58Vtu7enYsRolD1fZdja1.jpg"
      />,
    );

    expect(
      screen.getByRole('heading', { level: 3, name: 'Film le mieux noté' }),
    ).toBeTruthy();
    expect(screen.getByTestId('top-rated-title').textContent).toBe(
      'Le Parrain',
    );
    expect(screen.getByTestId('top-rated-year').textContent).toBe('1972');
    expect(screen.getByTestId('top-rated-rating').textContent).toBe('9,1');
    expect(screen.getByText('/ 10')).toBeTruthy();

    const posterImg = screen.getByRole('img', {
      name: 'Affiche de Le Parrain',
    });
    expect(posterImg.getAttribute('src')).toBe(
      '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    );
  });

  it('prepends TMDB base URL when posterPath is relative without leading slash', () => {
    render(
      <TopRatedMovieWidget
        title="Inception"
        releaseYear="2010"
        rating={8.8}
        posterPath="poster.jpg"
      />,
    );

    const posterImg = screen.getByRole('img', { name: 'Affiche de Inception' });
    expect(posterImg.getAttribute('src')).toBe(
      'https://image.tmdb.org/t/p/w200poster.jpg',
    );
  });

  it('renders explicit poster placeholder when posterPath is absent or empty', () => {
    const { rerender } = render(
      <TopRatedMovieWidget
        title="12 Hommes en colère"
        releaseYear={1957}
        rating={9.0}
        posterPath={null}
      />,
    );

    expect(
      screen.getByRole('img', { name: 'Affiche non disponible' }),
    ).toBeTruthy();
    expect(screen.getByText('Sans affiche')).toBeTruthy();

    rerender(
      <TopRatedMovieWidget
        title="12 Hommes en colère"
        releaseYear={1957}
        rating={9.0}
        posterPath=""
      />,
    );
    expect(
      screen.getByRole('img', { name: 'Affiche non disponible' }),
    ).toBeTruthy();
  });

  it('renders "Année inconnue" when releaseYear is absent or empty', () => {
    const { rerender } = render(
      <TopRatedMovieWidget
        title="Film Mystère"
        releaseYear={null}
        rating={8.5}
      />,
    );
    expect(screen.getByTestId('top-rated-year').textContent).toBe(
      'Année inconnue',
    );

    rerender(
      <TopRatedMovieWidget
        title="Film Mystère"
        releaseYear={undefined}
        rating={8.5}
      />,
    );
    expect(screen.getByTestId('top-rated-year').textContent).toBe(
      'Année inconnue',
    );

    rerender(
      <TopRatedMovieWidget
        title="Film Mystère"
        releaseYear="  "
        rating={8.5}
      />,
    );
    expect(screen.getByTestId('top-rated-year').textContent).toBe(
      'Année inconnue',
    );
  });

  it('renders loading state when loading is true', () => {
    render(<TopRatedMovieWidget loading={true} />);

    expect(screen.getByLabelText('Chargement en cours')).toBeTruthy();
    expect(screen.getByText('Chargement...')).toBeTruthy();
    expect(screen.queryByTestId('top-rated-title')).toBeNull();
  });

  it('renders error state when an error message is passed', () => {
    render(<TopRatedMovieWidget error="Erreur de chargement" />);

    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText('Erreur de chargement')).toBeTruthy();
  });

  it('renders empty state when title or rating is missing, 0, or negative', () => {
    const { rerender } = render(
      <TopRatedMovieWidget title={null} rating={null} />,
    );
    expect(screen.getByText('—')).toBeTruthy();
    expect(screen.getByText('Aucun film noté')).toBeTruthy();

    rerender(<TopRatedMovieWidget title="Film" rating={0} />);
    expect(screen.getByText('—')).toBeTruthy();

    rerender(<TopRatedMovieWidget title="Film" rating={-1} />);
    expect(screen.getByText('—')).toBeTruthy();

    rerender(<TopRatedMovieWidget title="" rating={8.5} />);
    expect(screen.getByText('—')).toBeTruthy();

    rerender(<TopRatedMovieWidget title="  " rating={8.5} />);
    expect(screen.getByText('—')).toBeTruthy();
  });
});
