import argparse
import sqlite3
from datetime import datetime, timezone
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATABASE_PATH = PROJECT_ROOT / "backend" / "servers.db"
BACKUP_DIRECTORY = PROJECT_ROOT / "backups"


def backup_database(destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)

    source = sqlite3.connect(DATABASE_PATH)
    backup = sqlite3.connect(destination)

    try:
        source.backup(backup)
    finally:
        backup.close()
        source.close()


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Back up the server-management SQLite database."
    )
    parser.add_argument(
        "--output",
        type=Path,
        help="Optional backup path.",
    )
    args = parser.parse_args()

    if args.output:
        destination = args.output
    else:
        timestamp = datetime.now(timezone.utc).strftime(
            "%Y%m%dT%H%M%SZ"
        )
        destination = BACKUP_DIRECTORY / f"servers-{timestamp}.db"

    backup_database(destination)
    print(f"Database backup created: {destination}")


if __name__ == "__main__":
    main()
