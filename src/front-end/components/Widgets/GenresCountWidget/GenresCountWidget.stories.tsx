import type { Meta, StoryObj } from '@storybook/react-vite';
import GenresCountWidget from './GenresCountWidget';

const meta: Meta<typeof GenresCountWidget> = {
  title: 'Widgets/GenresCountWidget',
  component: GenresCountWidget,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Carte métrique affichant le nombre de genres représentés dans le jeu de données avec distinction singulier/pluriel et zéro strict.',
      },
    },
  },
  argTypes: {
    count: {
      control: 'number',
      description: 'Nombre de genres représentés.',
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
type Story = StoryObj<typeof GenresCountWidget>;

/**
 * Démonstration nominale issue des critères d'acceptation (19 genres).
 */
export const Nominal: Story = {
  args: {
    count: 19,
    loading: false,
    error: null,
  },
};

/**
 * Cas singulier (1 genre).
 */
export const Singulier: Story = {
  args: {
    count: 1,
    loading: false,
    error: null,
  },
};

/**
 * Cas zéro strict (0 genre).
 */
export const ZeroGenre: Story = {
  args: {
    count: 0,
    loading: false,
    error: null,
  },
};

/**
 * Cas où les données sont absentes (tiret d'attente).
 */
export const DonneeAbsente: Story = {
  args: {
    count: null,
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
    error: 'Impossible de dénombrer les genres représentés.',
  },
};
