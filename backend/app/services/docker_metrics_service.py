import json
import re
import subprocess
import os
from datetime import datetime, timezone


def _run_docker(command: list[str]) -> str:
    result = subprocess.run(
        command,
        capture_output=True,
        text=True,
        check=False,
    )

    if result.returncode != 0:
        raise RuntimeError(
            result.stderr.strip() or "Docker command failed."
        )

    return result.stdout.strip()


def _parse_percentage(value: str) -> float | None:
    if not value:
        return None

    match = re.search(r"[\d.]+", value)

    if match is None:
        return None

    return float(match.group())


def _parse_bytes(value: str) -> int | None:
    if not value:
        return None

    match = re.match(
        r"^\s*([\d.]+)\s*([KMGTPE]?i?B)?\s*$",
        value,
        re.IGNORECASE,
    )

    if match is None:
        return None

    number = float(match.group(1))
    unit = (match.group(2) or "B").lower()

    multipliers = {
        "b": 1,
        "kb": 1000,
        "kib": 1024,
        "mb": 1000**2,
        "mib": 1024**2,
        "gb": 1000**3,
        "gib": 1024**3,
        "tb": 1000**4,
        "tib": 1024**4,
    }

    multiplier = multipliers.get(unit)

    if multiplier is None:
        return None

    return int(number * multiplier)


def _parse_memory_usage(value: str) -> tuple[int | None, int | None]:
    parts = value.split("/")

    if len(parts) != 2:
        return None, None

    return (
        _parse_bytes(parts[0]),
        _parse_bytes(parts[1]),
    )


def _parse_network_usage(
    value: str,
) -> tuple[int | None, int | None]:
    parts = value.split("/")

    if len(parts) != 2:
        return None, None

    return (
        _parse_bytes(parts[0]),
        _parse_bytes(parts[1]),
    )


def _calculate_uptime(started_at: str) -> int | None:
    if not started_at or started_at.startswith("0001-01-01"):
        return None

    try:
        started = datetime.fromisoformat(
            started_at.replace("Z", "+00:00")
        )
    except ValueError:
        return None

    if started.tzinfo is None:
        started = started.replace(tzinfo=timezone.utc)

    uptime = datetime.now(timezone.utc) - started
    return max(0, int(uptime.total_seconds()))


def collect_container_metrics(
    container_name: str,
) -> dict:
    try:
        state_output = _run_docker(
            [
                "docker",
                "inspect",
                container_name,
                "--format",
                "{{json .State}}",
            ]
        )
    except RuntimeError:
        return {
            "status": "missing",
            "uptime_seconds": None,
            "cpu_percent": None,
            "memory_usage_bytes": None,
            "memory_limit_bytes": None,
            "memory_percent": None,
            "network_rx_bytes": None,
            "network_tx_bytes": None,
        }

    state = json.loads(state_output)
    status = state.get("Status", "unknown")

    uptime_seconds = None

    if status == "running":
        uptime_seconds = _calculate_uptime(
            state.get("StartedAt", "")
        )

    metrics = {
        "status": status,
        "uptime_seconds": uptime_seconds,
        "cpu_percent": None,
        "memory_usage_bytes": None,
        "memory_limit_bytes": None,
        "memory_percent": None,
        "network_rx_bytes": None,
        "network_tx_bytes": None,
    }

    if status != "running":
        return metrics

    stats_output = _run_docker(
        [
            "docker",
            "stats",
            "--no-stream",
            "--format",
            "{{json .}}",
            container_name,
        ]
    )

    stats = json.loads(stats_output)

    memory_usage, memory_limit = _parse_memory_usage(
        stats.get("MemUsage", "")
    )
    network_rx, network_tx = _parse_network_usage(
        stats.get("NetIO", "")
    )

    raw_cpu_percent = _parse_percentage(
        stats.get("CPUPerc", "")
    )

    host_cpu_count = os.cpu_count() or 1

    normalized_cpu_percent = (
        raw_cpu_percent / host_cpu_count
        if raw_cpu_percent is not None
        else None
    )

    metrics.update(
        {
            "cpu_percent": normalized_cpu_percent,
            "memory_usage_bytes": memory_usage,
            "memory_limit_bytes": memory_limit,
            "memory_percent": _parse_percentage(
                stats.get("MemPerc", "")
            ),
            "network_rx_bytes": network_rx,
            "network_tx_bytes": network_tx,
        }
    )
    metrics.update(
        {
            "cpu_percent": normalized_cpu_percent,
            "memory_usage_bytes": memory_usage,
            "memory_limit_bytes": memory_limit,
            "memory_percent": _parse_percentage(
                stats.get("MemPerc", "")
            ),
            "network_rx_bytes": network_rx,
            "network_tx_bytes": network_tx,
        }
    )

    return metrics
