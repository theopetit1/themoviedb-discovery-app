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

| Ticket                    | Titre                                             |  Scope   | Priorité | Taille |   Statut    | Branche                                                   | Tests |
| :------------------------ | :------------------------------------------------ | :------: | :------: | :----: | :---------: | :-------------------------------------------------------- | :---: |
| **DASHBOARD-01**          | Spécifier le modèle de données du tableau de bord | backend  |    P1    |   S    | ✅ Terminé  | `develop` (socle)                                         |   -   |
| **DASHBOARD-02**          | Mettre en place le schéma SQLite via CLI          | backend  |    P1    |   M    | ✅ Terminé  | `develop` (socle)                                         | 100%  |
| **DASHBOARD-03**          | Créer et mettre à jour les genres                 | backend  |    P1    |   M    | ✅ Terminé  | `feature/DASHBOARD-03-genres`                             | 100%  |
| **DASHBOARD-04**          | Importer genres depuis CSV & nettoyer inutilisés  | backend  |    P2    |   M    | ✅ Terminé  | `feature/DASHBOARD-04-genres-csv`                         | 100%  |
| **DASHBOARD-05**          | Créer et mettre à jour les pays                   | backend  |    P1    |   M    | ✅ Terminé  | `feature/DASHBOARD-05-countries`                          | 100%  |
| **DASHBOARD-06**          | Importer pays depuis CSV & nettoyer inutilisés    | backend  |    P2    |   M    | ✅ Terminé  | `feature/DASHBOARD-06-countries-csv`                      | 100%  |
| **DASHBOARD-07**          | Exposer films par année via API Discover          | backend  |    P2    |   M    | 🔍 En revue | `feature/DASHBOARD-07-discover-movies` (PR #30)           | 100%  |
| **DASHBOARD-08**          | Créer et mettre à jour les films                  | backend  |    P3    |   M    | 🔍 En revue | `feature/DASHBOARD-08-movies` (PR #31)                    | 100%  |
| **DASHBOARD-09**          | Importer/mettre à jour films depuis CSV           | backend  |    P3    |   M    | 🔍 En revue | `feature/DASHBOARD-09-movies-csv` (PR #32)                | 100%  |
| **DASHBOARD-10**          | Service de mise à jour films/genres/pays via API  | backend  |    P3    |   L    | 🔍 En revue | `feature/DASHBOARD-10-movie-sync-service` (PR en attente) | 100%  |
| **DASHBOARD-11**          | Page Dashboard sans widgets                       | frontend |    P3    |   M    | ⏳ À faire  | -                                                         |   -   |
| **DASHBOARD-12**          | Mise en œuvre de Storybook pour widgets           | frontend |    P3    |   S    | ⏳ À faire  | -                                                         |   -   |
| **DASHBOARD-13** à **24** | Widgets d'analyse (durée, note, rentabilité...)   | frontend |    P3    |   S    | ⏳ À faire  | -                                                         |   -   |
| **DASHBOARD-25**          | Intégrer les widgets dans le dashboard            | frontend |    P3    |   M    | ⏳ À faire  | -                                                         |   -   |

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

---

### Ticket [DASHBOARD-04] : Importer les genres depuis un CSV et nettoyer les genres inutilisés

- **Issue liée** : [#4](https://github.com/theopetit1/themoviedb-discovery-app/issues/4)
- **Branche** : `feature/DASHBOARD-04-genres-csv`
- **Fichiers créés / modifiés** :
  - `src/back-end/utils/csv-parser.ts` : Parseur CSV conforme RFC 4180 (BOM UTF-8, CRLF/LF, champs entre guillemets et virgules protégées, validation d'en-tête stricte insensible à la casse).
  - `src/back-end/utils/csv-parser.test.ts` : 15 tests unitaires couvrant tous les cas limites de parsing CSV et de validation des identifiants/noms.
  - `src/back-end/database/genre-repository.ts` : Ajout de la méthode `cleanUnusedGenres` transactionnelle (`DELETE FROM genres WHERE id NOT IN (SELECT DISTINCT genre_id FROM movie_genres)`).
  - `src/back-end/database/genre-repository.test.ts` : Tests de nettoyage des genres et de rollback en cas d'erreur.
  - `src/back-end/backend-cli.ts` : Ajout des sous-commandes CLI `add-genres <csv-file>` et `clean-genres` avec option `-p, --path`.
  - `src/back-end/backend-cli.test.ts` : Tests d'intégration CLI pour les commandes `add-genres` et `clean-genres`.

#### Choix d'Architecture & Conception

1. **Robustesse et conformité RFC 4180** : Parseur CSV autonome gérant le Byte Order Mark (BOM) UTF-8, les guillemets échappés `""`, les fins de ligne multi-plateformes (`\r\n`, `\n`) et ignorant les lignes vides.
2. **Validation préalable (Fail Fast)** : Le fichier CSV est entièrement validé syntaxiquement et sémantiquement avant toute ouverture de connexion à la base de données SQLite, évitant ainsi des verrous ou transactions orphelines.
3. **Atomicité et intégrité référentielle** : La purge des genres inutilisés s'exécute dans une transaction isolée et ne supprime que les genres strictement absents de la table de jointure `movie_genres`.
4. **Ergonomie CLI** : Affichage d'un retour utilisateur clair indiquant le nombre de lignes traitées/supprimées et le chemin absolu résolu de la base de données.

#### Preuves de Validation

- Vitest : **74/74 tests unitaires passés avec succès**.
- Couverture globale du projet : **100 % Stmts, 100 % Branch, 100 % Funcs, 100 % Lines**.
- Linters : 0 avertissement, 0 erreur (`oxlint`, `oxfmt`).

---

### Ticket [DASHBOARD-05] : Créer et mettre à jour les pays

- **Issue liée** : [#5](https://github.com/theopetit1/themoviedb-discovery-app/issues/5)
- **Branche** : `feature/DASHBOARD-05-countries`
- **Fichiers créés / modifiés** :
  - `src/back-end/types/MoviesTypes.ts` : Définition du type d'entité `Country` (`code: string; name: string;`).
  - `src/back-end/database/country-repository.ts` : Implémentation du repository des pays (`getCountryByCode`, `listCountries` trié par code ascendant, `upsertCountries` transactionnel).
  - `src/back-end/database/country-repository.test.ts` : 10 tests unitaires sur base SQLite en mémoire (recherche existant/inexistant, liste ordonnée, tableaux/itérables/générateurs, entrées vides, déduplication et conservation du dernier libellé, validation défensive et rollback).

#### Choix d'Architecture & Conception

1. **Isolation des responsabilités (Repository Pattern)** : Découplage strict de l'accès aux données de pays via `country-repository.ts`, permettant une réutilisation aisée pour les futurs imports CSV et services de synchronisation API.
2. **Gestion transactionnelle et intégrité** : Encapsulation complète des insertions/mises à jour dans une transaction SQLite (`BEGIN TRANSACTION` / `COMMIT` / `ROLLBACK`). En cas d'anomalie ou de format non conforme, la base conserve son état initial.
3. **Idempotence avec clause SQLite `ON CONFLICT`** : Utilisation de `INSERT INTO countries ... ON CONFLICT(code) DO UPDATE SET name = excluded.name` pour garantir l'absence de doublons et le remplacement immédiat du libellé par la dernière occurrence fournie.
4. **Validation stricte à l'entrée** : Contrôle du type et de la non-vacuité du code pays et du libellé pour éviter l'injection de données corrompues.

#### Preuves de Validation

- Vitest : **84/84 tests unitaires passés avec succès**.
- Couverture globale du projet : **100 % Stmts, 100 % Branch, 100 % Funcs, 100 % Lines**.
- Linters : 0 avertissement, 0 erreur (`oxlint`, `oxfmt`).

---

### Ticket [DASHBOARD-06] : Importer les pays depuis un CSV et nettoyer les pays inutilisés

- **Issue liée** : [#6](https://github.com/theopetit1/themoviedb-discovery-app/issues/6)
- **Branche** : `feature/DASHBOARD-06-countries-csv`
- **Fichiers créés / modifiés** :
  - `src/back-end/utils/csv-parser.ts` : Fonction `parseCountriesCsv` (RFC 4180, en-têtes `code` et `name` insensibles à la casse, format code ISO 2 lettres majuscules `/^[A-Z]{2}$/`, libellé non vide, support fichier ou texte brut).
  - `src/back-end/utils/csv-parser.test.ts` : Tests complets de validation et d'analyse des CSV de pays.
  - `src/back-end/database/country-repository.ts` : Fonction `cleanUnusedCountries` transactionnelle (`DELETE FROM countries WHERE code NOT IN (SELECT DISTINCT country_code FROM production_countries)`).
  - `src/back-end/database/country-repository.test.ts` : Tests de nettoyage et de rollback en cas d'erreur.
  - `src/back-end/backend-cli.ts` : Commandes CLI `add-countries <csv-file>` et `clean-countries` avec prise en charge de l'option `-p, --path` globale ou par sous-commande.
  - `src/back-end/backend-cli.test.ts` : Tests d'intégration du CLI pour l'import et le nettoyage des pays.
  - `data/countries.csv` : Jeu de données de test et d'exemple contenant des pays de référence.

#### Choix d'Architecture & Conception

1. **Validation stricte des codes ISO 3166-1 alpha-2** : Les codes pays sont validés par l'expression régulière `/^[A-Z]{2}$/` avant toute tentative d'insertion en base, garantissant la qualité des données.
2. **Support de l'option `--path` globale et par commande** : Résolution unifiée du chemin SQLite permettant son positionnement indifféremment avant la sous-commande (`node backend-cli.ts --path ... add-countries`) ou après (`node backend-cli.ts add-countries ... --path ...`).
3. **Validation Fail Fast** : Le fichier CSV est analysé et validé avant d'ouvrir la connexion SQLite, évitant l'allocation inutile de ressources ou les verrous en cas d'erreur de saisie.
4. **Intégrité référentielle** : Suppression ciblée uniquement des pays absents de la table relationnelle `production_countries`.

#### Preuves de Validation

- Vitest : **103/103 tests unitaires passés avec succès**.
- Couverture globale du projet : **100 % Stmts, 100 % Branch, 100 % Funcs, 100 % Lines**.
- Linters : 0 avertissement, 0 erreur (`oxlint`, `oxfmt`).

---

### Ticket [DASHBOARD-08] : Créer et mettre à jour les films

- **Issue liée** : [#8](https://github.com/theopetit1/themoviedb-discovery-app/issues/8)
- **Branche** : `feature/DASHBOARD-08-movies`
- **Fichiers créés / modifiés** :
  - `src/back-end/types/MoviesTypes.ts` : Définition du modèle `DbMovie` correspondant à la table SQLite `movies` et aux relations `movie_genres` et `production_countries`.
  - `src/back-end/database/movie-repository.ts` : Implémentation du repository de films (`getMovieById`, `listMovies` ordonné par `id ASC`, `upsertMovies` transactionnel et idempotent avec réconciliation des genres et pays).
  - `src/back-end/database/movie-repository.test.ts` : 10 tests unitaires complets sur base en mémoire (recherche existant/inexistant, valeurs nullables, liste ordonnée, tableaux/itérables/générateurs, idempotence, validation défensive stricte et rollback transactionnel).

#### Choix d'Architecture & Conception

1. **Typage strict et modèle unifié (`DbMovie`)** : Définition explicite des champs optionnels et obligatoires, avec prise en charge des associations relationnelles (`genre_ids?: number[]`, `production_country_codes?: string[]`).
2. **Gestion transactionnelle complète et intégrité relationnelle** : La fonction `upsertMovies` encapsule l'insertion/mise à jour du film, la synchronisation de ses genres associés (`movie_genres`) et de ses pays de production (`production_countries`) au sein d'une seule transaction atomique (`BEGIN` / `COMMIT` / `ROLLBACK`).
3. **Idempotence avec clause SQLite `ON CONFLICT`** : Utilisation de `INSERT INTO movies ... ON CONFLICT(id) DO UPDATE SET ...` garantissant la mise à jour des attributs du film sans création de doublons. Les tables de liaison associées sont rafraîchies pour refléter fidèlement le dernier état fourni.
4. **Validation défensive (Fail Fast)** : Vérification rigoureuse des champs obligatoires (`id > 0`, `title`, `original_title`, `original_language`, `overview`, `collected_at`) et des contraintes d'intégrité métier positives (`runtime_minutes > 0`, `budget > 0`, `revenue > 0`) avant toute persistance.
5. **Flexibilité des entrées** : Consommation générique de `Iterable<DbMovie>`, autorisant indifféremment des tableaux, des ensembles ou des flux de générateurs.

#### Preuves de Validation

- Vitest : **113/113 tests unitaires passés avec succès**.
- Couverture globale du projet : **100 % Stmts, 100 % Branch, 100 % Funcs, 100 % Lines**.
- Linters : 0 avertissement, 0 erreur (`oxlint`, `oxfmt`).

---

### Ticket [DASHBOARD-09] : Importer et mettre à jour les films à partir d'un fichier CSV

- **Issue liée** : [#9](https://github.com/theopetit1/themoviedb-discovery-app/issues/9)
- **Branche** : `feature/DASHBOARD-09-movies-csv`
- **Fichiers créés / modifiés** :
  - `src/back-end/utils/csv-parser.ts` : Fonction `parseMoviesCsv` (validation RFC 4180, en-têtes obligatoires `id`, `title`, `original_title`, `original_language`, `overview`, colonnes optionnelles de métriques et associations `genre_ids` et `production_country_codes`).
  - `src/back-end/utils/csv-parser.test.ts` : Tests unitaires exhaustifs couvrant les cas nominaux, les valeurs nullables, les erreurs de syntaxe, de types et de bornes.
  - `src/back-end/backend-cli.ts` : Sous-commande CLI `add-movies <csv-file>` avec prise en charge de l'option globale ou locale `-p, --path`.
  - `src/back-end/backend-cli.test.ts` : Tests d'intégration CLI pour l'import des films.
  - `data/movies.csv` : Jeu de données de test avec exemples réels (_Fight Club_, _Interstellar_, _Le Voyage de Chihiro_).

#### Choix d'Architecture & Conception

1. **Validation stricte préalable (Fail Fast)** : L'analyse lexicale et sémantique du fichier CSV est réalisée avant toute connexion à SQLite. Si une seule ligne présente une anomalie (identifiant non entier positif, note hors bornes [0;10], durée ou budget non strictement positifs, code pays invalide), l'exécution s'interrompt avec une erreur explicite sans modifier la base.
2. **Reconstitution relationnelle des associations** : La fonction `parseMoviesCsv` extrait les listes délimitées par point-virgule pour `genre_ids` et `production_country_codes` afin d'alimenter directement les tables de jointure SQLite (`movie_genres` et `production_countries`) au sein de la transaction d'`upsertMovies`.
3. **Idempotence et mise à jour atomique** : L'importation s'appuie sur le repository `movie-repository.ts` garantissant qu'une ré-exécution du même fichier actualise les fiches existantes sans duplication.
4. **Cohérence ergonomique du CLI** : La commande `add-movies` s'intègre harmonieusement aux commandes existantes `add-genres` et `add-countries`.

#### Preuves de Validation

- Vitest : **129/129 tests unitaires passés avec succès**.
- Couverture globale du projet : **100 % Stmts, 100 % Branch, 100 % Funcs, 100 % Lines**.
- Linters : 0 avertissement, 0 erreur (`oxlint`, `oxfmt`).

---

### Ticket [DASHBOARD-10] : Mettre en place le service permettant de mettre à jour les films, genres et pays à partir des APIs mises en place

- **Issue liée** : [#10](https://github.com/theopetit1/themoviedb-discovery-app/issues/10)
- **Branche** : `feature/DASHBOARD-10-movie-sync-service`
- **Fichiers créés / modifiés** :
  - `src/back-end/services/sync-service.ts` : Service complet d'orchestration (`updateGenresFromApi`, `updateCountriesFromApi`, `updateMovieDetailsFromApi`, `updatePopularMoviesFromApi`, `updateAllFromApi`).
  - `src/back-end/services/sync-service.test.ts` : 14 tests unitaires exhaustifs avec mock réseau et validation SQLite en mémoire.
  - `src/back-end/backend-cli.ts` : Sous-commandes CLI `update-genres`, `update-countries`, `update-movies [--id <id>] [--pages <pages>]` et `update-all [--pages <pages>]` avec exécution asynchrone sécurisée (`parseAsync`).
  - `src/back-end/backend-cli.test.ts` : Tests d'intégration CLI pour l'ensemble des commandes de mise à jour depuis les APIs.

#### Choix d'Architecture & Conception

1. **Découplage de la couche Service (Pattern Service Layer)** : Le module `sync-service.ts` concentre la logique d'appel aux APIs externes, de normalisation des flux JSON et de mapping vers les entités SQLite métier, isolant les repositories et le CLI de tout couplage direct avec les protocoles réseau.
2. **Synchronisation en cascade des relations** : Lors de l'actualisation d'un film (`updateMovieDetailsFromApi`), ses genres et pays de production associés sont automatiquement synchronisés dans les tables `genres` et `countries` avant l'enregistrement des jointures, prévenant toute violation d'intégrité référentielle SQLite.
3. **Robustesse et gestion défensive des métriques** : Validation et conversion sécurisée des valeurs nullables ou numériques (notes, durées positives, budgets, recettes) et repli transparent vers `null` pour préserver la fidélité des statistiques d'analyse.
4. **Ergonomie et pilotage CLI unifié** : Les nouvelles commandes CLI permettent d'exécuter des mises à jour granulaires ou globales avec gestion du chemin configurable `--path` et fermeture systématique des connexions dans des blocs `finally`.

#### Preuves de Validation

- Vitest : **154/154 tests unitaires passés avec succès**.
- Couverture globale du projet : **100 % Stmts, 100 % Branch, 100 % Funcs, 100 % Lines**.
- Linters : 0 avertissement, 0 erreur (`oxlint`, `oxfmt`).
