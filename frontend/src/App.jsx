import "./App.css";


function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <h1>Minni-PC Server Hosting</h1>
        <span className="connection-status">
          Backend connected
        </span>
      </header>

      <div className="app-body">
        <aside className="sidebar">
          <nav>
            <a href="#dashboard">Dashboard</a>
            <a href="#servers">Servers</a>
            <a href="#settings">Settings</a>
          </nav>
        </aside>

        <main className="main-content">
          <section className="page-header">
            <div>
              <p className="eyebrow">SERVER MANAGEMENT</p>
              <h2>Dashboard</h2>
              <p className="page-description">
                Manage your Docker-based game servers.
              </p>
            </div>

            <button className="primary-button">
              Create Server
            </button>
          </section>

          <section className="summary-grid">
            <article className="summary-card">
              <span>Total Servers</span>
              <strong>0</strong>
            </article>

            <article className="summary-card">
              <span>Running Servers</span>
              <strong>0</strong>
            </article>

            <article className="summary-card">
              <span>Stopped Servers</span>
              <strong>0</strong>
            </article>
          </section>

          <section className="servers-panel">
            <div className="panel-header">
              <div>
                <h3>Your Servers</h3>
                <p>
                  View and manage deployed game servers.
                </p>
              </div>
            </div>

            <div className="empty-state">
              <h3>No servers deployed</h3>
              <p>
                Create a server to begin managing your game hosting
                environment.
              </p>
              <button className="primary-button">
                Create Your First Server
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}


export default App;
