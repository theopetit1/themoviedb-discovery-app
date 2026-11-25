import type { Meta, StoryObj } from '@storybook/react-vite';
import DominantGenreWidget from './DominantGenreWidget';

const meta: Meta<typeof DominantGenreWidget> = {
  title: 'Widgets/DominantGenreWidget',
  component: DominantGenreWidget,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Carte métrique affichant le genre dominant avec son effectif en films et règle de départage alphabétique en cas d égalité.',
      },
    },
  },
  argTypes: {
    genreName: {
      control: 'text',
      description: 'Nom du genre le plus représenté.',
    },
    movieCount: {
      control: 'number',
      description: 'Nombre de films associés au genre.',
    },
    loading: {
      control: 'boolean',
      description: 'État de chargement.',
    },
    error: {
      control: 'text',
      description: 'Message d erreur.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DominantGenreWidget>;

/**
 * Démonstration nominale issue des critères d'acceptation (Drame / 488 films).
 */
export const Nominal: Story = {
  args: {
    genreName: 'Drame',
    movieCount: 488,
    loading: false,
    error: null,
  },
};

/**
 * Cas singulier (1 seul film dans la catégorie).
 */
export const Singulier: Story = {
  args: {
    genreName: 'Western',
    movieCount: 1,
    loading: false,
    error: null,
  },
};

/**
 * Cas avec un nom de genre long.
 */
export const NomLong: Story = {
  args: {
    genreName: 'Action & Aventure & Science-Fiction',
    movieCount: 312,
    loading: false,
    error: null,
  },
};

/**
 * Données absentes (aucun film ou genre non déterminé).
 */
export const AucunGenre: Story = {
  args: {
    genreName: null,
    movieCount: null,
    loading: false,
    error: null,
  },
};

/**
 * État de chargement.
 */
export const Chargement: Story = {
  args: {
    loading: true,
  },
};

/**
 * État d'erreur.
 */
export const Erreur: Story = {
  args: {
    error: 'Impossible d identifier le genre dominant.',
  },
};
