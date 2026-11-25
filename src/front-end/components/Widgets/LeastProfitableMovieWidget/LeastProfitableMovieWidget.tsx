import './LeastProfitableMovieWidget.css';

/**
 * Règle métier et formule validée pour le calcul de rentabilité (ROI) :
 *
 * Formule du ROI (Return On Investment) :
 *   ROI = ((revenue - budget) / budget) * 100
 *
 * Règles d'éligibilité des données réelles :
 * - Le budget doit être strictement positif (budget > 0).
 * - Les recettes doivent être strictement positives (revenue > 0).
 * - Les films sans budget ou sans recettes déclarés (valeurs 0 ou nulles dans TMDB)
 *   sont exclus du classement pour éviter toute distorsion mathématique (division par zéro).
 * - Le composant consomme le résultat déjà calculé sans recalculer ni réordonner les données.
 * - Une valeur inconnue ou absente n'est pas présentée comme zéro.
 */

export interface LeastProfitableMovieWidgetProps {
  /**
   * Titre du film le moins rentable.
   */
  title?: string | null;
  /**
   * Année de sortie du film (nombre ou chaîne).
   */
  releaseYear?: number | string | null;
  /**
   * Taux de retour sur investissement (ROI) exprimé en pourcentage.
   * Doit être un nombre fini ; null/undefined indique l'absence de film éligible.
   */
  roi?: number | null;
  /**
   * Chemin ou URL vers l'affiche du film.
   */
  posterPath?: string | null;
  /**
   * Indique si les données sont en cours de chargement.
   */
  loading?: boolean;
  /**
   * Message d'erreur éventuel.
   */
  error?: string | null;
}

export default function LeastProfitableMovieWidget({
  title,
  releaseYear,
  roi,
  posterPath,
  loading = false,
  error = null,
}: LeastProfitableMovieWidgetProps) {
  const isPopulated =
    typeof title === 'string' &&
    title.trim().length > 0 &&
    typeof roi === 'number' &&
    !Number.isNaN(roi);

  const formattedYear =
    releaseYear !== null &&
    releaseYear !== undefined &&
    String(releaseYear).trim().length > 0
      ? String(releaseYear).trim()
      : 'Année inconnue';

  const formattedRoi = isPopulated
    ? new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(roi)
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
      className="widget-card least-profitable-movie-widget"
      aria-label="Widget Film le moins rentable"
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
          <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
          <polyline points="17 18 23 18 23 12" />
        </svg>
        <h3 className="widget-title">Film le moins rentable</h3>
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
        ) : !isPopulated || formattedRoi === null ? (
          <div className="widget-empty">
            <span className="widget-value widget-value-empty">&mdash;</span>
            <span className="widget-unit">Aucun film éligible</span>
          </div>
        ) : (
          <div className="least-profitable-content">
            <div className="least-profitable-poster-wrapper">
              {posterSrc ? (
                <img
                  src={posterSrc}
                  alt={`Affiche de ${title}`}
                  className="least-profitable-poster"
                  loading="lazy"
                />
              ) : (
                <div
                  className="least-profitable-poster-placeholder"
                  role="img"
                  aria-label="Affiche non disponible"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden="true"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="4" />
                    <circle cx="8.5" cy="8.5" r="2" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span>Sans affiche</span>
                </div>
              )}
            </div>

            <div className="least-profitable-info">
              <h4
                className="least-profitable-movie-title"
                data-testid="least-profitable-title"
                title={title}
              >
                {title}
              </h4>
              <p
                className="least-profitable-movie-year"
                data-testid="least-profitable-year"
              >
                {formattedYear}
              </p>
              <div className="least-profitable-roi-wrapper">
                <span
                  className="widget-value least-profitable-roi-value"
                  data-testid="least-profitable-value"
                >
                  {formattedRoi} %
                </span>
                <span className="widget-unit least-profitable-roi-badge">
                  ROI
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
