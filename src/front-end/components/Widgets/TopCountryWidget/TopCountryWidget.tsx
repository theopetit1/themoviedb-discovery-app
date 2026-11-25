import './TopCountryWidget.css';

export interface TopCountryWidgetProps {
  /**
   * Name of the most represented country (e.g. "United States of America").
   */
  countryName?: string | null;
  /**
   * Number of movies associated with this country.
   */
  movieCount?: number | null;
  /**
   * Indicates whether the widget data is currently loading.
   */
  loading?: boolean;
  /**
   * Optional error message if fetching data failed.
   */
  error?: string | null;
}

export default function TopCountryWidget({
  countryName,
  movieCount,
  loading = false,
  error = null,
}: TopCountryWidgetProps) {
  const isPopulated =
    typeof countryName === 'string' &&
    countryName.trim().length > 0 &&
    typeof movieCount === 'number' &&
    movieCount > 0;

  return (
    <article
      className="widget-card top-country-widget"
      aria-label="Widget Pays le plus représenté"
    >
      <header className="widget-header">
        <span className="widget-icon" aria-hidden="true">
          🌍
        </span>
        <h3 className="widget-title">Pays le plus représenté</h3>
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
        ) : !isPopulated ? (
          <div className="widget-empty">
            <span className="widget-value widget-value-empty">&mdash;</span>
            <span className="widget-unit">Aucun pays connu</span>
          </div>
        ) : (
          <div className="widget-metric top-country-metric">
            <span
              className="top-country-name"
              data-testid="top-country-name"
              title={countryName}
            >
              {countryName}
            </span>
            <div className="top-country-count-line">
              <span
                className="widget-value top-country-count"
                data-testid="top-country-count"
              >
                {new Intl.NumberFormat('fr-FR').format(movieCount)}
              </span>
              <span className="widget-unit">
                {movieCount > 1 ? 'films' : 'film'}
              </span>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
