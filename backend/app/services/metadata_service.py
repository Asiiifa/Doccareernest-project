"""File metadata extraction from the local filesystem."""

import logging
from datetime import datetime, timezone
from pathlib import Path

logger = logging.getLogger(__name__)

EXTENSION_TYPE_MAP: dict[str, str] = {
    ".pdf": "document",
    ".doc": "document",
    ".docx": "document",
    ".txt": "document",
    ".md": "document",
    ".rtf": "document",
    ".odt": "document",
    ".xls": "spreadsheet",
    ".xlsx": "spreadsheet",
    ".csv": "spreadsheet",
    ".ppt": "presentation",
    ".pptx": "presentation",
    ".json": "data",
    ".xml": "data",
    ".yaml": "data",
    ".yml": "data",
    ".html": "markup",
    ".htm": "markup",
    ".png": "image",
    ".jpg": "image",
    ".jpeg": "image",
    ".gif": "image",
    ".webp": "image",
    ".svg": "image",
    ".py": "code",
    ".js": "code",
    ".ts": "code",
    ".tsx": "code",
    ".jsx": "code",
    ".java": "code",
    ".c": "code",
    ".cpp": "code",
    ".h": "code",
    ".cs": "code",
    ".go": "code",
    ".rs": "code",
    ".rb": "code",
    ".php": "code",
    ".sql": "code",
    ".zip": "archive",
    ".rar": "archive",
    ".7z": "archive",
    ".tar": "archive",
    ".gz": "archive",
}


def _timestamp_to_datetime(timestamp: float | None) -> datetime | None:
    if timestamp is None:
        return None
    return datetime.fromtimestamp(timestamp, tz=timezone.utc)


class MetadataService:
    """Extract filesystem metadata for supported files."""

    def infer_file_type(self, extension: str | None) -> str:
        if not extension:
            return "other"
        return EXTENSION_TYPE_MAP.get(extension.lower(), "other")

    def extract_metadata(self, file_path: Path, sha256: str | None = None) -> dict[str, object]:
        """Extract metadata from a real file path."""
        resolved = file_path.resolve()
        stat_result = resolved.stat()
        extension = resolved.suffix.lower() if resolved.suffix else None

        created_at = _timestamp_to_datetime(getattr(stat_result, "st_ctime", None))
        modified_at = _timestamp_to_datetime(stat_result.st_mtime)
        accessed_at = _timestamp_to_datetime(getattr(stat_result, "st_atime", None))

        return {
            "name": resolved.name,
            "full_path": str(resolved),
            "extension": extension,
            "file_type": self.infer_file_type(extension),
            "size_bytes": stat_result.st_size,
            "created_at": created_at,
            "modified_at": modified_at,
            "accessed_at": accessed_at,
            "sha256": sha256,
            "parent_directory": str(resolved.parent),
        }

    def safe_extract_metadata(
        self, file_path: Path, sha256: str | None = None
    ) -> dict[str, object] | None:
        try:
            if not file_path.is_file():
                return None
            return self.extract_metadata(file_path, sha256=sha256)
        except OSError as exc:
            logger.warning("Failed to extract metadata for %s: %s", file_path, exc)
            return None
