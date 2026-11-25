import './GenresCountWidget.css';

/**
 * Règle métier :
 * Un genre représenté est un genre associé à au moins un film présent dans le jeu de données.
 * Cette mesure reflète uniquement l'échantillon des films collectés et ne présume pas
 * qu'il s'agit de la totalité des genres configurés dans TMDB.
 *
 * Distinction stricte :
 * - `0` : Aucun genre n'est associé aux films du catalogue (valeur connue et nulle).
 * - `null` / `undefined` : Donnée non encore disponible ou non renseignée (tiret d'absence).
 */

export interface GenresCountWidgetProps {
  /**
   * Nombre de genres représentés dans le jeu de données.
   */
  count?: number | null;
  /**
   * Indique si les données sont en cours de chargement.
   */
  loading?: boolean;
  /**
   * Message d'erreur éventuel.
   */
  error?: string | null;
}

export default function GenresCountWidget({
  count,
  loading = false,
  error = null,
}: GenresCountWidgetProps) {
  const isCountValid = typeof count === 'number' && !Number.isNaN(count);

  const formattedCount = isCountValid
    ? new Intl.NumberFormat('fr-FR').format(count)
    : null;

  const unitLabel = isCountValid ? (count === 1 ? 'genre' : 'genres') : null;

  return (
    <article
      className="widget-card genres-count-widget"
      aria-label="Widget Genres représentés"
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
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
        <h3 className="widget-title">Genres représentés</h3>
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
        ) : !isCountValid || formattedCount === null ? (
          <div className="widget-empty">
            <span className="widget-value widget-value-empty">&mdash;</span>
            <span className="widget-unit">Aucune donnée</span>
          </div>
        ) : (
          <div className="widget-metric">
            <span className="widget-value" data-testid="genres-count-value">
              {formattedCount}
            </span>
            <span className="widget-unit" data-testid="genres-count-unit">
              {unitLabel}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}
