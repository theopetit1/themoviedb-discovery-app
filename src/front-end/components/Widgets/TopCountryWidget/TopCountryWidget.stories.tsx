import type { Meta, StoryObj } from '@storybook/react-vite';
import TopCountryWidget from './TopCountryWidget';

const meta: Meta<typeof TopCountryWidget> = {
  title: 'Widgets/TopCountryWidget',
  component: TopCountryWidget,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TopCountryWidget>;

export const DemonstrationNominal: Story = {
  args: {
    countryName: 'United States of America',
    movieCount: 725,
  },
};

export const LongCountryName: Story = {
  args: {
    countryName: 'United Kingdom of Great Britain and Northern Ireland',
    movieCount: 312,
  },
};

export const SingleMovie: Story = {
  args: {
    countryName: 'France',
    movieCount: 1,
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
};

export const NoData: Story = {
  args: {
    countryName: null,
    movieCount: null,
  },
};

export const ErrorState: Story = {
  args: {
    error: 'Impossible de calculer le pays le plus représenté',
  },
};
