const STATUS_LABELS = {
  deploying: "Deploying",
  running: "Running",
  stopped: "Stopped",
  failed: "Failed",
  unknown: "Unknown",
};

function ServerStatusBadge({ status }) {
  const normalizedStatus = status || "unknown";

  return (
    <span className={`server-status status-${normalizedStatus}`}>
      {STATUS_LABELS[normalizedStatus] || "Unknown"}
    </span>
  );
}

export default ServerStatusBadge;
