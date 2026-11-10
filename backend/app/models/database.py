from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


def utc_now():
    return datetime.now(timezone.utc)


class Game(Base):
    __tablename__ = "games"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    display_name: Mapped[str] = mapped_column(String(64))
    default_port: Mapped[int] = mapped_column(Integer)
    docker_image: Mapped[str | None] = mapped_column(String(255))
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)

    servers: Mapped[list["Server"]] = relationship(
        back_populates="game"
    )


class Server(Base):
    __tablename__ = "servers"

    id: Mapped[int] = mapped_column(primary_key=True)

    server_name: Mapped[str] = mapped_column(
        String(64),
        unique=True,
        index=True,
    )

    game_id: Mapped[int] = mapped_column(
        ForeignKey("games.id"),
        nullable=False,
    )

    port_number: Mapped[int] = mapped_column(Integer)
    container_name: Mapped[str] = mapped_column(String(128))
    compose_project: Mapped[str] = mapped_column(String(128))

    status: Mapped[str] = mapped_column(
        String(32),
        default="unknown",
    )

    last_error: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
    )

    game: Mapped["Game"] = relationship(
        back_populates="servers"
    )

    worlds: Mapped[list["World"]] = relationship(
        back_populates="server",
        cascade="all, delete-orphan",
    )

    server_players: Mapped[list["ServerPlayer"]] = relationship(
        back_populates="server",
        cascade="all, delete-orphan",
    )

    events: Mapped[list["ServerEvent"]] = relationship(
        back_populates="server",
        cascade="all, delete-orphan",
    )


class World(Base):
    __tablename__ = "worlds"

    id: Mapped[int] = mapped_column(primary_key=True)

    server_id: Mapped[int] = mapped_column(
        ForeignKey("servers.id"),
        nullable=False,
    )

    world_name: Mapped[str] = mapped_column(String(64))
    world_path: Mapped[str | None] = mapped_column(String(255))
    world_size: Mapped[int | None] = mapped_column(Integer)
    difficulty: Mapped[str | None] = mapped_column(String(32))
    valheim_modifier: Mapped[str | None] = mapped_column(String(32))
    seed: Mapped[str | None] = mapped_column(String(128))

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
    )

    server: Mapped["Server"] = relationship(
        back_populates="worlds"
    )


class Player(Base):
    __tablename__ = "players"

    id: Mapped[int] = mapped_column(primary_key=True)

    player_uuid: Mapped[str] = mapped_column(
        String(128),
        unique=True,
        index=True,
    )

    display_name: Mapped[str] = mapped_column(String(64))

    first_seen_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
    )

    last_seen_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
    )

    server_players: Mapped[list["ServerPlayer"]] = relationship(
        back_populates="player",
        cascade="all, delete-orphan",
    )


class ServerPlayer(Base):
    __tablename__ = "server_players"

    id: Mapped[int] = mapped_column(primary_key=True)

    server_id: Mapped[int] = mapped_column(
        ForeignKey("servers.id"),
        nullable=False,
    )

    player_id: Mapped[int] = mapped_column(
        ForeignKey("players.id"),
        nullable=False,
    )

    first_joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
    )

    last_seen_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
    )

    total_playtime_seconds: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )

    join_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    server: Mapped["Server"] = relationship(
        back_populates="server_players"
    )

    player: Mapped["Player"] = relationship(
        back_populates="server_players"
    )

    __table_args__ = (
        UniqueConstraint(
            "server_id",
            "player_id",
            name="uq_server_player",
        ),
    )


class ServerEvent(Base):
    __tablename__ = "server_events"

    id: Mapped[int] = mapped_column(primary_key=True)

    server_id: Mapped[int] = mapped_column(
        ForeignKey("servers.id"),
        nullable=False,
    )

    event_type: Mapped[str] = mapped_column(String(32))
    status: Mapped[str] = mapped_column(String(32))
    message: Mapped[str | None] = mapped_column(Text)
    return_code: Mapped[int | None] = mapped_column(Integer)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
    )

    server: Mapped["Server"] = relationship(
        back_populates="events"
    )
