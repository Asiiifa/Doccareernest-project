"""Application configuration via pydantic-settings."""

from functools import lru_cache
from pathlib import Path

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def _default_blocked_scan_paths() -> list[str]:
    """System paths that must never be scanned implicitly."""
    return [
        "C:\\Windows",
        "C:\\Program Files",
        "C:\\Program Files (x86)",
        "C:\\ProgramData",
        "C:\\$Recycle.Bin",
        "/System",
        "/Library",
        "/usr",
        "/bin",
        "/sbin",
        "/etc",
        "/var",
        "/proc",
        "/dev",
    ]


class Settings(BaseSettings):
    """Runtime configuration loaded from environment and .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "DocCareerNest AI"
    app_version: str = "0.1.0"
    debug: bool = False
    api_prefix: str = "/api"
    host: str = "127.0.0.1"
    port: int = 8000
    log_level: str = "INFO"

    cors_origins: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ]
    )

    database_path: Path = Path("./data/doccareernest.db")
    hash_chunk_size: int = 65_536
    max_scan_file_size_mb: int = 500

    blocked_scan_paths: list[str] = Field(default_factory=_default_blocked_scan_paths)

    supported_extensions: set[str] = Field(
        default_factory=lambda: {
            ".pdf",
            ".doc",
            ".docx",
            ".txt",
            ".md",
            ".rtf",
            ".odt",
            ".xls",
            ".xlsx",
            ".csv",
            ".ppt",
            ".pptx",
            ".json",
            ".xml",
            ".yaml",
            ".yml",
            ".html",
            ".htm",
            ".png",
            ".jpg",
            ".jpeg",
            ".gif",
            ".webp",
            ".svg",
            ".py",
            ".js",
            ".ts",
            ".tsx",
            ".jsx",
            ".java",
            ".c",
            ".cpp",
            ".h",
            ".cs",
            ".go",
            ".rs",
            ".rb",
            ".php",
            ".sql",
            ".zip",
            ".rar",
            ".7z",
            ".tar",
            ".gz",
        }
    )

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: object) -> list[str]:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value  # type: ignore[return-value]

    @field_validator("database_path", mode="before")
    @classmethod
    def parse_database_path(cls, value: object) -> Path:
        return Path(value)  # type: ignore[arg-type]

    @property
    def max_scan_file_size_bytes(self) -> int:
        return self.max_scan_file_size_mb * 1024 * 1024


@lru_cache
def get_settings() -> Settings:
    return Settings()
