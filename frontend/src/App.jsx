import { useEffect, useState } from "react";

import "./App.css";

import CreateServerForm from "./components/CreateServerForm";
import ServerList from "./components/ServerList";
import ServerDetails from "./components/ServerDetails";

import { getServerMetrics, listServers, removeServer, restartServer, startServer, stopServer, } from "./services/api";


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


function Dashboard({ servers, metricsByServer = {}, metricsLoading = false, onNavigate }) {
  const runningServers = servers.filter(
    (server) => server.status === "running",
  );
  
  const monitoredServer =
  runningServers[0] || servers[0] || null;

  const monitoredMetrics = monitoredServer
    ? metricsByServer[monitoredServer.server_name]
    : null;

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
            <p>{monitoredServer
                 ? `Monitoring ${monitoredServer.server_name}.`
                 : "Deploy a server to view live resource usage."}
            </p>
          </div>

          <span>Last 24 hours</span>
        </div>

        {metricsLoading ? (
	  <p className="loading-message">
   	    Loading live metrics...
  	  </p>
	) : monitoredMetrics ? (
	  <div className="metric-grid">
	    <article className="metric-card">
	      <span>CPU usage : </span>
	      <strong>
	        {monitoredMetrics.cpu_percent?.toFixed(1) ?? "—"}%
	      </strong>
	    </article>

	    <article className="metric-card">
	      <span>Memory usage : </span>
	      <strong>
	        {monitoredMetrics.memory_percent?.toFixed(1) ?? "—"}%
	      </strong>
	    </article>

	    <article className="metric-card">
	      <span>Uptime : </span>
	      <strong>
        	{monitoredMetrics.uptime_seconds ?? "—"}s
      	      </strong>
    	    </article>
 	 </div>
	) : (
	  <p className="empty-state">
	    Metrics are unavailable for this server.
	  </p>
	)}
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
  const [activeActions, setActiveActions] = useState({});
  const [metricsByServer, setMetricsByServer] = useState({});
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [selectedServer, setSelectedServer] = useState(null);

  async function loadMetrics(serverList) {
    if (serverList.length === 0) {
      setMetricsByServer({});
      return;
    }

    setMetricsLoading(true);

    const metricEntries = await Promise.all(
      serverList.map(async (server) => {
        try {
          const metrics = await getServerMetrics(server);

          return [server.server_name, metrics];
        } catch {
          return [server.server_name, null];
        }
      })
    );

    setMetricsByServer(
      Object.fromEntries(metricEntries)
    );

    setMetricsLoading(false);
  }

  async function refreshServers() {
    setError("");
    setLoading(true);

    try {
      const result = await listServers();
      setServers(result);
      await loadMetrics(result);
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

  async function handleAction(action, server) {
    const actionKey = `${server.server_name}-${action}`;

    setActiveActions((current) => ({
      ...current,
      [actionKey]: true,
    }));

    try {
      if (action === "start") {
        await startServer(server);
      }

      if (action === "stop") {
        await stopServer(server);
      }

      if (action === "restart") {
        await restartServer(server);
      }

      if (action === "remove") {
        await removeServer(server);
      }

      await refreshServers();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setActiveActions((current) => ({
        ...current,
        [actionKey]: false,
      }));
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
              metricsByServer={metricsByServer}
              metricsLoading={metricsLoading}
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
		  activeActions={activeActions}
                  onOpen={(server) => {
                    setSelectedServer(server);
                    setCurrentView("details");
                  }}
		  onStart={(server) => handleAction("start", server)}
		  onStop={(server) => handleAction("stop", server)}
		  onRestart={(server) => handleAction("restart", server)}
		  onRemove={(server) => handleAction("remove", server)}
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
 		 onCreated={() => {
  		  refreshServers();
 		 }}
		/>
            </>
          )}

          {currentView === "details" && selectedServer && (
            <ServerDetails
              server={selectedServer}
              activeActions={activeActions}
              onAction={handleAction}
              onRemove={handleRemove}
              onBack={() => setCurrentView("servers")}
            />
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
