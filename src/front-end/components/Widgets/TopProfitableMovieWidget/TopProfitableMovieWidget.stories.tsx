import type { Meta, StoryObj } from '@storybook/react-vite';
import TopProfitableMovieWidget from './TopProfitableMovieWidget';

const meta: Meta<typeof TopProfitableMovieWidget> = {
  title: 'Widgets/TopProfitableMovieWidget',
  component: TopProfitableMovieWidget,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Carte métrique affichant le film le plus rentable selon son retour sur investissement (ROI = ((recettes - budget) / budget) * 100). Les films sans budget ou recettes connus sont exclus.',
      },
    },
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Titre du film le plus rentable.',
    },
    releaseYear: {
      control: 'text',
      description: 'Année de sortie du film.',
    },
    roi: {
      control: 'number',
      description: 'Pourcentage de retour sur investissement.',
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
type Story = StoryObj<typeof TopProfitableMovieWidget>;

/**
 * Démonstration nominale issue des critères d'acceptation (69 667,36 % ROI).
 */
export const Nominal: Story = {
  args: {
    title: 'Paranormal Activity',
    releaseYear: 2009,
    roi: 69667.36,
    posterPath: '/paranormal-activity.jpg',
    loading: false,
    error: null,
  },
};

/**
 * Cas où l'affiche est manquante ou indisponible.
 */
export const SansAffiche: Story = {
  args: {
    title: 'Le Projet Blair Witch',
    releaseYear: 1999,
    roi: 41258.91,
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
      'Dr. Strangelove or: How I Learned to Stop Worrying and Love the Bomb',
    releaseYear: 1964,
    roi: 12500.5,
    posterPath: '/dr-strangelove.jpg',
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
    error: 'Impossible de calculer la rentabilité des films.',
  },
};
