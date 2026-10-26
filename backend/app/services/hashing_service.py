"""SHA-256 hashing service for real files."""

import hashlib
import logging
from pathlib import Path

from app.core.config import Settings, get_settings

logger = logging.getLogger(__name__)


class HashingService:
    """Compute deterministic SHA-256 hashes for files on disk."""

    def __init__(self, settings: Settings | None = None) -> None:
        self.settings = settings or get_settings()

    def compute_sha256(self, file_path: Path) -> str:
        """Return the SHA-256 hex digest for a file."""
        digest = hashlib.sha256()
        with file_path.open("rb") as handle:
            while chunk := handle.read(self.settings.hash_chunk_size):
                digest.update(chunk)
        return digest.hexdigest()

    def safe_compute_sha256(self, file_path: Path) -> str | None:
        """Compute hash and return None if the file cannot be read."""
        try:
            if not file_path.is_file():
                return None
            if file_path.stat().st_size > self.settings.max_scan_file_size_bytes:
                logger.warning("Skipping hash for oversized file: %s", file_path)
                return None
            return self.compute_sha256(file_path)
        except OSError as exc:
            logger.warning("Failed to hash %s: %s", file_path, exc)
            return None
