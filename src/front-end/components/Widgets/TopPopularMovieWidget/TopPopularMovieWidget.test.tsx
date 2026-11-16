// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import TopPopularMovieWidget from './TopPopularMovieWidget';

afterEach(cleanup);

describe('TopPopularMovieWidget', () => {
  it('renders nominal demonstration with 1 036,49 popularité, poster, title, and year', () => {
    render(
      <TopPopularMovieWidget
        title="Deadpool & Wolverine"
        releaseYear={2024}
        popularity={1036.49}
        posterPath="/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg"
      />,
    );

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Film le plus populaire',
      }),
    ).toBeTruthy();
    expect(screen.getByTestId('top-popular-title').textContent).toBe(
      'Deadpool & Wolverine',
    );
    expect(screen.getByTestId('top-popular-year').textContent).toBe('2024');
    expect(screen.getByTestId('top-popular-value').textContent).toMatch(
      /1\s?036,49/,
    );
    expect(screen.getByText('popularité')).toBeTruthy();

    const posterImg = screen.getByRole('img', {
      name: 'Affiche de Deadpool & Wolverine',
    });
    expect(posterImg.getAttribute('src')).toBe(
      '/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    );
  });

  it('prepends TMDB base URL when posterPath is relative without leading slash', () => {
    render(
      <TopPopularMovieWidget
        title="Gladiator II"
        releaseYear="2024"
        popularity={850.5}
        posterPath="gladiator.jpg"
      />,
    );

    const posterImg = screen.getByRole('img', {
      name: 'Affiche de Gladiator II',
    });
    expect(posterImg.getAttribute('src')).toBe(
      'https://image.tmdb.org/t/p/w200gladiator.jpg',
    );
    expect(screen.getByTestId('top-popular-value').textContent).toBe('850,50');
  });

  it('renders explicit poster placeholder when posterPath is absent or empty', () => {
    const { rerender } = render(
      <TopPopularMovieWidget
        title="Vice-Versa 2"
        releaseYear={2024}
        popularity={945.12}
        posterPath={null}
      />,
    );

    expect(
      screen.getByRole('img', { name: 'Affiche non disponible' }),
    ).toBeTruthy();
    expect(screen.getByText('Sans affiche')).toBeTruthy();

    rerender(
      <TopPopularMovieWidget
        title="Vice-Versa 2"
        releaseYear={2024}
        popularity={945.12}
        posterPath=""
      />,
    );
    expect(
      screen.getByRole('img', { name: 'Affiche non disponible' }),
    ).toBeTruthy();
  });

  it('renders "Année inconnue" when releaseYear is absent or empty', () => {
    const { rerender } = render(
      <TopPopularMovieWidget
        title="Film Phénomène"
        releaseYear={null}
        popularity={500.1}
      />,
    );
    expect(screen.getByTestId('top-popular-year').textContent).toBe(
      'Année inconnue',
    );

    rerender(
      <TopPopularMovieWidget
        title="Film Phénomène"
        releaseYear={undefined}
        popularity={500.1}
      />,
    );
    expect(screen.getByTestId('top-popular-year').textContent).toBe(
      'Année inconnue',
    );

    rerender(
      <TopPopularMovieWidget
        title="Film Phénomène"
        releaseYear="  "
        popularity={500.1}
      />,
    );
    expect(screen.getByTestId('top-popular-year').textContent).toBe(
      'Année inconnue',
    );
  });

  it('renders loading state when loading is true', () => {
    render(<TopPopularMovieWidget loading={true} />);

    expect(screen.getByLabelText('Chargement en cours')).toBeTruthy();
    expect(screen.getByText('Chargement...')).toBeTruthy();
    expect(screen.queryByTestId('top-popular-title')).toBeNull();
  });

  it('renders error state when an error message is passed', () => {
    render(<TopPopularMovieWidget error="Erreur de calcul" />);

    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText('Erreur de calcul')).toBeTruthy();
  });

  it('renders empty state when title or popularity is missing, 0, or negative', () => {
    const { rerender } = render(
      <TopPopularMovieWidget title={null} popularity={null} />,
    );
    expect(screen.getByText('—')).toBeTruthy();
    expect(screen.getByText('Valeur inconnue')).toBeTruthy();

    rerender(<TopPopularMovieWidget title="Film" popularity={0} />);
    expect(screen.getByText('—')).toBeTruthy();

    rerender(<TopPopularMovieWidget title="Film" popularity={-5} />);
    expect(screen.getByText('—')).toBeTruthy();

    rerender(<TopPopularMovieWidget title="" popularity={100} />);
    expect(screen.getByText('—')).toBeTruthy();

    rerender(<TopPopularMovieWidget title="  " popularity={100} />);
    expect(screen.getByText('—')).toBeTruthy();
  });
});
