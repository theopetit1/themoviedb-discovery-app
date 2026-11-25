import './TopPopularMovieWidget.css';

export interface TopPopularMovieWidgetProps {
  /**
   * Title of the most popular movie.
   */
  title?: string | null;
  /**
   * Release year of the movie (number or string).
   */
  releaseYear?: number | string | null;
  /**
   * Popularity index. Must be strictly positive; null/undefined indicates absent data.
   */
  popularity?: number | null;
  /**
   * Optional URL or path to the movie poster.
   */
  posterPath?: string | null;
  /**
   * Indicates whether the widget data is currently loading.
   */
  loading?: boolean;
  /**
   * Optional error message if loading failed.
   */
  error?: string | null;
}

export default function TopPopularMovieWidget({
  title,
  releaseYear,
  popularity,
  posterPath,
  loading = false,
  error = null,
}: TopPopularMovieWidgetProps) {
  const isPopulated =
    typeof title === 'string' &&
    title.trim().length > 0 &&
    typeof popularity === 'number' &&
    popularity > 0;

  const formattedYear =
    releaseYear !== null &&
    releaseYear !== undefined &&
    String(releaseYear).trim().length > 0
      ? String(releaseYear).trim()
      : 'Année inconnue';

  const formattedPopularity = isPopulated
    ? new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(popularity)
    : null;

  const hasPoster =
    typeof posterPath === 'string' && posterPath.trim().length > 0;

  const posterSrc = hasPoster
    ? posterPath.startsWith('http') || posterPath.startsWith('/')
      ? posterPath
      : `https://image.tmdb.org/t/p/w200${posterPath}`
    : null;

  return (
    <article
      className="widget-card top-popular-movie-widget"
      aria-label="Widget Film le plus populaire"
    >
      <header className="widget-header">
        <span className="widget-icon" aria-hidden="true">
          🔥
        </span>
        <h3 className="widget-title">Film le plus populaire</h3>
      </header>

      <div className="widget-body">
        {loading ? (
          <div className="widget-loading" aria-label="Chargement en cours">
            <span className="widget-spinner" aria-hidden="true" />
            <span className="widget-loading-text">Chargement...</span>
          </div>
        ) : error ? (
          <div className="widget-error" role="alert">
            <span className="widget-error-icon" aria-hidden="true">
              ⚠️
            </span>
            <p className="widget-error-text">{error}</p>
          </div>
        ) : !isPopulated || formattedPopularity === null ? (
          <div className="widget-empty">
            <span className="widget-value widget-value-empty">&mdash;</span>
            <span className="widget-unit">Valeur inconnue</span>
          </div>
        ) : (
          <div className="top-popular-content">
            <div className="top-popular-poster-wrapper">
              {posterSrc ? (
                <img
                  src={posterSrc}
                  alt={`Affiche de ${title}`}
                  className="top-popular-poster-img"
                  loading="lazy"
                />
              ) : (
                <div
                  className="top-popular-poster-fallback"
                  aria-label="Affiche non disponible"
                  role="img"
                >
                  <span
                    className="top-popular-fallback-icon"
                    aria-hidden="true"
                  >
                    🎬
                  </span>
                  <span className="top-popular-fallback-text">
                    Sans affiche
                  </span>
                </div>
              )}
            </div>

            <div className="top-popular-info">
              <h4
                className="top-popular-title"
                data-testid="top-popular-title"
                title={title}
              >
                {title}
              </h4>
              <p className="top-popular-year" data-testid="top-popular-year">
                {formattedYear}
              </p>
              <div className="top-popular-metric-line">
                <span
                  className="widget-value top-popular-value"
                  data-testid="top-popular-value"
                >
                  {formattedPopularity}
                </span>
                <span className="top-popular-label">popularité</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
