from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


PROJECT_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    ansible_timeout_seconds: int = 900

    ansible_project_dir: Path = PROJECT_ROOT

    ansible_inventory: str = (
        "server-management/inventory.ini"
    )

    ansible_playbook: str = (
        "server-management/site.yaml"
    )

    model_config = SettingsConfigDict(
        env_file=(
            "backend/.env",
            ".env",
        ),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def inventory_path(self) -> Path:
        return self.ansible_project_dir / self.ansible_inventory

    @property
    def playbook_path(self) -> Path:
        return self.ansible_project_dir / self.ansible_playbook


settings = Settings()
