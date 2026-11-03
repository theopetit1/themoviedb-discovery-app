# Changelog

Toutes les modifications notables apportées à ce projet sont documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [2.0.0] - En cours de développement

### Ajouté

- **DASHBOARD-03** : Module `genre-repository.ts` pour la recherche par identifiant, le listing ordonné et l'insertion/mise à jour transactionnelle des genres dans SQLite.
- **DASHBOARD-03** : Définition TypeScript du type `Genre` dans `MoviesTypes.ts`.
- **DASHBOARD-03** : Tests unitaires complets pour `genre-repository.ts` avec une couverture de code à 100 %.
- **Documentation** : Création du guide de suivi technique et fil conducteur dans `docs/SUIVI_PROJET.md`.
- **DASHBOARD-02** : Schéma SQLite initial pour les films, genres et pays de production avec CLI backend (`backend-cli.ts`).
- **DASHBOARD-01** : Modélisation conceptuelle et relationnelle des données pour le tableau de bord historique.

## [1.0.0] - 2026-11-01

### Ajouté

- Version initiale de l'application de découverte TMDB avec frontend React et serveur Express intermédiaire.
