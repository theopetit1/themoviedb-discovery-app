import type { Meta, StoryObj } from '@storybook/react-vite';
import LeastProfitableMovieWidget from './LeastProfitableMovieWidget';

const meta: Meta<typeof LeastProfitableMovieWidget> = {
  title: 'Widgets/LeastProfitableMovieWidget',
  component: LeastProfitableMovieWidget,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Carte métrique affichant le film le moins rentable (plus fort déficit) selon son retour sur investissement (ROI = ((recettes - budget) / budget) * 100). Les films sans budget ou recettes connus sont exclus.',
      },
    },
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Titre du film le moins rentable.',
    },
    releaseYear: {
      control: 'text',
      description: 'Année de sortie du film.',
    },
    roi: {
      control: 'number',
      description: 'Pourcentage de retour sur investissement négatif.',
    },
    posterPath: {
      control: 'text',
      description: 'Chemin ou URL de l affiche.',
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
type Story = StoryObj<typeof LeastProfitableMovieWidget>;

/**
 * Démonstration nominale issue des critères d'acceptation (-99,99 % ROI).
 */
export const Nominal: Story = {
  args: {
    title: 'The 13th Warrior',
    releaseYear: 1999,
    roi: -99.99,
    posterPath: '/13th-warrior.jpg',
    loading: false,
    error: null,
  },
};

/**
 * Cas où l'affiche est manquante ou indisponible.
 */
export const SansAffiche: Story = {
  args: {
    title: 'Cutthroat Island',
    releaseYear: 1995,
    roi: -89.45,
    posterPath: null,
    loading: false,
    error: null,
  },
};

/**
 * Cas avec un titre de film long.
 */
export const TitreLong: Story = {
  args: {
    title:
      'Valerian and the City of a Thousand Planets - Extended Collector Edition',
    releaseYear: 2017,
    roi: -78.32,
    posterPath: '/valerian.jpg',
    loading: false,
    error: null,
  },
};

/**
 * Aucun film éligible avec budget et recettes déclarés.
 */
export const AucunFilmEligible: Story = {
  args: {
    title: null,
    releaseYear: null,
    roi: null,
    posterPath: null,
    loading: false,
    error: null,
  },
};

/**
 * État de chargement des données.
 */
export const Chargement: Story = {
  args: {
    loading: true,
  },
};

/**
 * État d'erreur lors du calcul ou du chargement.
 */
export const Erreur: Story = {
  args: {
    error: 'Impossible de calculer les pertes des films.',
  },
};
