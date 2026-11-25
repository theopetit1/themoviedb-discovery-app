import './AverageRatingWidget.css';

export interface AverageRatingWidgetProps {
  /**
   * Average simple rating out of 10. Must be strictly positive; undefined or null indicates absent rating.
   */
  averageRating?: number | null;
  /**
   * Indicates whether the widget data is currently loading.
   */
  loading?: boolean;
  /**
   * Optional error message describing a failure to load the rating metric.
   */
  error?: string | null;
}

export default function AverageRatingWidget({
  averageRating,
  loading = false,
  error = null,
}: AverageRatingWidgetProps) {
  const hasValidData =
    averageRating !== null && averageRating !== undefined && averageRating > 0;

  const formattedRating = hasValidData
    ? new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(averageRating)
    : null;

  return (
    <article
      className="widget-card average-rating-widget"
      aria-label="Widget Note moyenne"
    >
      <header className="widget-header">
        <span className="widget-icon" aria-hidden="true">
          ⭐
        </span>
        <h3 className="widget-title">Note moyenne</h3>
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
        ) : !hasValidData || formattedRating === null ? (
          <div className="widget-empty">
            <span className="widget-value widget-value-empty">&mdash;</span>
            <span className="widget-unit">Aucune note</span>
          </div>
        ) : (
          <div className="widget-metric">
            <div className="widget-metric-value-line">
              <span className="widget-value" data-testid="average-rating-value">
                {formattedRating}
              </span>
              <span className="widget-scale">/ 10</span>
            </div>
            <span className="widget-unit">moyenne simple</span>
          </div>
        )}
      </div>
    </article>
  );
}
