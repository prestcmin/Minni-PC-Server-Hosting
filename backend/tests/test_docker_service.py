from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from backend.app.database import Base
from backend.app.models.database import Game, Server
from backend.app.services import docker_service


def create_test_server(database: Session) -> Server:
    game = Game(
        slug="test-game",
        display_name="Test Game",
        default_port=1234,
        docker_image="test/image",
        enabled=True,
    )
    database.add(game)
    database.flush()

    server = Server(
        server_name="test-server",
        game=game,
        port_number=1234,
        container_name="missing-container",
        compose_project="test-server",
        status="running",
    )
    database.add(server)
    database.commit()
    database.refresh(server)

    return server


def test_missing_container_is_detected(monkeypatch):
    class FakeResult:
        returncode = 1
        stdout = ""
        stderr = "No such container"

    monkeypatch.setattr(
        docker_service.subprocess,
        "run",
        lambda *args, **kwargs: FakeResult(),
    )

    assert (
        docker_service.get_container_state("missing-container")
        == "missing"
    )


def test_reconcile_marks_missing_container(monkeypatch):
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as database:
        server = create_test_server(database)

        monkeypatch.setattr(
            docker_service,
            "get_container_state",
            lambda container_name: "missing",
        )

        changed_count = docker_service.reconcile_servers(database)

        database.refresh(server)

        assert changed_count == 1
        assert server.status == "missing"
        assert server.last_error == "Docker container was not found."
