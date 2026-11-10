from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models.database import ServerEvent


def create_event(
    database: Session,
    server_id: int,
    event_type: str,
    status: str,
    message: str | None = None,
    return_code: int | None = None,
) -> ServerEvent:
    event = ServerEvent(
        server_id=server_id,
        event_type=event_type,
        status=status,
        message=message,
        return_code=return_code,
    )

    database.add(event)
    database.commit()
    database.refresh(event)

    return event


def list_for_server(
    database: Session,
    server_id: int,
) -> list[ServerEvent]:
    return list(
        database.scalars(
            select(ServerEvent)
            .where(ServerEvent.server_id == server_id)
            .order_by(ServerEvent.created_at.desc())
        ).all()
    )
