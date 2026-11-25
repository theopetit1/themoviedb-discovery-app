import type { Meta, StoryObj } from '@storybook/react-vite';
import BestRatedGenreWidget from './BestRatedGenreWidget';

const meta: Meta<typeof BestRatedGenreWidget> = {
  title: 'Widgets/BestRatedGenreWidget',
  component: BestRatedGenreWidget,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Carte métrique affichant le genre ayant la meilleure note moyenne simple sur 10 (distincte de la note pondérée).',
      },
    },
  },
  argTypes: {
    genreName: {
      control: 'text',
      description: 'Nom du genre le mieux noté.',
    },
    rating: {
      control: 'number',
      description: 'Note moyenne sur 10.',
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
type Story = StoryObj<typeof BestRatedGenreWidget>;

/**
 * Démonstration nominale issue des critères d'acceptation (Animation et 7,41 / 10).
 */
export const Nominal: Story = {
  args: {
    genreName: 'Animation',
    rating: 7.41,
    loading: false,
    error: null,
  },
};

/**
 * Cas avec un nom de genre long.
 */
export const NomLong: Story = {
  args: {
    genreName: 'Science-Fiction & Aventure Fantastique',
    rating: 7.18,
    loading: false,
    error: null,
  },
};

/**
 * Genre sans note valide (aucun vote positif).
 */
export const GenreSansNote: Story = {
  args: {
    genreName: 'Documentaire',
    rating: null,
    loading: false,
    error: null,
  },
};

/**
 * Données absentes (aucun film ou genre non déterminé).
 */
export const AucuneDonnee: Story = {
  args: {
    genreName: null,
    rating: null,
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
    error: 'Impossible de calculer la moyenne des genres.',
  },
};
