function ServerList({
  servers = [],
  loading,
  error,
  onRefresh,
  onStart,
  onStop,
  onRestart,
  onRemove,
}) {
  if (loading) {
    return (
      <p className="loading">
        Loading servers...
      </p>
    );
  }

  if (error) {
    return (
      <div>
        <p className="error-message">
          {error}
        </p>

        <button
          className="secondary-button"
          onClick={onRefresh}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (servers.length === 0) {
    return (
      <div className="empty-state">
        <h3>No servers deployed</h3>
        <p>Create a server to begin managing your hosting environment.</p>
      </div>
    );
  }

  return (
    <div className="server-list">
      {servers.map((server) => (
        <article
          className="server-row"
          key={server.server_name}
        >
          <div>
            <h4 className="server-name">
              {server.server_name}
            </h4>

            <p className="server-details">
              {server.game} · Port {server.port_number}
            </p>

            <span className="server-status">
              {server.status || "unknown"}
            </span>
          </div>

          <div className="server-actions">
            <button
              className="secondary-button"
              onClick={() => onStart(server)}
            >
              Start
            </button>

            <button
              className="secondary-button"
              onClick={() => onStop(server)}
            >
              Stop
            </button>

            <button
              className="secondary-button"
              onClick={() => onRestart(server)}
            >
              Restart
            </button>

            <button
              className="secondary-button"
              onClick={() => onRemove(server)}
            >
              Remove
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

export default ServerList;
