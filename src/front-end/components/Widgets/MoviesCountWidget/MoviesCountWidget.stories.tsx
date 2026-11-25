import type { Meta, StoryObj } from '@storybook/react-vite';
import MoviesCountWidget from './MoviesCountWidget';

const meta: Meta<typeof MoviesCountWidget> = {
  title: 'Widgets/MoviesCountWidget',
  component: MoviesCountWidget,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MoviesCountWidget>;

export const Nominal: Story = {
  args: {
    count: 1250,
  },
};

export const SingleMovie: Story = {
  args: {
    count: 1,
  },
};

export const ZeroMovies: Story = {
  args: {
    count: 0,
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
};

export const NoData: Story = {
  args: {
    count: null,
  },
};

export const ErrorState: Story = {
  args: {
    error: 'Impossible de contacter la base de données',
  },
};
