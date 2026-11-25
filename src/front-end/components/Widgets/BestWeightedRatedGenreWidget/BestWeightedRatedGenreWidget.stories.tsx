import type { Meta, StoryObj } from '@storybook/react-vite';
import BestWeightedRatedGenreWidget from './BestWeightedRatedGenreWidget';

const meta: Meta<typeof BestWeightedRatedGenreWidget> = {
  title: 'Widgets/BestWeightedRatedGenreWidget',
  component: BestWeightedRatedGenreWidget,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Carte métrique affichant le genre ayant la meilleure note moyenne pondérée bayésienne (WR = (v/(v+m))*R + (m/(v+m))*C) avec quorum de votes m.',
      },
    },
  },
  argTypes: {
    genreName: {
      control: 'text',
      description: 'Nom du genre éligible le mieux noté.',
    },
    rating: {
      control: 'number',
      description: 'Note moyenne pondérée sur 10.',
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
type Story = StoryObj<typeof BestWeightedRatedGenreWidget>;

/**
 * Démonstration nominale issue des critères d'acceptation (Animation et 7,68 / 10).
 */
export const Nominal: Story = {
  args: {
    genreName: 'Animation',
    rating: 7.68,
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
    rating: 7.35,
    loading: false,
    error: null,
  },
};

/**
 * Aucun genre éligible ou note pondérée indisponible.
 */
export const AucuneNotePonderee: Story = {
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
    error: 'Impossible de calculer la pondération des notes.',
  },
};
