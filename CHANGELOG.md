# Changelog

Toutes les modifications notables apportées à ce projet sont documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [2.0.0] - En cours de développement

### Ajouté

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
