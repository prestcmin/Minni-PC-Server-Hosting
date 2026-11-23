import { useEffect, useState } from "react";

import ServerStatusBadge from "./ServerStatusBadge";
import { getServerEvents, getServerMetrics, getServerPlayers, getServerWorld, } from "../services/api";

function formatUptime(seconds) {
  if (seconds === null || seconds === undefined) {
    return "—";
  }

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

function ServerDetails({ server, onBack, activeActions = {}, onAction = () => {}, onRemove = () => {}, }) {
  function isActive(action) {
    return activeActions[
      `${server.server_name}-${action}`
    ];
  }
  const [metrics, setMetrics] = useState(null);
  const [players, setPlayers] = useState([]);
  const [events, setEvents] = useState([]);
  const [world, setWorld] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadDetails() {
      setLoading(true);
      setError("");

      try {
        const [
          metricsResult,
          playersResult,
          eventsResult,
          worldResult,
        ] = await Promise.all([
          getServerMetrics(server),
          getServerPlayers(server),
          getServerEvents(server),
          getServerWorld(server),
        ]);

        if (cancelled) {
          return;
        }

        setMetrics(metricsResult);
        setPlayers(playersResult.players || []);
        setEvents(eventsResult.events || []);
        setWorld(worldResult.world || null);
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDetails();

    const refreshInterval = window.setInterval(
      loadDetails,
      30_000
    );

    return () => {
      cancelled = true;
      window.clearInterval(refreshInterval);
    };

  }, [server, refreshKey]);

  if (loading) {
    return (
      <section className="dashboard-panel">
        <p className="loading-message">
          Loading server details...
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="dashboard-panel">
        <button
          className="secondary-button"
          onClick={onBack}
        >
          Back to servers
        </button>

        <p className="error-message">{error}</p>
      </section>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <p className="eyebrow">SERVER DETAILS</p>
          <h2>{server.server_name}</h2>
          <p className="page-description">
            {server.game} · Port {server.port_number}
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={onBack}
        >
          Back to servers
        </button>
        <div className="server-actions">

          <button
            className="secondary-button"
            disabled={loading}
            onClick={() => setRefreshKey((current) => current + 1)}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>          

          <button
            className="secondary-button"
            disabled={isActive("start")}
            onClick={() => onAction("start", server)}
          >
            {isActive("start") ? "Starting..." : "Start"}
          </button>

          <button
            className="secondary-button"
            disabled={isActive("stop")}
            onClick={() => onAction("stop", server)}
          >
            {isActive("stop") ? "Stopping..." : "Stop"}
          </button>

          <button
            className="secondary-button"
            disabled={isActive("restart")}
            onClick={() => onAction("restart", server)}
          >
            {isActive("restart")
              ? "Restarting..."
              : "Restart"}
          </button>

          <button
            className="secondary-button"
            disabled={isActive("remove")}
            onClick={() => onRemove(server)}
          >
            {isActive("remove") ? "Removing..." : "Remove"}
          </button>
        </div>
      </div>

      <section className="dashboard-panel">
        <div className="panel-header">
          <div>
            <h3>Server status</h3>
            <p>Current container and resource information.</p>
          </div>

          <ServerStatusBadge
            status={metrics?.status || server.status}
          />
        </div>

        <div className="metric-grid">
          <article className="metric-card">
            <span>CPU usage</span>
            <strong>
              {metrics?.cpu_percent?.toFixed(1) ?? "—"}%
            </strong>
          </article>

          <article className="metric-card">
            <span>Memory usage</span>
            <strong>
              {metrics?.memory_percent?.toFixed(1) ?? "—"}%
            </strong>
          </article>

          <article className="metric-card">
            <span>Uptime</span>
            <strong>
              {formatUptime(metrics?.uptime_seconds)}
            </strong>
          </article>
        </div>
      </section>

      <section className="dashboard-panel">
        <div className="panel-header">
          <div>
            <h3>Players</h3>
            <p>Players associated with this server.</p>
          </div>

          <span>{players.length} total</span>
        </div>

        {players.length === 0 ? (
          <div className="empty-state">
            <h3>No players recorded</h3>
            <p>
              Player information will appear after players join.
            </p>
          </div>
        ) : (
          <div className="player-list">
            {players.map((player) => (
              <article
                className="server-row"
                key={player.id}
              >
                <div>
                  <h4 className="server-name">
                    {player.display_name}
                  </h4>

                  <p className="server-details">
                    {player.player_uuid}
                  </p>
                </div>

                <span>
                  {player.is_active ? "Active" : "Inactive"}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>
      <section className="dashboard-panel">
        <div className="panel-header">
          <div>
            <h3>Recent activity</h3>
            <p>Recent actions performed on this server.</p>
          </div>

          <span>{events.length} events</span>
        </div>

        {events.length === 0 ? (
          <div className="empty-state">
            <h3>No recent activity</h3>
            <p>
              Server actions will appear here.
            </p>
          </div>
        ) : (
          <div className="event-list">
            {events.slice(0, 10).map((event) => (
              <article
                className="event-row"
                key={event.id}
              >
                <div>
                  <h4>{event.event_type}</h4>
                  <p>{event.message}</p>
                </div>

                <span
                  className={
                    event.status === "failed"
                      ? "event-status event-status-error"
                      : "event-status"
                  }
                >
                  {event.status}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>
      <section className="dashboard-panel">
        <div className="panel-header">
          <div>
            <h3>World information</h3>
            <p>Configuration for the active world.</p>
          </div>
        </div>

        {!world ? (
          <div className="empty-state">
            <h3>No world information</h3>
            <p>No active world is recorded for this server.</p>
          </div>
        ) : (
          <div className="world-details">
            <div>
              <span>World name</span>
              <strong>{world.world_name}</strong>
            </div>

            {world.world_size !== null && (
              <div>
                <span>World size</span>
                <strong>{world.world_size}</strong>
              </div>
            )}

            {world.difficulty && (
              <div>
                <span>Difficulty</span>
                <strong>{world.difficulty}</strong>
              </div>
            )}

            {world.valheim_modifier && (
              <div>
                <span>Valheim modifier</span>
                <strong>{world.valheim_modifier}</strong>
              </div>
            )}
          </div>
        )}
      </section>
    </>
  );
}

export default ServerDetails;
