import './MoviesCountWidget.css';

export interface MoviesCountWidgetProps {
  count?: number | null;
  loading?: boolean;
  error?: string | null;
}

export default function MoviesCountWidget({
  count,
  loading = false,
  error = null,
}: MoviesCountWidgetProps) {
  return (
    <article
      className="widget-card movies-count-widget"
      aria-label="Widget Films en base"
    >
      <header className="widget-header">
        <span className="widget-icon" aria-hidden="true">
          🎬
        </span>
        <h3 className="widget-title">Films en base</h3>
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
        ) : count === null || count === undefined ? (
          <div className="widget-empty">
            <span className="widget-value widget-value-empty">&mdash;</span>
            <span className="widget-unit">Aucune donnée</span>
          </div>
        ) : (
          <div className="widget-metric">
            <span className="widget-value" data-testid="movies-count-value">
              {new Intl.NumberFormat('fr-FR').format(count)}
            </span>
            <span className="widget-unit">
              {count > 1 ? 'films enregistrés' : 'film enregistré'}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}
