// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  act,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import DashboardPage from './DashboardPage';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('DashboardPage', () => {
  it('renders all 12 widgets and displays nominal metrics for the full period (2015 - 2024)', () => {
    render(<DashboardPage />);

    // Check main landmark and main page title
    expect(
      screen.getByRole('main', { name: 'Tableau de bord des films' }),
    ).toBeTruthy();
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Tableau de bord des films',
      }),
    ).toBeTruthy();

    // Check section headings
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Indicateurs généraux',
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Genres et pays de production',
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Palmarès des films',
      }),
    ).toBeTruthy();

    // Section 1: Overview widgets
    expect(
      screen.getByRole('heading', { level: 3, name: 'Films en base' }),
    ).toBeTruthy();
    expect(screen.getByTestId('movies-count-value').textContent).toMatch(
      /1\s?000/,
    );

    expect(
      screen.getByRole('heading', { level: 3, name: 'Durée moyenne' }),
    ).toBeTruthy();
    expect(screen.getByTestId('average-runtime-value').textContent).toBe('107');

    expect(
      screen.getByRole('heading', { level: 3, name: 'Note moyenne' }),
    ).toBeTruthy();
    expect(screen.getByTestId('average-rating-value').textContent).toBe('6,78');

    expect(
      screen.getByRole('heading', { level: 3, name: 'Genres représentés' }),
    ).toBeTruthy();
    expect(screen.getByTestId('genres-count-value').textContent).toBe('19');

    // Section 2: Categories and countries
    expect(
      screen.getByRole('heading', { level: 3, name: 'Genre dominant' }),
    ).toBeTruthy();
    expect(screen.getByTestId('dominant-genre-name').textContent).toBe('Drame');
    expect(screen.getByTestId('dominant-genre-count').textContent).toBe('488');

    expect(
      screen.getByRole('heading', { level: 3, name: 'Meilleure note' }),
    ).toBeTruthy();
    expect(screen.getByTestId('best-rated-genre-name').textContent).toBe(
      'Animation',
    );
    expect(screen.getByTestId('best-rated-genre-value').textContent).toBe(
      '7,41',
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
      screen.getByRole('heading', {
        level: 3,
        name: 'Pays le plus représenté',
      }),
    ).toBeTruthy();
    expect(screen.getByTestId('top-country-name').textContent).toBe(
      'United States of America',
    );

    // Section 3: Movie awards
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Film le plus populaire',
      }),
    ).toBeTruthy();
    expect(screen.getByTestId('top-popular-title').textContent).toBe(
      'Deadpool & Wolverine',
    );

    expect(
      screen.getByRole('heading', { level: 3, name: 'Film le mieux noté' }),
    ).toBeTruthy();
    expect(screen.getByTestId('top-rated-title').textContent).toBe(
      'The Shawshank Redemption',
    );

    expect(
      screen.getByRole('heading', { level: 3, name: 'Film le plus rentable' }),
    ).toBeTruthy();
    expect(screen.getByTestId('top-profitable-title').textContent).toBe(
      'Paranormal Activity',
    );

    expect(
      screen.getByRole('heading', { level: 3, name: 'Film le moins rentable' }),
    ).toBeTruthy();
    expect(screen.getByTestId('least-profitable-title').textContent).toBe(
      'The 13th Warrior',
    );
  });

  it('updates all widgets interactively when changing the selected period', () => {
    render(<DashboardPage />);

    // Switch period to 2024
    const btn2024 = screen.getByRole('button', { name: '2024' });
    fireEvent.click(btn2024);

    expect(btn2024.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByTestId('movies-count-value').textContent).toBe('120');
    expect(screen.getByTestId('average-runtime-value').textContent).toBe('112');
    expect(screen.getByTestId('average-rating-value').textContent).toBe('7,15');
    expect(screen.getByTestId('dominant-genre-name').textContent).toBe(
      'Action',
    );
    expect(screen.getByTestId('top-rated-title').textContent).toBe(
      'Dune: Part Two',
    );
    expect(screen.getByTestId('top-profitable-title').textContent).toBe(
      'Alien: Romulus',
    );

    // Switch period to 2020 - 2023
    const btn2020 = screen.getByRole('button', { name: /2020/ });
    fireEvent.click(btn2020);

    expect(btn2020.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByTestId('movies-count-value').textContent).toBe('410');
    expect(screen.getByTestId('dominant-genre-name').textContent).toBe(
      'Comédie',
    );
    expect(screen.getByTestId('top-country-name').textContent).toBe('France');
    expect(screen.getByTestId('least-profitable-title').textContent).toBe(
      'The Flash',
    );

    // Switch back to 2015 - 2024 using the all period button
    const btnAll = screen.getByRole('button', { name: /2015/ });
    fireEvent.click(btnAll);
    expect(btnAll.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByTestId('movies-count-value').textContent).toMatch(
      /1\s?000/,
    );

    // Switch again to 2024 and then reset period back to all
    fireEvent.click(btn2024);
    expect(btn2024.getAttribute('aria-pressed')).toBe('true');

    const resetBtn = screen.getByRole('button', {
      name: 'Réinitialiser les filtres',
    });
    fireEvent.click(resetBtn);

    expect(screen.getByTestId('movies-count-value').textContent).toMatch(
      /1\s?000/,
    );
    expect(screen.getByTestId('dominant-genre-name').textContent).toBe('Drame');
  });

  it('handles refresh action with simulated loading state', () => {
    render(<DashboardPage />);

    const refreshBtn = screen.getByRole('button', {
      name: 'Actualiser les données',
    });

    fireEvent.click(refreshBtn);

    // Verify widgets receive loading state
    expect(
      screen.getAllByLabelText('Chargement en cours').length,
    ).toBeGreaterThan(0);

    // Fast-forward timer to complete refresh
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Loading indicator is cleared and nominal values are back
    expect(screen.queryByLabelText('Chargement en cours')).toBeNull();
    expect(screen.getByTestId('movies-count-value').textContent).toMatch(
      /1\s?000/,
    );
  });

  it('renders initial loading state when initialLoading is true', () => {
    render(<DashboardPage initialLoading={true} />);

    expect(
      screen.getAllByLabelText('Chargement en cours').length,
    ).toBeGreaterThan(0);
  });

  it('renders error state and clears it when changing period', () => {
    render(
      <DashboardPage initialError="Erreur de chargement des indicateurs" />,
    );

    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);

    // Changing period resets error message
    const btn2024 = screen.getByRole('button', { name: '2024' });
    fireEvent.click(btn2024);

    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('supports custom data overrides', () => {
    render(
      <DashboardPage
        customData={{
          moviesCount: 50,
          dominantGenre: { name: 'Thriller', count: 20 },
        }}
      />,
    );

    expect(screen.getByTestId('movies-count-value').textContent).toBe('50');
    expect(screen.getByTestId('dominant-genre-name').textContent).toBe(
      'Thriller',
    );
  });
});
