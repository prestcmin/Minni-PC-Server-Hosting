# Database Schema

## Purpose

The database stores metadata about supported games, hosted servers, worlds, players, and server operations.

Actual world files, player save files, and Docker data remain in their Docker bind-mounted directories. SQLite stores references and metadata about those files.

## Tables

### games

Stores supported game types.

Fields:

- `id`
- `slug`
- `display_name`
- `default_port`
- `docker_image`
- `enabled`

Example records:

- Minecraft
- Terraria
- Valheim

### servers

Stores the identity and current state of each hosted server.

Fields:

- `id`
- `server_name`
- `game_id`
- `port_number`
- `container_name`
- `compose_project`
- `status`
- `last_error`
- `created_at`
- `updated_at`

Rules:

- `id` is the primary key.
- `server_name` must be unique.
- `game_id` references `games.id`.
- A server can have multiple worlds.
- A server can have multiple players.
- A server can have multiple events.

### worlds

Stores world configuration and file metadata.

Fields:

- `id`
- `server_id`
- `world_name`
- `world_path`
- `world_size`
- `difficulty`
- `valheim_modifier`
- `seed`
- `is_active`
- `created_at`

Rules:

- `server_id` references `servers.id`.
- A server may have multiple world records.
- Only one world should normally be active per server.
- The database stores the world path, not the world file contents.

### players

Stores global player identity.

Fields:

- `id`
- `player_uuid`
- `display_name`
- `first_seen_at`
- `last_seen_at`

Rules:

- `player_uuid` must be unique.
- A player can be associated with multiple servers.

### server_players

Associates players with servers.

Fields:

- `id`
- `server_id`
- `player_id`
- `first_joined_at`
- `last_seen_at`
- `total_playtime_seconds`
- `join_count`
- `is_active`

Rules:

- `server_id` references `servers.id`.
- `player_id` references `players.id`.
- The combination of `server_id` and `player_id` must be unique.

### server_events

Stores server lifecycle and system events.

Fields:

- `id`
- `server_id`
- `event_type`
- `status`
- `message`
- `return_code`
- `created_at`

Example event types:

- `deploy`
- `start`
- `stop`
- `restart`
- `remove`
- `status_check`

Example event statuses:

- `started`
- `completed`
- `failed`

## Relationships

```text
games 1 ─── many servers

servers 1 ─── many worlds

servers 1 ─── many server_events

servers many ─── many players
                through server_players
