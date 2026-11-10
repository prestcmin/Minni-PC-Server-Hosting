from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models.database import World


def get_active_for_server(
    database: Session,
    server_id: int,
) -> World | None:
    return database.scalar(
        select(World).where(
            World.server_id == server_id,
            World.is_active.is_(True),
        )
    )


def save(database: Session, world: World) -> World:
    database.add(world)
    database.commit()
    database.refresh(world)
    return world
