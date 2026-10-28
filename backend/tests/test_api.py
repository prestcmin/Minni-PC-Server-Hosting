from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.routes import servers


client = TestClient(app)


def fake_successful_ansible(*args, **kwargs):
    class FakeResult:
        success = True
        return_code = 0
        stdout = ""
        stderr = ""

    return FakeResult()


def fake_failed_ansible(*args, **kwargs):
    class FakeResult:
        success = False
        return_code = 2
        stdout = ""
        stderr = "Ansible failed"

    return FakeResult()


def test_health_endpoint():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_invalid_game_is_rejected():
    response = client.post(
        "/servers/terraria-01/deploy",
        json={
            "game": "invalid-game",
            "action": "deploy",
            "server_name": "terraria-01",
            "port_number": 7777,
        },
    )

    assert response.status_code == 422


def test_invalid_server_name_is_rejected():
    response = client.post(
        "/servers/terraria-01/deploy",
        json={
            "game": "terraria",
            "action": "deploy",
            "server_name": "invalid server name",
            "port_number": 7777,
        },
    )

    assert response.status_code == 422


def test_deploy_endpoint(monkeypatch):
    monkeypatch.setattr(
        servers,
        "run_ansible",
        fake_successful_ansible,
    )

    response = client.post(
        "/servers/terraria-01/deploy",
        json={
            "game": "terraria",
            "action": "deploy",
            "server_name": "terraria-01",
            "port_number": 7777,
        },
    )

    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["action"] == "deploy"


def test_failed_ansible_operation(monkeypatch):
    monkeypatch.setattr(
        servers,
        "run_ansible",
        fake_failed_ansible,
    )

    response = client.post(
        "/servers/terraria-01/deploy",
        json={
            "game": "terraria",
            "action": "deploy",
            "server_name": "terraria-01",
            "port_number": 7777,
        },
    )

    assert response.status_code == 500
