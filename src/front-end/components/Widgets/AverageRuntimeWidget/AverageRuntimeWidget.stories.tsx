import type { Meta, StoryObj } from '@storybook/react-vite';
import AverageRuntimeWidget from './AverageRuntimeWidget';

const meta: Meta<typeof AverageRuntimeWidget> = {
  title: 'Widgets/AverageRuntimeWidget',
  component: AverageRuntimeWidget,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AverageRuntimeWidget>;

export const DemonstrationNominal: Story = {
  args: {
    runtimeMinutes: 107,
  },
};

export const ShortRuntime: Story = {
  args: {
    runtimeMinutes: 88,
  },
};

export const LongRuntime: Story = {
  args: {
    runtimeMinutes: 164,
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
};

export const NoData: Story = {
  args: {
    runtimeMinutes: null,
  },
};

export const ZeroRuntimeTreatedAsEmpty: Story = {
  args: {
    runtimeMinutes: 0,
  },
};

export const ErrorState: Story = {
  args: {
    error: 'Erreur lors du calcul de la durée moyenne',
  },
};
