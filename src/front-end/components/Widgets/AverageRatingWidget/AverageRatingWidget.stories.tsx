import type { Meta, StoryObj } from '@storybook/react-vite';
import AverageRatingWidget from './AverageRatingWidget';

const meta: Meta<typeof AverageRatingWidget> = {
  title: 'Widgets/AverageRatingWidget',
  component: AverageRatingWidget,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AverageRatingWidget>;

export const DemonstrationNominal: Story = {
  args: {
    averageRating: 6.78,
  },
};

export const HighRating: Story = {
  args: {
    averageRating: 8.4,
  },
};

export const PerfectTen: Story = {
  args: {
    averageRating: 10,
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
};

export const NoRating: Story = {
  args: {
    averageRating: null,
  },
};

export const ZeroRatingTreatedAsEmpty: Story = {
  args: {
    averageRating: 0,
  },
};

export const ErrorState: Story = {
  args: {
    error: 'Erreur lors du calcul de la note moyenne',
  },
};
