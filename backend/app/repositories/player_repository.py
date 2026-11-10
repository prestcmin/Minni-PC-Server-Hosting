from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models.database import Player, ServerPlayer


def get_by_uuid(
    database: Session,
    player_uuid: str,
) -> Player | None:
    return database.scalar(
        select(Player).where(Player.player_uuid == player_uuid)
    )


def get_server_player(
    database: Session,
    server_id: int,
    player_id: int,
) -> ServerPlayer | None:
    return database.scalar(
        select(ServerPlayer).where(
            ServerPlayer.server_id == server_id,
            ServerPlayer.player_id == player_id,
        )
    )


def record_player_seen(
    database: Session,
    server_id: int,
    player_uuid: str,
    display_name: str,
) -> ServerPlayer:
    now = datetime.now(timezone.utc)

    player = get_by_uuid(database, player_uuid)

    if player is None:
        player = Player(
            player_uuid=player_uuid,
            display_name=display_name,
            first_seen_at=now,
            last_seen_at=now,
        )
        database.add(player)
        database.flush()
    else:
        player.display_name = display_name
        player.last_seen_at = now

    server_player = get_server_player(
        database,
        server_id,
        player.id,
    )

    if server_player is None:
        server_player = ServerPlayer(
            server_id=server_id,
            player_id=player.id,
            first_joined_at=now,
            last_seen_at=now,
            join_count=1,
            total_playtime_seconds=0,
            is_active=True,
        )
        database.add(server_player)
    else:
        server_player.last_seen_at = now
        server_player.join_count += 1
        server_player.is_active = True

    database.commit()
    database.refresh(server_player)

    return server_player
