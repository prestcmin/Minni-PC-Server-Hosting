from sqlalchemy import select

from .database import SessionLocal
from .models.database import Game


GAMES = [
    {
        "slug": "minecraft",
        "display_name": "Minecraft",
        "default_port": 25565,
        "docker_image": "itzg/minecraft-server",
    },
    {
        "slug": "terraria",
        "display_name": "Terraria",
        "default_port": 7777,
        "docker_image": "passivelemon/terraria-docker",
    },
    {
        "slug": "valheim",
        "display_name": "Valheim",
        "default_port": 2456,
        "docker_image": "lloesche/valheim-server",
    },
]


def seed_games():
    database = SessionLocal()

    try:
        for game_data in GAMES:
            existing = database.scalar(
                select(Game).where(
                    Game.slug == game_data["slug"]
                )
            )

            if existing is None:
                database.add(Game(**game_data))

        database.commit()
    finally:
        database.close()


if __name__ == "__main__":
    seed_games()
