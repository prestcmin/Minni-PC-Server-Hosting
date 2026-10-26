import { useEffect, useState } from "react";

import "./App.css";

import CreateServerForm from "./components/CreateServerForm";
import ServerList from "./components/ServerList";

import {
  listServers,
  removeServer,
  restartServer,
  startServer,
  stopServer,
} from "./services/api";


function Sidebar({ currentView, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="brand">HOST</div>

      <nav>
        <button
          className={currentView === "dashboard" ? "nav-item active" : "nav-item"}
          onClick={() => onNavigate("dashboard")}
        >
          Dashboard
        </button>

        <button
          className={currentView === "servers" ? "nav-item active" : "nav-item"}
          onClick={() => onNavigate("servers")}
        >
          Servers
        </button>

        <button
          className={currentView === "create" ? "nav-item active" : "nav-item"}
          onClick={() => onNavigate("create")}
        >
          Create Server
        </button>

        <button
          className={currentView === "settings" ? "nav-item active" : "nav-item"}
          onClick={() => onNavigate("settings")}
        >
          Settings
        </button>
      </nav>
    </aside>
  );
}


function Dashboard({ servers, onNavigate }) {
  const runningServers = servers.filter(
    (server) => server.status === "running",
  );

  return (
    <>
      <div className="page-header">
        <div>
          <p className="eyebrow">SERVER MANAGEMENT</p>
          <h2>Welcome back</h2>
          <p className="page-description">
            Manage your game servers from one place.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => onNavigate("create")}
        >
          + Create a new server
        </button>
      </div>

      <section className="summary-grid">
        <article className="summary-card">
          <span>Active servers</span>
          <strong>{runningServers.length}</strong>
        </article>

        <article className="summary-card">
          <span>Total servers</span>
          <strong>{servers.length}</strong>
        </article>

        <article className="summary-card">
          <span>Players online</span>
          <strong>—</strong>
        </article>
      </section>

      <section className="dashboard-panel">
        <div className="panel-header">
          <div>
            <h3>Resource usage</h3>
            <p>Resource metrics will be connected to the backend later.</p>
          </div>

          <span>Last 24 hours</span>
        </div>

        <div className="resource-chart" aria-label="Resource usage chart">
          <span style={{ height: "35%" }} />
          <span style={{ height: "48%" }} />
          <span style={{ height: "42%" }} />
          <span style={{ height: "66%" }} />
          <span style={{ height: "54%" }} />
          <span style={{ height: "78%" }} />
          <span style={{ height: "62%" }} />
          <span style={{ height: "88%" }} />
        </div>
      </section>

      <section className="dashboard-panel">
        <div className="panel-header">
          <div>
            <h3>Recent servers</h3>
            <p>Your most recently managed servers.</p>
          </div>

          <button
            className="text-button"
            onClick={() => onNavigate("servers")}
          >
            View all
          </button>
        </div>

        {servers.length === 0 ? (
          <div className="empty-state">
            <h3>No servers deployed</h3>
            <p>Create your first server to get started.</p>
          </div>
        ) : (
          servers.slice(0, 2).map((server) => (
            <div className="server-row" key={server.server_name}>
              <span className="server-status">
                {server.status || "unknown"}
              </span>

              <div>
                <h4>{server.server_name}</h4>
                <p>
                  {server.game} · Port {server.port_number}
                </p>
              </div>

              <button
                className="secondary-button"
                onClick={() => onNavigate("servers")}
              >
                Open
              </button>
            </div>
          ))
        )}
      </section>
    </>
  );
}


function App() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  async function refreshServers() {
    setError("");
    setLoading(true);

    try {
      const result = await listServers();
      setServers(result);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    refreshServers();
  }, []);


  async function performAction(server, actionFunction) {
    setError("");

    try {
      await actionFunction(server);
      await refreshServers();
    } catch (requestError) {
      setError(requestError.message);
    }
  }


  async function handleRemove(server) {
    const confirmed = window.confirm(
      `Remove ${server.server_name}?`,
    );

    if (!confirmed) {
      return;
    }

    await performAction(server, removeServer);
  }


  function handleCreated(server) {
    setServers((current) => [
      ...current,
      {
        ...server,
        status: "running",
      },
    ]);

    setCurrentView("servers");
  }


  return (
    <div className="app-shell">
      <header className="topbar">
        <h1>Minni-PC Server Hosting</h1>

        <span className="connection-status">
          LAN backend connected
        </span>
      </header>

      <div className="app-body">
        <Sidebar
          currentView={currentView}
          onNavigate={setCurrentView}
        />

        <main className="main-content">
          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

          {currentView === "dashboard" && (
            <Dashboard
              servers={servers}
              onNavigate={setCurrentView}
            />
          )}

          {currentView === "servers" && (
            <>
              <div className="page-header">
                <div>
                  <p className="eyebrow">SERVER MANAGEMENT</p>
                  <h2>Select a server</h2>
                  <p className="page-description">
                    Choose a server to manage.
                  </p>
                </div>

                <button
                  className="primary-button"
                  onClick={() => setCurrentView("create")}
                >
                  + New server
                </button>
              </div>

              <section className="dashboard-panel">
                <div className="panel-header">
                  <h3>Available servers</h3>

                  <button
                    className="text-button"
                    onClick={refreshServers}
                  >
                    Refresh
                  </button>
                </div>

                <ServerList
                  servers={servers}
                  loading={loading}
                  error={error}
                  onRefresh={refreshServers}
                  onStart={(server) =>
                    performAction(server, startServer)
                  }
                  onStop={(server) =>
                    performAction(server, stopServer)
                  }
                  onRestart={(server) =>
                    performAction(server, restartServer)
                  }
                  onRemove={handleRemove}
                />
              </section>
            </>
          )}

          {currentView === "create" && (
            <>
              <div className="page-header">
                <div>
                  <p className="eyebrow">SERVER SETUP</p>
                  <h2>Create a server</h2>
                  <p className="page-description">
                    Step 1 of 2
                  </p>
                </div>

                <button
                  className="secondary-button"
                  onClick={() => setCurrentView("dashboard")}
                >
                  Back
                </button>
              </div>

              <CreateServerForm
                onCreated={handleCreated}
              />
            </>
          )}

          {currentView === "settings" && (
            <>
              <div className="page-header">
                <div>
                  <p className="eyebrow">CONFIGURATION</p>
                  <h2>Settings</h2>
                  <p className="page-description">
                    Application settings will be added later.
                  </p>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}


export default App;
