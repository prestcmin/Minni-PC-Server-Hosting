from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models.database import Server


def get_by_name(database: Session, server_name: str) -> Server | None:
    return database.scalar(
        select(Server).where(Server.server_name == server_name)
    )


def get_by_id(database: Session, server_id: int) -> Server | None:
    return database.get(Server, server_id)


def list_all(database: Session) -> list[Server]:
    return list(
        database.scalars(
            select(Server).order_by(Server.created_at.desc())
        ).all()
    )


def save(database: Session, server: Server) -> Server:
    database.add(server)
    database.commit()
    database.refresh(server)
    return server


def delete(database: Session, server: Server) -> None:
    database.delete(server)
    database.commit()
