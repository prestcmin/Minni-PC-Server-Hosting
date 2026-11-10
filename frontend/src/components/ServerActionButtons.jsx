function ServerActionButtons({
  server,
  activeActions,
  onStart,
  onStop,
  onRestart,
  onRemove,
}) {
  const actionIsActive = (action) =>
    activeActions[`${server.server_name}-${action}`];

  return (
    <div className="server-actions">
      <button
        disabled={actionIsActive("start")}
        onClick={() => onStart(server)}
      >
        {actionIsActive("start") ? "Starting..." : "Start"}
      </button>

      <button
        disabled={actionIsActive("stop")}
        onClick={() => onStop(server)}
      >
        {actionIsActive("stop") ? "Stopping..." : "Stop"}
      </button>

      <button
        disabled={actionIsActive("restart")}
        onClick={() => onRestart(server)}
      >
        {actionIsActive("restart") ? "Restarting..." : "Restart"}
      </button>

      <button
        disabled={actionIsActive("remove")}
        onClick={() => onRemove(server)}
      >
        {actionIsActive("remove") ? "Removing..." : "Remove"}
      </button>
    </div>
  );
}

export default ServerActionButtons;
