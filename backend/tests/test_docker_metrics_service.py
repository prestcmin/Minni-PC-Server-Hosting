import json

from backend.app.services import docker_metrics_service


def test_collect_running_container_metrics(monkeypatch):
    def fake_run_docker(command):
        if "inspect" in command:
            return json.dumps(
                {
                    "Status": "running",
                    "StartedAt": "2026-11-09T16:00:00Z",
                }
            )

        return json.dumps(
            {
                "CPUPerc": "12.5%",
                "MemUsage": "256MiB / 2GiB",
                "MemPerc": "12.5%",
                "NetIO": "1.5MB / 2MB",
            }
        )

    monkeypatch.setattr(
        docker_metrics_service.os,
        "cpu_count",
        lambda: 1,
    )

    monkeypatch.setattr(
        docker_metrics_service,
        "_run_docker",
        fake_run_docker,
    )

    metrics = (
        docker_metrics_service.collect_container_metrics(
            "test-container"
        )
    )

    assert metrics["status"] == "running"
    assert metrics["uptime_seconds"] is not None
    assert metrics["cpu_percent"] == 12.5
    assert metrics["memory_usage_bytes"] == 256 * 1024**2
    assert metrics["memory_limit_bytes"] == 2 * 1024**3
    assert metrics["memory_percent"] == 12.5
    assert metrics["network_rx_bytes"] == 1_500_000
    assert metrics["network_tx_bytes"] == 2_000_000


def test_collect_missing_container_metrics(monkeypatch):
    def fake_run_docker(command):
        raise RuntimeError("No such container")

    monkeypatch.setattr(
        docker_metrics_service,
        "_run_docker",
        fake_run_docker,
    )

    metrics = (
        docker_metrics_service.collect_container_metrics(
            "missing-container"
        )
    )

    assert metrics == {
        "status": "missing",
        "uptime_seconds": None,
        "cpu_percent": None,
        "memory_usage_bytes": None,
        "memory_limit_bytes": None,
        "memory_percent": None,
        "network_rx_bytes": None,
        "network_tx_bytes": None,
    }
