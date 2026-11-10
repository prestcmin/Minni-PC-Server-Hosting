import json
import subprocess

from sqlalchemy.orm import Session

from ..models.database import Server


def get_container_state(container_name: str) -> str:
    result = subprocess.run(
        [
            "docker",
            "inspect",
            container_name,
            "--format",
            "{{json .State}}",
        ],
        capture_output=True,
        text=True,
        check=False,
    )

    if result.returncode != 0:
        return "missing"

    try:
        state = json.loads(result.stdout)
    except json.JSONDecodeError:
        return "unknown"

    return state.get("Status", "unknown")


def reconcile_servers(database: Session) -> int:
    changed_count = 0

    servers = database.query(Server).all()

    for server in servers:
        docker_state = get_container_state(server.container_name)

        if docker_state == "running":
            new_status = "running"
            new_error = None
        elif docker_state == "missing":
            new_status = "missing"
            new_error = "Docker container was not found."
        elif docker_state in {"created", "restarting"}:
            new_status = docker_state
            new_error = None
        elif docker_state in {"exited", "dead"}:
            new_status = "stopped"
            new_error = None
        else:
            new_status = "unknown"
            new_error = f"Unknown Docker state: {docker_state}"

        if server.status != new_status or server.last_error != new_error:
            server.status = new_status
            server.last_error = new_error
            changed_count += 1

    database.commit()
    return changed_count
