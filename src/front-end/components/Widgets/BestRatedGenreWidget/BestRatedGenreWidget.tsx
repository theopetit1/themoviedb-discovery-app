import './BestRatedGenreWidget.css';

/**
 * Règle métier :
 * Le widget présente le genre obtenant la meilleure moyenne arithmétique simple de ses films.
 * Cette valeur est explicitement distincte de la moyenne pondérée (bayésienne).
 *
 * Règle d'éligibilité et distinction stricte :
 * - Les notes prises en compte doivent être strictement positives (0 < note <= 10).
 * - Un genre sans notes exploitables ne doit pas être présenté comme noté zéro,
 *   mais par un tiret d'absence de donnée ("Aucune note").
 * - Le composant consomme le résultat déjà calculé sans effectuer de calcul arbitraire.
 */

export interface BestRatedGenreWidgetProps {
  /**
   * Nom du genre ayant la meilleure note moyenne (ex: "Animation").
   */
  genreName?: string | null;
  /**
   * Note moyenne simple sur 10 (ex: 7.41).
   */
  rating?: number | null;
  /**
   * Indique si les données sont en cours de chargement.
   */
  loading?: boolean;
  /**
   * Message d'erreur éventuel.
   */
  error?: string | null;
}

export default function BestRatedGenreWidget({
  genreName,
  rating,
  loading = false,
  error = null,
}: BestRatedGenreWidgetProps) {
  const isPopulated =
    typeof genreName === 'string' &&
    genreName.trim().length > 0 &&
    typeof rating === 'number' &&
    !Number.isNaN(rating) &&
    rating > 0 &&
    rating <= 10;

  const formattedRating = isPopulated
    ? new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(rating)
    : null;

  return (
    <article
      className="widget-card best-rated-genre-widget"
      aria-label="Widget Meilleure note par genre"
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
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        <h3 className="widget-title">Meilleure note</h3>
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
        ) : !isPopulated || formattedRating === null ? (
          <div className="widget-empty">
            <span className="widget-value widget-value-empty">&mdash;</span>
            <span className="widget-unit">Aucune note</span>
          </div>
        ) : (
          <div className="widget-metric best-rated-genre-metric">
            <span
              className="best-rated-genre-name"
              data-testid="best-rated-genre-name"
              title={genreName}
            >
              {genreName}
            </span>
            <div className="best-rated-genre-score-wrapper">
              <span
                className="best-rated-genre-value"
                data-testid="best-rated-genre-value"
              >
                {formattedRating}
              </span>
              <span
                className="best-rated-genre-scale"
                data-testid="best-rated-genre-scale"
              >
                / 10
              </span>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
