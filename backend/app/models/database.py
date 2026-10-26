from datetime import datetime, timezone

from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base


class Server(Base):
    __tablename__ = "servers"

    server_name: Mapped[str] = mapped_column(
        String(64),
        primary_key=True,
    )

    game: Mapped[str] = mapped_column(String(32))
    port_number: Mapped[int] = mapped_column(Integer)

    world_name: Mapped[str | None] = mapped_column(
        String(64),
        nullable=True,
    )

    world_size: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    difficulty: Mapped[str | None] = mapped_column(
        String(32),
        nullable=True,
    )

    valheim_modifier: Mapped[str | None] = mapped_column(
        String(32),
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(32),
        default="unknown",
    )

    last_error: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
