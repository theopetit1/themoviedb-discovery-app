import './BestWeightedRatedGenreWidget.css';

/**
 * Règle métier et formule de moyenne pondérée bayésienne validée (formule IMDB / Weighted Rating) :
 *
 * Formule mathématique :
 *   WR = (v / (v + m)) * R + (m / (v + m)) * C
 *
 * Paramètres validés :
 * - v : nombre cumulé de votes des films rattachés au genre considéré.
 * - m : seuil minimum de votes requis pour l'éligibilité du genre (évite qu'un genre confidentiel
 *       ne truste le classement avec un échantillon trop réduit).
 * - R : note moyenne arithmétique simple des films du genre.
 * - C : note moyenne globale calculée sur l'ensemble de tous les films du catalogue.
 *
 * Règles d'éligibilité et comportement du composant :
 * - Un genre n'ayant pas atteint le quorum de votes (v < m) ou n'ayant aucun vote est inéligible.
 * - Le composant présente fidèlement la valeur fournie sans recalculer ni biaiser les données.
 * - Les états sans résultat, en chargement et en erreur sont traités de façon explicite.
 */

export interface BestWeightedRatedGenreWidgetProps {
  /**
   * Nom du genre ayant la meilleure note pondérée (ex: "Animation").
   */
  genreName?: string | null;
  /**
   * Note pondérée sur 10 (ex: 7.68).
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

export default function BestWeightedRatedGenreWidget({
  genreName,
  rating,
  loading = false,
  error = null,
}: BestWeightedRatedGenreWidgetProps) {
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
      className="widget-card best-weighted-rated-genre-widget"
      aria-label="Widget Meilleure note pondérée par genre"
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
          <path d="M12 3v18" />
          <path d="m3 7 9-4 9 4" />
          <path d="M6 10l-3 6h6l-3-6" />
          <path d="M18 10l-3 6h6l-3-6" />
        </svg>
        <h3 className="widget-title">Meilleure note pondérée</h3>
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
            <span className="widget-unit">Aucune note pondérée</span>
          </div>
        ) : (
          <div className="widget-metric best-weighted-rated-genre-metric">
            <span
              className="best-weighted-rated-genre-name"
              data-testid="best-weighted-rated-genre-name"
              title={genreName}
            >
              {genreName}
            </span>
            <div className="best-weighted-rated-genre-score-wrapper">
              <span
                className="best-weighted-rated-genre-value"
                data-testid="best-weighted-rated-genre-value"
              >
                {formattedRating}
              </span>
              <span
                className="best-weighted-rated-genre-scale"
                data-testid="best-weighted-rated-genre-scale"
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
