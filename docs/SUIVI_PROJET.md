# 📋 Suivi de Projet & Fil Conducteur - Version 2.0.0

Ce document sert de **fil conducteur et de journal de bord technique** pour le suivi, la réalisation et l'évaluation des tickets de la version **2.0.0** de l'application TMDB Discovery App.

---

## 🧭 Vue d'ensemble du Projet

- **Auteur** : Théo PETIT (`theopetit1`)
- **Projet GitHub (Kanban)** : [TMDB - Backlog](https://github.com/users/theopetit1/projects/1)
- **Dépôt** : [theopetit1/themoviedb-discovery-app](https://github.com/theopetit1/themoviedb-discovery-app)
- **Convention de branchement** : Git Flow (`main` pour les releases de production, `develop` pour l'intégration, `feature/<nom-ticket>` par ticket)
- **Conventions de commit** : Conventional Commits avec Gitmojis (`feat: ✨`, `test: ✅`, `docs: 📝`, `refactor: ♻️`)
- **Exigence qualité** : 100 % de couverture de tests Vitest (Stmts, Branch, Funcs, Lines), conformité `oxlint` et `oxfmt`

---

## 📊 Matrice d'avancement des Tickets

| Ticket                    | Titre                                             |  Scope   | Priorité | Taille |   Statut   | Branche                       | Tests |
| :------------------------ | :------------------------------------------------ | :------: | :------: | :----: | :--------: | :---------------------------- | :---: |
| **DASHBOARD-01**          | Spécifier le modèle de données du tableau de bord | backend  |    P1    |   S    | ✅ Terminé | `develop` (socle)             |   -   |
| **DASHBOARD-02**          | Mettre en place le schéma SQLite via CLI          | backend  |    P1    |   M    | ✅ Terminé | `develop` (socle)             | 100%  |
| **DASHBOARD-03**          | Créer et mettre à jour les genres                 | backend  |    P1    |   M    | ✅ Terminé | `feature/DASHBOARD-03-genres` | 100%  |
| **DASHBOARD-04**          | Importer genres depuis CSV & nettoyer inutilisés  | backend  |    P2    |   M    | ⏳ À faire | -                             |   -   |
| **DASHBOARD-05**          | Créer et mettre à jour les pays                   | backend  |    P1    |   M    | ⏳ À faire | -                             |   -   |
| **DASHBOARD-06**          | Importer pays depuis CSV & nettoyer inutilisés    | backend  |    P2    |   M    | ⏳ À faire | -                             |   -   |
| **DASHBOARD-07**          | Exposer films par année via API Discover          | backend  |    P2    |   M    | ⏳ À faire | -                             |   -   |
| **DASHBOARD-08**          | Créer et mettre à jour les films                  | backend  |    P3    |   M    | ⏳ À faire | -                             |   -   |
| **DASHBOARD-09**          | Importer/mettre à jour films depuis CSV           | backend  |    P3    |   M    | ⏳ À faire | -                             |   -   |
| **DASHBOARD-10**          | Service de mise à jour films/genres/pays via API  | backend  |    P3    |   L    | ⏳ À faire | -                             |   -   |
| **DASHBOARD-11**          | Page Dashboard sans widgets                       | frontend |    P3    |   M    | ⏳ À faire | -                             |   -   |
| **DASHBOARD-12**          | Mise en œuvre de Storybook pour widgets           | frontend |    P3    |   S    | ⏳ À faire | -                             |   -   |
| **DASHBOARD-13** à **24** | Widgets d'analyse (durée, note, rentabilité...)   | frontend |    P3    |   S    | ⏳ À faire | -                             |   -   |
| **DASHBOARD-25**          | Intégrer les widgets dans le dashboard            | frontend |    P3    |   M    | ⏳ À faire | -                             |   -   |

---

## 📝 Journal Technique des Réalisations

### Ticket [DASHBOARD-03] : Créer et mettre à jour les genres

- **Issue liée** : [#3](https://github.com/theopetit1/themoviedb-discovery-app/issues/3)
- **Branche** : `feature/DASHBOARD-03-genres`
- **Fichiers créés / modifiés** :
  - `src/back-end/types/MoviesTypes.ts` : Définition du type d'entité `Genre` (`id: number; name: string;`).
  - `src/back-end/database/genre-repository.ts` : Implémentation du pattern Repository pour l'entité Genre.
  - `src/back-end/database/genre-repository.test.ts` : Suite de 10 tests unitaires sur base SQLite en mémoire.

#### Choix d'Architecture & Conception

1. **Séparation des responsabilités (Pattern Repository)** : Le module `genre-repository.ts` isole la logique SQL du reste de l'application, assurant un code modulaire, typé et facilement testable.
2. **Atomicité des transactions** : La fonction `upsertGenres` encapsule l'ensemble des opérations dans une transaction (`BEGIN TRANSACTION` / `COMMIT` / `ROLLBACK`). En cas de donnée invalide au milieu du traitement, l'intégrité de la base est préservée.
3. **Idempotence et déduplication** : Exploitation de la clause SQLite `ON CONFLICT(id) DO UPDATE SET name = excluded.name` garantissant qu'aucune insertion en double n'est effectuée et qu'en cas d'identifiant répété, le dernier libellé fourni est conservé.
4. **Généricité des entrées** : Prise en charge d'un `Iterable<Genre>`, permettant de consommer indifféremment des tableaux (`Array`), des ensembles (`Set`) ou des générateurs sans copie mémoire préalable.
5. **Validation défensive** : Vérification stricte des contraintes d'intégrité (identifiant entier et nom non vide obligatoire).

#### Preuves de Validation

- Exécution de Vitest : **10/10 tests unitaires passés avec succès**.
- Couverture globale du projet : **100 % Stmts, 100 % Branch, 100 % Funcs, 100 % Lines**.
- Linters : 0 avertissement, 0 erreur (`oxlint`, `oxfmt`).
