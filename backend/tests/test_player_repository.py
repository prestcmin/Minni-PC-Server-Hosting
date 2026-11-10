from sqlalchemy import select

from backend.app.models.database import (
    Game,
    Player,
    Server,
    ServerPlayer,
)
from backend.app.repositories.player_repository import record_player_seen


def create_test_server(database):
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
        container_name="test-server",
        compose_project="test-server",
        status="running",
    )
    database.add(server)
    database.commit()
    database.refresh(server)

    return server


def test_record_player_seen_creates_player_and_server_link(database):
    server = create_test_server(database)

    link = record_player_seen(
        database=database,
        server_id=server.id,
        player_uuid="player-123",
        display_name="TestPlayer",
    )

    assert link.server_id == server.id
    assert link.join_count == 1
    assert link.is_active is True
    assert link.total_playtime_seconds == 0

    player = database.scalar(
        select(Player).where(
            Player.player_uuid == "player-123"
        )
    )

    assert player is not None
    assert player.display_name == "TestPlayer"

    saved_link = database.scalar(
        select(ServerPlayer).where(
            ServerPlayer.server_id == server.id,
            ServerPlayer.player_id == player.id,
        )
    )

    assert saved_link is not None
    assert saved_link.player_id == player.id


def test_record_player_seen_updates_existing_player_link(database):
    server = create_test_server(database)

    first_link = record_player_seen(
        database,
        server.id,
        "player-123",
        "TestPlayer",
    )

    second_link = record_player_seen(
        database,
        server.id,
        "player-123",
        "TestPlayer",
    )

    assert second_link.id == first_link.id
    assert second_link.join_count == 2

    players = database.scalars(select(Player)).all()
    links = database.scalars(select(ServerPlayer)).all()

    assert len(players) == 1
    assert len(links) == 1
