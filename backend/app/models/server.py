from typing import Literal

from pydantic import BaseModel, Field


GameType = Literal[
    "minecraft",
    "terraria",
    "valheim",
]

ActionType = Literal[
    "deploy",
    "start",
    "stop",
    "restart",
    "remove",
]


class ServerRequest(BaseModel):
    game: GameType

    action: ActionType

    server_name: str = Field(
        min_length=3,
        max_length=32,
        pattern=r"^[a-zA-Z0-9_-]+$",
    )

    port_number: int = Field(
        default=7777,
        ge=1024,
        le=65535,
    )

    world_name: str | None = Field(
        default=None,
        max_length=64,
        pattern=r"^[a-zA-Z0-9_-]+$",
    )

    world_size: int | None = Field(
        default=None,
        ge=1,
        le=3,
    )
