# Changelog

Toutes les modifications notables apportées à ce projet sont documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [2.0.0] - En cours de développement

### Ajouté

- **DASHBOARD-20** : Composant `LeastProfitableMovieWidget` dans `src/front-end/components/Widgets/LeastProfitableMovieWidget/` affichant le film le moins rentable selon son ROI négatif avec deux décimales.
- **DASHBOARD-20** : Stories Storybook avec démonstration à -99,99 % ROI, validation des règles d'éligibilité et tests unitaires à 100 % de couverture de code.

- **DASHBOARD-19** : Composant `TopProfitableMovieWidget` dans `src/front-end/components/Widgets/TopProfitableMovieWidget/` affichant le film le plus rentable selon son ROI en pourcentage avec deux décimales.
- **DASHBOARD-19** : Stories Storybook avec démonstration à 69 667,36 % ROI, validation des règles d'éligibilité et tests unitaires à 100 % de couverture de code.

- **DASHBOARD-18** : Composant `TopPopularMovieWidget` dans `src/front-end/components/Widgets/TopPopularMovieWidget/` affichant le film le plus populaire avec son affiche, titre, année et popularité formatée à 2 décimales.
- **DASHBOARD-18** : Stories Storybook avec démonstration à 1 036,49 popularité et tests unitaires à 100 % de couverture de code.

- **DASHBOARD-17** : Composant `TopRatedMovieWidget` dans `src/front-end/components/Widgets/TopRatedMovieWidget/` affichant le film le mieux noté, son affiche (avec fallback explicite), titre, année et note sur 10.
- **DASHBOARD-17** : Stories Storybook avec note de démonstration à 9,1 / 10 et tests unitaires à 100 % de couverture de code.

- **DASHBOARD-16** : Composant `TopCountryWidget` dans `src/front-end/components/Widgets/TopCountryWidget/` avec nom du pays, effectif en unité `films`, gestion des noms longs et distinction des pays inconnus.
- **DASHBOARD-16** : Stories Storybook avec démonstration `United States of America` et `725 films`, et suite de tests unitaires à 100 % de couverture de code.

- **DASHBOARD-15** : Composant `AverageRatingWidget` dans `src/front-end/components/Widgets/AverageRatingWidget/` avec format français à 2 décimales, échelle `/ 10` et distinction stricte des notes absentes vis-à-vis de zéro.
- **DASHBOARD-15** : Stories Storybook avec démonstration à 6,78 / 10 et suite de tests unitaires à 100 % de couverture de code.

- **DASHBOARD-14** : Composant `AverageRuntimeWidget` dans `src/front-end/components/Widgets/AverageRuntimeWidget/` avec gestion de l'unité `min`, arrondi et distinction stricte des durées absentes vis-à-vis de zéro.
- **DASHBOARD-14** : Stories Storybook avec démonstration à 107 min et suite de tests unitaires à 100 % de couverture de code.

- **DASHBOARD-13** : Composant `MoviesCountWidget` dans `src/front-end/components/Widgets/MoviesCountWidget/` avec gestion des états nominal, chargement, erreur et données absentes.
- **DASHBOARD-13** : Stories Storybook `MoviesCountWidget.stories.tsx` et tests unitaires à 100 % de couverture de code.

- **DASHBOARD-12** : Configuration Storybook 10 avec Vite et React dans `.storybook/main.ts` et `.storybook/preview.ts`.
- **DASHBOARD-12** : Scripts `storybook` et `build-storybook` dans `package.json`.
- **DASHBOARD-12** : Documentation détaillée d'utilisation et d'écriture de stories dans `docs/STORYBOOK.md`.

- **DASHBOARD-11** : Page `DashboardPage` dans `src/front-end/pages/DashboardPage/` accessible sans widgets avec état initial d'information.
- **DASHBOARD-11** : Route `/dashboard` dans `App.tsx` et lien de navigation "Tableau de bord" dans `NavBar.tsx`.
- **DASHBOARD-11** : Suite de tests unitaires pour `DashboardPage`, `NavBar` et `App` avec 100 % de couverture de code.

- **DASHBOARD-10** : Module `sync-service.ts` dans `src/back-end/services/` pour la mise à jour des films, genres et pays depuis les APIs TMDB.
- **DASHBOARD-10** : Commandes CLI `update-genres`, `update-countries`, `update-movies` et `update-all` dans `src/back-end/backend-cli.ts`.
- **DASHBOARD-10** : Suite de tests unitaires et d'intégration à 100 % de couverture de code pour le service et le CLI.
- **DASHBOARD-09** : Fonction `parseMoviesCsv` dans `src/back-end/utils/csv-parser.ts` avec validation stricte RFC 4180 et extraction des associations genres et pays.
- **DASHBOARD-09** : Sous-commande CLI `add-movies <csv-file>` dans `src/back-end/backend-cli.ts`.
- **DASHBOARD-09** : Jeu de données d'exemple dans `data/movies.csv`.
- **DASHBOARD-09** : Tests unitaires et d'intégration à 100 % de couverture.
- **DASHBOARD-08** : Modèle TypeScript `DbMovie` dans `src/back-end/types/MoviesTypes.ts`.
- **DASHBOARD-08** : Repository SQLite complet `movie-repository.ts` (`getMovieById`, `listMovies`, `upsertMovies` transactionnel).
- **DASHBOARD-08** : Suite de tests unitaires pour `movie-repository.ts` avec 100 % de couverture de code.
- **DASHBOARD-06** : Fonction `parseCountriesCsv` dans `src/back-end/utils/csv-parser.ts` avec validation ISO 2 lettres majuscules.
- **DASHBOARD-06** : Fonction transactionnelle `cleanUnusedCountries` dans `src/back-end/database/country-repository.ts`.
- **DASHBOARD-06** : Sous-commandes CLI `add-countries <csv-file>` et `clean-countries` dans `src/back-end/backend-cli.ts`.
- **DASHBOARD-06** : Jeu de données d'exemple dans `data/countries.csv`.
- **DASHBOARD-06** : Tests unitaires et d'intégration à 100 % de couverture.
- **DASHBOARD-05** : Module `country-repository.ts` pour la recherche par code, le listing ordonné et l'insertion/mise à jour transactionnelle des pays dans SQLite.
- **DASHBOARD-05** : Définition TypeScript du type `Country` dans `MoviesTypes.ts`.
- **DASHBOARD-05** : Tests unitaires complets pour `country-repository.ts` avec une couverture de code à 100 %.
- **DASHBOARD-04** : Parseur CSV RFC 4180 dans `src/back-end/utils/csv-parser.ts` avec support BOM UTF-8, quotes et validation d'en-têtes.
- **DASHBOARD-04** : Fonction transactionnelle `cleanUnusedGenres` dans `src/back-end/database/genre-repository.ts`.
- **DASHBOARD-04** : Commandes CLI `add-genres <csv-file>` et `clean-genres` dans `src/back-end/backend-cli.ts`.
- **DASHBOARD-04** : Tests unitaires et d'intégration à 100 % de couverture pour l'import CSV et le nettoyage des genres.
- **DASHBOARD-03** : Module `genre-repository.ts` pour la recherche par identifiant, le listing ordonné et l'insertion/mise à jour transactionnelle des genres dans SQLite.
- **DASHBOARD-03** : Définition TypeScript du type `Genre` dans `MoviesTypes.ts`.
- **DASHBOARD-03** : Tests unitaires complets pour `genre-repository.ts` avec une couverture de code à 100 %.
- **Documentation** : Création du guide de suivi technique et fil conducteur dans `docs/SUIVI_PROJET.md`.
- **DASHBOARD-02** : Schéma SQLite initial pour les films, genres et pays de production avec CLI backend (`backend-cli.ts`).
- **DASHBOARD-01** : Modélisation conceptuelle et relationnelle des données pour le tableau de bord historique.

## [1.0.0] - 2026-11-01

### Ajouté

- Version initiale de l'application de découverte TMDB avec frontend React et serveur Express intermédiaire.
