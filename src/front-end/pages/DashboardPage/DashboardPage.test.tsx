// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import DashboardPage from './DashboardPage';

afterEach(cleanup);

describe('DashboardPage', () => {
  it('renders the dashboard page without widgets and displays empty state message', () => {
    // Arrange: render the page.
    render(<DashboardPage />);

    // Act: retrieve the main landmark and headings.
    const main = screen.getByRole('main', {
      name: 'Tableau de bord des films',
    });

    // Assert: the page presents its title, intro, and empty state
    expect(main).toBeTruthy();
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Tableau de bord des films',
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Tableau de bord en préparation',
      }),
    ).toBeTruthy();
    expect(
      screen.getByText(
        /Aucun widget n'est encore configuré sur ce tableau de bord/,
      ),
    ).toBeTruthy();
    expect(screen.getByText(/2015 – 2024/)).toBeTruthy();
    expect(screen.getByText(/The Movie Database \(TMDB\)/)).toBeTruthy();
  });
});
