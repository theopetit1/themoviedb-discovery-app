import './AverageRuntimeWidget.css';

export interface AverageRuntimeWidgetProps {
  /**
   * Average runtime in minutes. Must be strictly positive; undefined or null indicates absent data.
   */
  runtimeMinutes?: number | null;
  /**
   * Indicates whether the widget data is currently loading.
   */
  loading?: boolean;
  /**
   * Optional error message describing a failure to load the runtime metric.
   */
  error?: string | null;
}

export default function AverageRuntimeWidget({
  runtimeMinutes,
  loading = false,
  error = null,
}: AverageRuntimeWidgetProps) {
  const hasValidData =
    runtimeMinutes !== null &&
    runtimeMinutes !== undefined &&
    runtimeMinutes > 0;

  return (
    <article
      className="widget-card average-runtime-widget"
      aria-label="Widget Durée moyenne"
    >
      <header className="widget-header">
        <span className="widget-icon" aria-hidden="true">
          ⏱️
        </span>
        <h3 className="widget-title">Durée moyenne</h3>
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
        ) : !hasValidData ? (
          <div className="widget-empty">
            <span className="widget-value widget-value-empty">&mdash;</span>
            <span className="widget-unit">Aucune donnée</span>
          </div>
        ) : (
          <div className="widget-metric">
            <div className="widget-metric-value-line">
              <span
                className="widget-value"
                data-testid="average-runtime-value"
              >
                {Math.round(runtimeMinutes)}
              </span>
              <span className="widget-unit-badge">min</span>
            </div>
            <span className="widget-unit">par film</span>
          </div>
        )}
      </div>
    </article>
  );
}
