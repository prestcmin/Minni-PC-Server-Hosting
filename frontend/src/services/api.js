const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  `${window.location.protocol}//${window.location.hostname}:8001`;

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch {
    throw new ApiError(
      "The backend could not be reached. Check that it is running and accessible."
    );
  }

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new ApiError(
      data?.detail?.message ||
        data?.detail ||
        `The backend returned HTTP ${response.status}.`,
      response.status
    );
  }

  return data;
}

export function getHealth() {
  return request("/health");
}

export function listServers() {
  return request("/servers");
}

function serverActionPayload(server, action) {
  return {
    game: server.game,
    action,
    server_name: server.server_name,
    port_number: server.port_number,
    world_name: server.world_name,
    world_size: server.world_size,
    difficulty: server.difficulty,
    valheim_modifier: server.valheim_modifier,
  };
}

export function getServerMetrics(server) {
  return request(
    `/servers/${encodeURIComponent(server.server_name)}/metrics`
  );
}

export function getServerPlayers(server) {
  return request(
    `/servers/${encodeURIComponent(server.server_name)}/players`
  );
}

export function getServerEvents(server) {
  return request(
    `/servers/${encodeURIComponent(server.server_name)}/events`
  );
}

export function getServerWorld(server) {
  return request(
    `/servers/${encodeURIComponent(server.server_name)}/world`
  );
}

export function deployServer(server) {
  return request(
    `/servers/${server.server_name}/deploy`,
    {
      method: "POST",
      body: JSON.stringify({
        game: server.game,
        action: "deploy",
        server_name: server.server_name,
        port_number: server.port_number,
        world_name: server.world_name,
        world_size: server.world_size,
        difficulty: server.difficulty,
        valheim_modifier: server.valheim_modifier,
      }),
    },
  );
}

export function startServer(server) {
  return request(
    `/servers/${server.server_name}/start`,
    {
      method: "POST",
      body: JSON.stringify(
        serverActionPayload(server, "start")
      ),
    },
  );
}

export function stopServer(server) {
  return request(
    `/servers/${server.server_name}/stop`,
    {
      method: "POST",
      body: JSON.stringify(
        serverActionPayload(server, "stop")
      ),
    },
  );
}

export function restartServer(server) {
  return request(
    `/servers/${server.server_name}/restart`,
    {
      method: "POST",
      body: JSON.stringify(
        serverActionPayload(server, "restart")
      ),
    },
  );
}

export function removeServer(server) {
  return request(
    `/servers/${server.server_name}`,
    {
      method: "DELETE",
      body: JSON.stringify(server),
    },
  );
}
