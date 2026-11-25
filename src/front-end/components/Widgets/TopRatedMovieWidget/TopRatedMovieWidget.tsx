import './TopRatedMovieWidget.css';

export interface TopRatedMovieWidgetProps {
  /**
   * Title of the top-rated movie.
   */
  title?: string | null;
  /**
   * Release year of the movie (number or string).
   */
  releaseYear?: number | string | null;
  /**
   * Rating out of 10. Must be strictly positive; null/undefined indicates absent data.
   */
  rating?: number | null;
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

export default function TopRatedMovieWidget({
  title,
  releaseYear,
  rating,
  posterPath,
  loading = false,
  error = null,
}: TopRatedMovieWidgetProps) {
  const isPopulated =
    typeof title === 'string' &&
    title.trim().length > 0 &&
    typeof rating === 'number' &&
    rating > 0;

  const formattedYear =
    releaseYear !== null &&
    releaseYear !== undefined &&
    String(releaseYear).trim().length > 0
      ? String(releaseYear).trim()
      : 'Année inconnue';

  const formattedRating = isPopulated
    ? new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }).format(rating)
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
      className="widget-card top-rated-movie-widget"
      aria-label="Widget Film le mieux noté"
    >
      <header className="widget-header">
        <span className="widget-icon" aria-hidden="true">
          🏆
        </span>
        <h3 className="widget-title">Film le mieux noté</h3>
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
        ) : !isPopulated || formattedRating === null ? (
          <div className="widget-empty">
            <span className="widget-value widget-value-empty">&mdash;</span>
            <span className="widget-unit">Aucun film noté</span>
          </div>
        ) : (
          <div className="top-rated-content">
            <div className="top-rated-poster-wrapper">
              {posterSrc ? (
                <img
                  src={posterSrc}
                  alt={`Affiche de ${title}`}
                  className="top-rated-poster-img"
                  loading="lazy"
                />
              ) : (
                <div
                  className="top-rated-poster-fallback"
                  aria-label="Affiche non disponible"
                  role="img"
                >
                  <span className="top-rated-fallback-icon" aria-hidden="true">
                    🎬
                  </span>
                  <span className="top-rated-fallback-text">Sans affiche</span>
                </div>
              )}
            </div>

            <div className="top-rated-info">
              <h4
                className="top-rated-title"
                data-testid="top-rated-title"
                title={title}
              >
                {title}
              </h4>
              <p className="top-rated-year" data-testid="top-rated-year">
                {formattedYear}
              </p>
              <div className="top-rated-rating-line">
                <span
                  className="widget-value top-rated-rating-value"
                  data-testid="top-rated-rating"
                >
                  {formattedRating}
                </span>
                <span className="widget-scale">/ 10</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
