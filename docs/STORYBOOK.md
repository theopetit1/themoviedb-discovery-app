# Documentation d'utilisation de Storybook

Ce projet intègre [Storybook](https://storybook.js.org/) avec Vite et React pour développer, tester et documenter de façon isolée les widgets et composants de l'application.

---

## 1. Démarrer Storybook en local

Pour lancer l'atelier Storybook en mode développement :

```sh
npm run storybook
```

L'interface sera accessible sur : `http://localhost:6006`

---

## 2. Construire la version statique (build)

Pour générer le bundle de production de Storybook (par exemple pour déploiement ou vérification CI) :

```sh
npm run build-storybook
```

Les fichiers statiques sont générés dans le répertoire `storybook-static/`.

---

## 3. Structure des Stories

Les fichiers d'histoires sont placés aux côtés des composants correspondants dans `src/front-end/components/` et suivent la convention `*.stories.tsx` :

```
src/front-end/components/Widgets/MonWidget/
├── MonWidget.tsx
├── MonWidget.css
├── MonWidget.test.tsx
└── MonWidget.stories.tsx
```

### Exemple de Story pour un widget :

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import MonWidget from './MonWidget';

const meta: Meta<typeof MonWidget> = {
  title: 'Widgets/MonWidget',
  component: MonWidget,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MonWidget>;

export const Nominal: Story = {
  args: {
    value: 42,
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    value: undefined,
  },
};

export const ErrorState: Story = {
  args: {
    error: 'Erreur de chargement des données',
  },
};
```
