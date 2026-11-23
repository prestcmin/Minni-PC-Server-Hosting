# Dashboard API Contract

This document defines the data used by the server dashboard.

The frontend must work when accessed through either:

- The host computer's LAN address
- The host computer's Tailscale address

The frontend should derive the backend address from the current browser hostname unless an environment variable overrides it.

## Server summary

### Endpoint

```http
GET /servers

Current response
[
  {
    "id": 2,
    "server_name": "terraria-world-test",
    "game": "terraria",
    "port_number": 7780,
    "container_name": "terraria-world-test",
    "compose_project": "terraria-world-test",
    "status": "running",
    "last_error": null
  }
]

Server status values
Status	Meaning
running	The Docker container is running
stopped	The container exists but is not running
missing	The database record exists, but Docker cannot find the container
failed	The most recent Ansible action failed
deploying	A deployment is currently in progress
unknown	Docker returned an unrecognized state


Server metrics
Planned endpoint
GET /servers/{server_id}/metrics

Planned response
{
  "server_id": 2,
  "server_name": "terraria-world-test",
  "container_name": "terraria-world-test",
  "status": "running",
  "uptime_seconds": 3600,
  "cpu_percent": 12.5,
  "memory_usage_bytes": 268435456,
  "memory_limit_bytes": 2147483648,
  "memory_percent": 12.5,
  "network_rx_bytes": 1048576,
  "network_tx_bytes": 524288,
  "collected_at": "2026-11-09T17:00:00Z"
}

Metric definitions
Field	Description
uptime_seconds	Number of seconds the container has been running
cpu_percent	Current Docker CPU usage
memory_usage_bytes	Current memory usage
memory_limit_bytes	Container memory limit
memory_percent	Memory usage as a percentage
network_rx_bytes	Bytes received by the container
network_tx_bytes	Bytes sent by the container
collected_at	Time the metrics were collected

If the container is missing or stopped, metrics may be returned as null.

Player list
Planned endpoint
GET /servers/{server_id}/players

Planned response
{
  "server_id": 2,
  "server_name": "terraria-world-test",
  "players": [
    {
      "id": 1,
      "player_uuid": "test-player-001",
      "display_name": "TestPlayer",
      "first_joined_at": "2026-11-09T16:45:14Z",
      "last_seen_at": "2026-11-09T16:45:40Z",
      "total_playtime_seconds": 3600,
      "join_count": 2,
      "is_active": true
    }
  ],
  "player_count": 1
}

When no players are associated with a server:
{
  "server_id": 2,
  "server_name": "terraria-world-test",
  "players": [],
  "player_count": 0
}

World information
Planned response section
{
  "world": {
    "world_name": "expert-world",
    "world_size": 2,
    "difficulty": "expert",
    "valheim_modifier": null,
    "is_active": true
  }
}

World fields vary by game:
Game	Relevant fields
Minecraft	world_name, difficulty
Terraria	world_name, world_size, difficulty
Valheim	world_name, valheim_modifier


Unused fields should be returned as null, not omitted.

Event history
Planned endpoint
GET /servers/{server_id}/events

Planned response
{
  "server_id": 2,
  "events": [
    {
      "id": 10,
      "event_type": "restart",
      "status": "succeeded",
      "message": "restart action completed successfully.",
      "return_code": 0,
      "created_at": "2026-11-09T16:45:40Z"
    }
  ]
}

Error response format
Backend errors should use this structure when possible:
{
  "detail": {
    "message": "Server metrics could not be collected.",
    "code": "METRICS_UNAVAILABLE"
  }
}

