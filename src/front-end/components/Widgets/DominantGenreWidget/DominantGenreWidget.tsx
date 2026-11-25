import './DominantGenreWidget.css';

/**
 * Règle métier :
 * Le genre dominant correspond au genre associé au plus grand nombre de films dans la sélection active.
 *
 * Règle de départage documentée :
 * En cas d'ex æquo sur le nombre maximal de films, le départage s'effectue par ordre alphabétique
 * croissant du libellé de genre (A -> Z), ou à défaut par le plus petit identifiant TMDB.
 * Le composant affiche le résultat calculé en amont sans appliquer de tri arbitraire.
 */

export interface DominantGenreWidgetProps {
  /**
   * Nom du genre dominant (ex: "Drame").
   */
  genreName?: string | null;
  /**
   * Nombre de films associés à ce genre.
   */
  movieCount?: number | null;
  /**
   * Indique si les données sont en cours de chargement.
   */
  loading?: boolean;
  /**
   * Message d'erreur éventuel.
   */
  error?: string | null;
}

export default function DominantGenreWidget({
  genreName,
  movieCount,
  loading = false,
  error = null,
}: DominantGenreWidgetProps) {
  const isPopulated =
    typeof genreName === 'string' &&
    genreName.trim().length > 0 &&
    typeof movieCount === 'number' &&
    movieCount > 0;

  const formattedCount = isPopulated
    ? new Intl.NumberFormat('fr-FR').format(movieCount)
    : null;

  const unitLabel = isPopulated ? (movieCount === 1 ? 'film' : 'films') : null;

  return (
    <article
      className="widget-card dominant-genre-widget"
      aria-label="Widget Genre dominant"
    >
      <header className="widget-header">
        <svg
          className="widget-svg-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="8" r="7" />
          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
        </svg>
        <h3 className="widget-title">Genre dominant</h3>
      </header>

      <div className="widget-body">
        {loading ? (
          <div className="widget-loading" aria-label="Chargement en cours">
            <span className="widget-spinner" aria-hidden="true" />
            <span className="widget-loading-text">Chargement...</span>
          </div>
        ) : error ? (
          <div className="widget-error" role="alert">
            <svg
              className="widget-error-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="widget-error-text">{error}</p>
          </div>
        ) : !isPopulated || formattedCount === null ? (
          <div className="widget-empty">
            <span className="widget-value widget-value-empty">&mdash;</span>
            <span className="widget-unit">Aucun genre connu</span>
          </div>
        ) : (
          <div className="widget-metric dominant-genre-metric">
            <span
              className="dominant-genre-name"
              data-testid="dominant-genre-name"
              title={genreName}
            >
              {genreName}
            </span>
            <div className="dominant-genre-count-wrapper">
              <span
                className="dominant-genre-count"
                data-testid="dominant-genre-count"
              >
                {formattedCount}
              </span>
              <span
                className="dominant-genre-unit"
                data-testid="dominant-genre-unit"
              >
                {unitLabel}
              </span>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
