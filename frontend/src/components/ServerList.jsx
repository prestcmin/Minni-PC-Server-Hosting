import ServerStatusBadge from "./ServerStatusBadge";

function ServerList({
  servers = [],
  loading,
  error,
  onRefresh,
  onStart,
  onStop,
  onRestart,
  onRemove,
  activeActions = {},
}) {
  function isActive(action, server) {
    return activeActions[`${server.server_name}-${action}`];
  }

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

            <ServerStatusBadge status={server.status} />
          </div>

          <div className="server-actions">
	       <button
		  className="secondary-button"
		  disabled={isActive("start", server)}
		  onClick={() => onStart(server)}
		>
		  {isActive("start", server) ? "Starting..." : "Start"}
		</button>

		<button
		  className="secondary-button"
		  disabled={isActive("stop", server)}
		  onClick={() => onStop(server)}
		>
		  {isActive("stop", server) ? "Stopping..." : "Stop"}
		</button>

		<button
		  className="secondary-button"
		  disabled={isActive("restart", server)}
		  onClick={() => onRestart(server)}
		>
		  {isActive("restart", server) ? "Restarting..." : "Restart"}
		</button>

		<button
		  className="secondary-button"
		  disabled={isActive("remove", server)}
		  onClick={() => onRemove(server)}
		>
		  {isActive("remove", server) ? "Removing..." : "Remove"}
		</button>
          </div>
        </article>
      ))}
    </div>
  );
}

export default ServerList;
