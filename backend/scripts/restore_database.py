import argparse
import sqlite3
from datetime import datetime, timezone
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATABASE_PATH = PROJECT_ROOT / "backend" / "servers.db"
BACKUP_DIRECTORY = PROJECT_ROOT / "backups"


def copy_database(source_path: Path, destination_path: Path) -> None:
    destination_path.parent.mkdir(parents=True, exist_ok=True)

    source = sqlite3.connect(source_path)
    destination = sqlite3.connect(destination_path)

    try:
        source.backup(destination)
    finally:
        destination.close()
        source.close()


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Restore a server-management SQLite database backup."
    )
    parser.add_argument(
        "backup",
        type=Path,
        help="Path to the backup database.",
    )
    parser.add_argument(
        "--target",
        type=Path,
        default=DATABASE_PATH,
        help="Database path to restore into.",
    )
    parser.add_argument(
        "--confirm",
        action="store_true",
        help="Allow replacing the target database.",
    )
    args = parser.parse_args()

    backup_path = args.backup.resolve()
    target_path = args.target.resolve()

    if not backup_path.exists():
        raise SystemExit(f"Backup does not exist: {backup_path}")

    if target_path == DATABASE_PATH and not args.confirm:
        raise SystemExit(
            "Refusing to replace the live database without --confirm."
        )

    if target_path == DATABASE_PATH and target_path.exists():
        timestamp = datetime.now(timezone.utc).strftime(
            "%Y%m%dT%H%M%SZ"
        )
        safety_backup = (
            BACKUP_DIRECTORY / f"pre-restore-{timestamp}.db"
        )
        copy_database(target_path, safety_backup)
        print(f"Safety backup created: {safety_backup}")

    copy_database(backup_path, target_path)
    print(f"Database restored to: {target_path}")


if __name__ == "__main__":
    main()
