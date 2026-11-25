// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import GenresCountWidget from './GenresCountWidget';

afterEach(cleanup);

describe('GenresCountWidget', () => {
  it('renders nominal demonstration with 19 genres in French formatting', () => {
    render(<GenresCountWidget count={19} />);

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Genres représentés',
      }),
    ).toBeTruthy();
    expect(screen.getByTestId('genres-count-value').textContent).toBe('19');
    expect(screen.getByTestId('genres-count-unit').textContent).toBe('genres');
  });

  it('renders singular unit "genre" when count is 1', () => {
    render(<GenresCountWidget count={1} />);

    expect(screen.getByTestId('genres-count-value').textContent).toBe('1');
    expect(screen.getByTestId('genres-count-unit').textContent).toBe('genre');
  });

  it('renders zero count strictly as "0 genres" and not as empty/absent data', () => {
    render(<GenresCountWidget count={0} />);

    expect(screen.getByTestId('genres-count-value').textContent).toBe('0');
    expect(screen.getByTestId('genres-count-unit').textContent).toBe('genres');
  });

  it('formats large numbers according to French locale with space separator', () => {
    render(<GenresCountWidget count={1250} />);

    expect(screen.getByTestId('genres-count-value').textContent).toMatch(
      /1\s?250/,
    );
    expect(screen.getByTestId('genres-count-unit').textContent).toBe('genres');
  });

  it('renders loading state when loading is true', () => {
    render(<GenresCountWidget loading={true} />);
    expect(screen.getByLabelText('Chargement en cours')).toBeTruthy();
    expect(screen.getByText('Chargement...')).toBeTruthy();
  });

  it('renders error message when error is provided', () => {
    render(
      <GenresCountWidget error="Erreur lors du dénombrement des genres" />,
    );
    const alert = screen.getByRole('alert');
    expect(alert).toBeTruthy();
    expect(alert.textContent).toContain(
      'Erreur lors du dénombrement des genres',
    );
  });

  it('renders empty state when count is null, undefined, or NaN', () => {
    const { rerender } = render(<GenresCountWidget />);
    expect(screen.getByText('Aucune donnée')).toBeTruthy();
    expect(screen.getByText('—')).toBeTruthy();

    rerender(<GenresCountWidget count={null} />);
    expect(screen.getByText('Aucune donnée')).toBeTruthy();

    rerender(<GenresCountWidget count={NaN} />);
    expect(screen.getByText('Aucune donnée')).toBeTruthy();
  });
});
