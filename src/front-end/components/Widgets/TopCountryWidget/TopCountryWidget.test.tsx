// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import TopCountryWidget from './TopCountryWidget';

afterEach(cleanup);

describe('TopCountryWidget', () => {
  it('renders nominal demonstration with United States of America and 725 films', () => {
    render(
      <TopCountryWidget
        countryName="United States of America"
        movieCount={725}
      />,
    );

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Pays le plus représenté',
      }),
    ).toBeTruthy();
    expect(screen.getByTestId('top-country-name').textContent).toBe(
      'United States of America',
    );
    expect(screen.getByTestId('top-country-count').textContent).toBe('725');
    expect(screen.getByText('films')).toBeTruthy();
  });

  it('renders singular film unit when movieCount is 1', () => {
    render(<TopCountryWidget countryName="France" movieCount={1} />);

    expect(screen.getByTestId('top-country-name').textContent).toBe('France');
    expect(screen.getByTestId('top-country-count').textContent).toBe('1');
    expect(screen.getByText('film')).toBeTruthy();
  });

  it('renders long country names legibly', () => {
    render(
      <TopCountryWidget
        countryName="United Kingdom of Great Britain and Northern Ireland"
        movieCount={450}
      />,
    );

    expect(
      screen.getByText('United Kingdom of Great Britain and Northern Ireland'),
    ).toBeTruthy();
    expect(screen.getByTestId('top-country-count').textContent).toBe('450');
  });

  it('renders loading state when loading is true', () => {
    render(<TopCountryWidget loading={true} />);

    expect(screen.getByLabelText('Chargement en cours')).toBeTruthy();
    expect(screen.getByText('Chargement...')).toBeTruthy();
    expect(screen.queryByTestId('top-country-name')).toBeNull();
  });

  it('renders error state when error message is supplied', () => {
    render(<TopCountryWidget error="Erreur de base de données" />);

    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText('Erreur de base de données')).toBeTruthy();
  });

  it('renders empty state when countryName is missing or count is invalid', () => {
    const { rerender } = render(
      <TopCountryWidget countryName={null} movieCount={null} />,
    );
    expect(screen.getByText('—')).toBeTruthy();
    expect(screen.getByText('Aucun pays connu')).toBeTruthy();

    rerender(<TopCountryWidget countryName="" movieCount={50} />);
    expect(screen.getByText('—')).toBeTruthy();

    rerender(<TopCountryWidget countryName="  " movieCount={50} />);
    expect(screen.getByText('—')).toBeTruthy();

    rerender(<TopCountryWidget countryName="Canada" movieCount={0} />);
    expect(screen.getByText('—')).toBeTruthy();

    rerender(<TopCountryWidget countryName="Canada" movieCount={-5} />);
    expect(screen.getByText('—')).toBeTruthy();

    rerender(<TopCountryWidget countryName="Canada" movieCount={undefined} />);
    expect(screen.getByText('—')).toBeTruthy();
  });
});
