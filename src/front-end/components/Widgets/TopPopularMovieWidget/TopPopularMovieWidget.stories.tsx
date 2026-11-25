import type { Meta, StoryObj } from '@storybook/react-vite';
import TopPopularMovieWidget from './TopPopularMovieWidget';

const meta: Meta<typeof TopPopularMovieWidget> = {
  title: 'Widgets/TopPopularMovieWidget',
  component: TopPopularMovieWidget,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TopPopularMovieWidget>;

export const DemonstrationNominal: Story = {
  args: {
    title: 'Deadpool & Wolverine',
    releaseYear: 2024,
    popularity: 1036.49,
    posterPath: '/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
  },
};

export const WithoutPoster: Story = {
  args: {
    title: 'Vice-Versa 2',
    releaseYear: 2024,
    popularity: 945.12,
    posterPath: null,
  },
};

export const LongTitle: Story = {
  args: {
    title:
      'Mission: Impossible – Dead Reckoning Partie Un (Édition Spéciale IMAX)',
    releaseYear: 2023,
    popularity: 812.35,
    posterPath:
      'https://image.tmdb.org/t/p/w200/NNxYkU70HPurnNCSiCjYAmacwm.jpg',
  },
};

export const UnknownYear: Story = {
  args: {
    title: 'Film Phénomène Inédit',
    releaseYear: null,
    popularity: 512.8,
    posterPath: null,
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
};

export const UnknownValue: Story = {
  args: {
    title: 'Film Inconnu',
    popularity: null,
  },
};

export const ErrorState: Story = {
  args: {
    error: 'Impossible de calculer la popularité des films',
  },
};
