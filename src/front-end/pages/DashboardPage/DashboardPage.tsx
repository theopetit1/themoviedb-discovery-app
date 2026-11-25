import './DashboardPage.css';

export default function DashboardPage() {
  return (
    <main
      className="app-shell dashboard-page"
      aria-label="Tableau de bord des films"
    >
      <header className="dashboard-hero">
        <p className="dashboard-eyebrow">TMDB Discovery</p>
        <h1>Tableau de bord des films</h1>
        <p className="dashboard-intro">
          Explorez les indicateurs clés, la répartition par genre et les pays de
          production du catalogue.
        </p>
      </header>

      <section
        className="dashboard-content"
        aria-labelledby="dashboard-overview-title"
      >
        <div className="dashboard-empty-state">
          <div className="dashboard-empty-icon" aria-hidden="true">
            📊
          </div>
          <h2 id="dashboard-overview-title">Tableau de bord en préparation</h2>
          <p>
            Aucun widget n'est encore configuré sur ce tableau de bord. Les
            indicateurs clés (films en base, durée moyenne, note moyenne, pays
            le plus représenté) seront bientôt disponibles.
          </p>
          <div className="dashboard-info-box">
            <p>
              <strong>Période d'analyse :</strong> 2015 &ndash; 2024
            </p>
            <p>
              <strong>Source des données :</strong> The Movie Database (TMDB)
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
