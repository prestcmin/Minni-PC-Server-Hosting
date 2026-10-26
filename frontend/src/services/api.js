const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8001";


async function request(path, options = {}) {
  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    },
  );

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.detail?.message ||
      data?.detail ||
      "The backend request failed.";

    throw new Error(message);
  }

  return data;
}


export function getHealth() {
  return request("/health");
}

export function listServers() {
  return request("/servers");
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
      body: JSON.stringify(server),
    },
  );
}


export function stopServer(server) {
  return request(
    `/servers/${server.server_name}/stop`,
    {
      method: "POST",
      body: JSON.stringify(server),
    },
  );
}


export function restartServer(server) {
  return request(
    `/servers/${server.server_name}/restart`,
    {
      method: "POST",
      body: JSON.stringify(server),
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
