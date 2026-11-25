import type { Meta, StoryObj } from '@storybook/react-vite';
import TopRatedMovieWidget from './TopRatedMovieWidget';

const meta: Meta<typeof TopRatedMovieWidget> = {
  title: 'Widgets/TopRatedMovieWidget',
  component: TopRatedMovieWidget,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TopRatedMovieWidget>;

export const DemonstrationNominal: Story = {
  args: {
    title: 'Le Parrain',
    releaseYear: 1972,
    rating: 9.1,
    posterPath: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
  },
};

export const WithoutPoster: Story = {
  args: {
    title: '12 Hommes en colère',
    releaseYear: 1957,
    rating: 9.0,
    posterPath: null,
  },
};

export const UnknownYear: Story = {
  args: {
    title: 'Film Anonyme Restauré',
    releaseYear: null,
    rating: 8.7,
    posterPath: null,
  },
};

export const LongTitle: Story = {
  args: {
    title:
      'Le Seigneur des anneaux : Le Retour du roi (Version Longue Intégrale)',
    releaseYear: 2003,
    rating: 9.0,
    posterPath:
      'https://image.tmdb.org/t/p/w200/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg',
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
};

export const NoRatedMovie: Story = {
  args: {
    title: null,
    rating: null,
  },
};

export const ErrorState: Story = {
  args: {
    error: 'Impossible de récupérer le film le mieux noté',
  },
};
