// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import AverageRatingWidget from './AverageRatingWidget';

afterEach(cleanup);

describe('AverageRatingWidget', () => {
  it('renders the nominal state with French comma format, two decimals and / 10 scale', () => {
    render(<AverageRatingWidget averageRating={6.78} />);

    expect(
      screen.getByRole('heading', { level: 3, name: 'Note moyenne' }),
    ).toBeTruthy();
    expect(screen.getByTestId('average-rating-value').textContent).toBe('6,78');
    expect(screen.getByText('/ 10')).toBeTruthy();
    expect(screen.getByText('moyenne simple')).toBeTruthy();
  });

  it('formats ratings with exactly two decimals', () => {
    render(<AverageRatingWidget averageRating={7.5} />);

    expect(screen.getByTestId('average-rating-value').textContent).toBe('7,50');
  });

  it('renders loading state when loading is true', () => {
    render(<AverageRatingWidget loading={true} />);

    expect(screen.getByLabelText('Chargement en cours')).toBeTruthy();
    expect(screen.getByText('Chargement...')).toBeTruthy();
    expect(screen.queryByTestId('average-rating-value')).toBeNull();
  });

  it('renders error state when an error message is passed', () => {
    render(<AverageRatingWidget error="Erreur de calcul" />);

    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText('Erreur de calcul')).toBeTruthy();
  });

  it('renders empty state when averageRating is null, undefined, 0 or negative without defaulting to 0,00', () => {
    const { rerender } = render(<AverageRatingWidget averageRating={null} />);
    expect(screen.getByText('—')).toBeTruthy();
    expect(screen.getByText('Aucune note')).toBeTruthy();

    rerender(<AverageRatingWidget averageRating={undefined} />);
    expect(screen.getByText('—')).toBeTruthy();

    rerender(<AverageRatingWidget averageRating={0} />);
    expect(screen.getByText('—')).toBeTruthy();

    rerender(<AverageRatingWidget averageRating={-2} />);
    expect(screen.getByText('—')).toBeTruthy();
  });
});
