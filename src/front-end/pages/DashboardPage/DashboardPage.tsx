import { useState } from 'react';
import './DashboardPage.css';
import MoviesCountWidget from '../../components/Widgets/MoviesCountWidget/MoviesCountWidget';
import AverageRuntimeWidget from '../../components/Widgets/AverageRuntimeWidget/AverageRuntimeWidget';
import AverageRatingWidget from '../../components/Widgets/AverageRatingWidget/AverageRatingWidget';
import GenresCountWidget from '../../components/Widgets/GenresCountWidget/GenresCountWidget';
import DominantGenreWidget from '../../components/Widgets/DominantGenreWidget/DominantGenreWidget';
import BestRatedGenreWidget from '../../components/Widgets/BestRatedGenreWidget/BestRatedGenreWidget';
import BestWeightedRatedGenreWidget from '../../components/Widgets/BestWeightedRatedGenreWidget/BestWeightedRatedGenreWidget';
import TopCountryWidget from '../../components/Widgets/TopCountryWidget/TopCountryWidget';
import TopPopularMovieWidget from '../../components/Widgets/TopPopularMovieWidget/TopPopularMovieWidget';
import TopRatedMovieWidget from '../../components/Widgets/TopRatedMovieWidget/TopRatedMovieWidget';
import TopProfitableMovieWidget from '../../components/Widgets/TopProfitableMovieWidget/TopProfitableMovieWidget';
import LeastProfitableMovieWidget from '../../components/Widgets/LeastProfitableMovieWidget/LeastProfitableMovieWidget';

export type DashboardPeriod = 'all' | '2024' | '2020-2023';

export interface DashboardMetrics {
  moviesCount: number | null;
  averageRuntime: number | null;
  averageRating: number | null;
  genresCount: number | null;
  dominantGenre: { name: string; count: number } | null;
  bestRatedGenre: { name: string; rating: number } | null;
  bestWeightedRatedGenre: { name: string; rating: number } | null;
  topCountry: { name: string; count: number } | null;
  topPopularMovie: {
    title: string;
    releaseYear: number | string;
    popularity: number;
    posterPath?: string | null;
  } | null;
  topRatedMovie: {
    title: string;
    releaseYear: number | string;
    rating: number;
    posterPath?: string | null;
  } | null;
  topProfitableMovie: {
    title: string;
    releaseYear: number | string;
    roi: number;
    posterPath?: string | null;
  } | null;
  leastProfitableMovie: {
    title: string;
    releaseYear: number | string;
    roi: number;
    posterPath?: string | null;
  } | null;
}

export const PERIOD_DATASETS: Record<DashboardPeriod, DashboardMetrics> = {
  all: {
    moviesCount: 1000,
    averageRuntime: 107,
    averageRating: 6.78,
    genresCount: 19,
    dominantGenre: { name: 'Drame', count: 488 },
    bestRatedGenre: { name: 'Animation', rating: 7.41 },
    bestWeightedRatedGenre: { name: 'Animation', rating: 7.68 },
    topCountry: { name: 'United States of America', count: 725 },
    topPopularMovie: {
      title: 'Deadpool & Wolverine',
      releaseYear: 2024,
      popularity: 1036.49,
      posterPath: '/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    },
    topRatedMovie: {
      title: 'The Shawshank Redemption',
      releaseYear: 1994,
      rating: 9.1,
      posterPath: '/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg',
    },
    topProfitableMovie: {
      title: 'Paranormal Activity',
      releaseYear: 2009,
      roi: 69667.36,
      posterPath: '/paranormal-activity.jpg',
    },
    leastProfitableMovie: {
      title: 'The 13th Warrior',
      releaseYear: 1999,
      roi: -99.99,
      posterPath: '/13th-warrior.jpg',
    },
  },
  '2024': {
    moviesCount: 120,
    averageRuntime: 112,
    averageRating: 7.15,
    genresCount: 16,
    dominantGenre: { name: 'Action', count: 42 },
    bestRatedGenre: { name: 'Animation', rating: 7.82 },
    bestWeightedRatedGenre: { name: 'Animation', rating: 7.75 },
    topCountry: { name: 'United States of America', count: 85 },
    topPopularMovie: {
      title: 'Deadpool & Wolverine',
      releaseYear: 2024,
      popularity: 1036.49,
      posterPath: '/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    },
    topRatedMovie: {
      title: 'Dune: Part Two',
      releaseYear: 2024,
      rating: 8.3,
      posterPath: '/dune2.jpg',
    },
    topProfitableMovie: {
      title: 'Alien: Romulus',
      releaseYear: 2024,
      roi: 350.25,
      posterPath: '/alien.jpg',
    },
    leastProfitableMovie: {
      title: 'Madame Web',
      releaseYear: 2024,
      roi: -18.45,
      posterPath: '/madame-web.jpg',
    },
  },
  '2020-2023': {
    moviesCount: 410,
    averageRuntime: 105,
    averageRating: 6.64,
    genresCount: 18,
    dominantGenre: { name: 'Comédie', count: 180 },
    bestRatedGenre: { name: 'Drame', rating: 7.3 },
    bestWeightedRatedGenre: { name: 'Drame', rating: 7.22 },
    topCountry: { name: 'France', count: 140 },
    topPopularMovie: {
      title: 'Spider-Man: No Way Home',
      releaseYear: 2021,
      popularity: 980.12,
      posterPath: '/spiderman.jpg',
    },
    topRatedMovie: {
      title: 'Spider-Man: Across the Spider-Verse',
      releaseYear: 2023,
      rating: 8.4,
      posterPath: '/spiderverse.jpg',
    },
    topProfitableMovie: {
      title: 'Godzilla Minus One',
      releaseYear: 2023,
      roi: 650.8,
      posterPath: '/godzilla.jpg',
    },
    leastProfitableMovie: {
      title: 'The Flash',
      releaseYear: 2023,
      roi: -38.2,
      posterPath: '/flash.jpg',
    },
  },
};

export interface DashboardPageProps {
  initialPeriod?: DashboardPeriod;
  initialLoading?: boolean;
  initialError?: string | null;
  customData?: Partial<DashboardMetrics> | null;
}

export default function DashboardPage({
  initialPeriod = 'all',
  initialLoading = false,
  initialError = null,
  customData = null,
}: DashboardPageProps) {
  const [selectedPeriod, setSelectedPeriod] =
    useState<DashboardPeriod>(initialPeriod);
  const [isLoading, setIsLoading] = useState<boolean>(initialLoading);
  const [errorMessage, setErrorMessage] = useState<string | null>(initialError);

  const activeDataset = customData
    ? { ...PERIOD_DATASETS[selectedPeriod], ...customData }
    : PERIOD_DATASETS[selectedPeriod];

  const handlePeriodChange = (period: DashboardPeriod) => {
    setSelectedPeriod(period);
    setErrorMessage(null);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 250);
  };

  const handleReset = () => {
    setSelectedPeriod('all');
    setIsLoading(false);
    setErrorMessage(null);
  };

  return (
    <main
      className="app-shell dashboard-page"
      aria-label="Tableau de bord des films"
    >
      <header className="dashboard-hero">
        <div className="dashboard-hero-content">
          <p className="dashboard-eyebrow">TMDB Discovery</p>
          <h1>Tableau de bord des films</h1>
          <p className="dashboard-intro">
            Vue synthétique des indicateurs clés, de la répartition par genre et
            du palmarès des productions cinématographiques.
          </p>
        </div>

        <nav
          className="dashboard-toolbar"
          aria-label="Filtres du tableau de bord"
        >
          <div
            className="dashboard-period-filters"
            role="group"
            aria-label="Sélection de la période"
          >
            <button
              type="button"
              className={`dashboard-filter-btn ${selectedPeriod === 'all' ? 'active' : ''}`}
              onClick={() => handlePeriodChange('all')}
              aria-pressed={selectedPeriod === 'all'}
            >
              2015 &ndash; 2024
            </button>
            <button
              type="button"
              className={`dashboard-filter-btn ${selectedPeriod === '2024' ? 'active' : ''}`}
              onClick={() => handlePeriodChange('2024')}
              aria-pressed={selectedPeriod === '2024'}
            >
              2024
            </button>
            <button
              type="button"
              className={`dashboard-filter-btn ${selectedPeriod === '2020-2023' ? 'active' : ''}`}
              onClick={() => handlePeriodChange('2020-2023')}
              aria-pressed={selectedPeriod === '2020-2023'}
            >
              2020 &ndash; 2023
            </button>
          </div>

          <div className="dashboard-actions">
            <button
              type="button"
              className="dashboard-action-btn"
              onClick={handleRefresh}
              aria-label="Actualiser les données"
            >
              Actualiser
            </button>
            <button
              type="button"
              className="dashboard-action-btn secondary"
              onClick={handleReset}
              aria-label="Réinitialiser les filtres"
            >
              Réinitialiser
            </button>
          </div>
        </nav>
      </header>

      <section
        className="dashboard-section"
        aria-labelledby="section-overview-title"
      >
        <div className="dashboard-section-header">
          <h2 id="section-overview-title" className="dashboard-section-title">
            Indicateurs généraux
          </h2>
          <span className="dashboard-section-badge">Volume & moyennes</span>
        </div>
        <div className="dashboard-grid dashboard-grid-overview">
          <MoviesCountWidget
            count={activeDataset.moviesCount}
            loading={isLoading}
            error={errorMessage}
          />
          <AverageRuntimeWidget
            runtimeMinutes={activeDataset.averageRuntime}
            loading={isLoading}
            error={errorMessage}
          />
          <AverageRatingWidget
            averageRating={activeDataset.averageRating}
            loading={isLoading}
            error={errorMessage}
          />
          <GenresCountWidget
            count={activeDataset.genresCount}
            loading={isLoading}
            error={errorMessage}
          />
        </div>
      </section>

      <section
        className="dashboard-section"
        aria-labelledby="section-genres-countries-title"
      >
        <div className="dashboard-section-header">
          <h2
            id="section-genres-countries-title"
            className="dashboard-section-title"
          >
            Genres et pays de production
          </h2>
          <span className="dashboard-section-badge">Répartition</span>
        </div>
        <div className="dashboard-grid dashboard-grid-categories">
          <DominantGenreWidget
            genreName={activeDataset.dominantGenre?.name}
            movieCount={activeDataset.dominantGenre?.count}
            loading={isLoading}
            error={errorMessage}
          />
          <BestRatedGenreWidget
            genreName={activeDataset.bestRatedGenre?.name}
            rating={activeDataset.bestRatedGenre?.rating}
            loading={isLoading}
            error={errorMessage}
          />
          <BestWeightedRatedGenreWidget
            genreName={activeDataset.bestWeightedRatedGenre?.name}
            rating={activeDataset.bestWeightedRatedGenre?.rating}
            loading={isLoading}
            error={errorMessage}
          />
          <TopCountryWidget
            countryName={activeDataset.topCountry?.name}
            movieCount={activeDataset.topCountry?.count}
            loading={isLoading}
            error={errorMessage}
          />
        </div>
      </section>

      <section
        className="dashboard-section"
        aria-labelledby="section-movies-awards-title"
      >
        <div className="dashboard-section-header">
          <h2
            id="section-movies-awards-title"
            className="dashboard-section-title"
          >
            Palmarès des films
          </h2>
          <span className="dashboard-section-badge">Distinctions</span>
        </div>
        <div className="dashboard-grid dashboard-grid-movies">
          <TopPopularMovieWidget
            title={activeDataset.topPopularMovie?.title}
            releaseYear={activeDataset.topPopularMovie?.releaseYear}
            popularity={activeDataset.topPopularMovie?.popularity}
            posterPath={activeDataset.topPopularMovie?.posterPath}
            loading={isLoading}
            error={errorMessage}
          />
          <TopRatedMovieWidget
            title={activeDataset.topRatedMovie?.title}
            releaseYear={activeDataset.topRatedMovie?.releaseYear}
            rating={activeDataset.topRatedMovie?.rating}
            posterPath={activeDataset.topRatedMovie?.posterPath}
            loading={isLoading}
            error={errorMessage}
          />
          <TopProfitableMovieWidget
            title={activeDataset.topProfitableMovie?.title}
            releaseYear={activeDataset.topProfitableMovie?.releaseYear}
            roi={activeDataset.topProfitableMovie?.roi}
            posterPath={activeDataset.topProfitableMovie?.posterPath}
            loading={isLoading}
            error={errorMessage}
          />
          <LeastProfitableMovieWidget
            title={activeDataset.leastProfitableMovie?.title}
            releaseYear={activeDataset.leastProfitableMovie?.releaseYear}
            roi={activeDataset.leastProfitableMovie?.roi}
            posterPath={activeDataset.leastProfitableMovie?.posterPath}
            loading={isLoading}
            error={errorMessage}
          />
        </div>
      </section>
    </main>
  );
}
