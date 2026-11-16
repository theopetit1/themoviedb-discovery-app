// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import AverageRuntimeWidget from './AverageRuntimeWidget';

afterEach(cleanup);

describe('AverageRuntimeWidget', () => {
  it('renders the nominal state with formatted minutes and min unit badge', () => {
    render(<AverageRuntimeWidget runtimeMinutes={107} />);

    expect(
      screen.getByRole('heading', { level: 3, name: 'Durée moyenne' }),
    ).toBeTruthy();
    expect(screen.getByTestId('average-runtime-value').textContent).toBe('107');
    expect(screen.getByText('min')).toBeTruthy();
    expect(screen.getByText('par film')).toBeTruthy();
  });

  it('renders decimal minutes rounded to the nearest integer', () => {
    render(<AverageRuntimeWidget runtimeMinutes={106.7} />);

    expect(screen.getByTestId('average-runtime-value').textContent).toBe('107');
  });

  it('renders loading state when loading is true', () => {
    render(<AverageRuntimeWidget loading={true} />);

    expect(screen.getByLabelText('Chargement en cours')).toBeTruthy();
    expect(screen.getByText('Chargement...')).toBeTruthy();
    expect(screen.queryByTestId('average-runtime-value')).toBeNull();
  });

  it('renders error state when an error message is passed', () => {
    render(<AverageRuntimeWidget error="Erreur de calcul" />);

    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText('Erreur de calcul')).toBeTruthy();
  });

  it('renders empty state when runtimeMinutes is null, undefined, 0 or negative without defaulting to 0', () => {
    const { rerender } = render(<AverageRuntimeWidget runtimeMinutes={null} />);
    expect(screen.getByText('—')).toBeTruthy();
    expect(screen.getByText('Aucune donnée')).toBeTruthy();

    rerender(<AverageRuntimeWidget runtimeMinutes={undefined} />);
    expect(screen.getByText('—')).toBeTruthy();

    rerender(<AverageRuntimeWidget runtimeMinutes={0} />);
    expect(screen.getByText('—')).toBeTruthy();

    rerender(<AverageRuntimeWidget runtimeMinutes={-15} />);
    expect(screen.getByText('—')).toBeTruthy();
  });
});
