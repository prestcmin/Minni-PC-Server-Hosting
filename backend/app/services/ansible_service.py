import subprocess
from dataclasses import dataclass

from ..config import settings


@dataclass
class AnsibleResult:
    success: bool
    return_code: int
    stdout: str
    stderr: str


def run_ansible(
    action: str,
    game: str,
    server_name: str,
    port_number: int,
    world_name: str | None = None,
    world_size: int | None = None,
) -> AnsibleResult:
    command = [
        "ansible-playbook",
        "-i",
        str(settings.inventory_path),
        str(settings.playbook_path),
        "-e",
        f"server_action={action}",
        "-e",
        f"selected_game={game}",
        "-e",
        f"server_name={server_name}",
        "-e",
        f"port_number={port_number}",
    ]

    if world_name is not None:
        command.extend(
            [
                "-e",
                f"world_name={world_name}",
            ]
        )

    if world_size is not None:
        command.extend(
            [
                "-e",
                f"world_size={world_size}",
            ]
        )

    try:
        result = subprocess.run(
            command,
            cwd=settings.ansible_project_dir,
            capture_output=True,
            text=True,
            timeout=settings.ansible_timeout_seconds,
            check=False,
            shell=False,
        )

    except subprocess.TimeoutExpired as error:
        return AnsibleResult(
            success=False,
            return_code=124,
            stdout=error.stdout or "",
            stderr=(
                "Ansible operation exceeded the configured timeout."
            ),
        )

    except OSError as error:
        return AnsibleResult(
            success=False,
            return_code=1,
            stdout="",
            stderr=(
                f"Unable to start Ansible: {error}"
            ),
        )

    return AnsibleResult(
        success=result.returncode == 0,
        return_code=result.returncode,
        stdout=result.stdout,
        stderr=result.stderr,
    )
