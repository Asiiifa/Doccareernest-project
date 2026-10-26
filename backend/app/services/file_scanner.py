"""Recursive filesystem scanner for user-selected directories."""

from __future__ import annotations

import logging
import os
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path

from app.core.config import Settings, get_settings
from app.services.hashing_service import HashingService
from app.services.metadata_service import MetadataService

logger = logging.getLogger(__name__)


class ScanValidationError(Exception):
    """Raised when a scan request references an invalid or blocked path."""


@dataclass
class ScannedFile:
    name: str
    full_path: str
    extension: str | None
    file_type: str
    size_bytes: int
    created_at: datetime | None
    modified_at: datetime | None
    accessed_at: datetime | None
    sha256: str | None
    parent_directory: str


@dataclass
class ScanResult:
    scan_root: str
    files: list[ScannedFile] = field(default_factory=list)
    files_scanned: int = 0
    files_skipped: int = 0
    errors: list[tuple[str, str]] = field(default_factory=list)


class FileScanner:
    """Scan real files from an explicitly provided directory."""

    def __init__(
        self,
        settings: Settings | None = None,
        metadata_service: MetadataService | None = None,
        hashing_service: HashingService | None = None,
    ) -> None:
        self.settings = settings or get_settings()
        self.metadata_service = metadata_service or MetadataService()
        self.hashing_service = hashing_service or HashingService(self.settings)
        self._blocked_paths = {
            Path(path).expanduser().resolve()
            for path in self.settings.blocked_scan_paths
            if Path(path).expanduser().exists()
        }

    def validate_directory(self, directory_path: str | Path) -> Path:
        """Resolve and validate a user-selected directory without scanning it."""
        return self._normalize_directory(directory_path)

    def _normalize_directory(self, directory_path: str | Path) -> Path:
        raw = str(directory_path).strip()
        if not raw:
            raise ScanValidationError("Directory path is required.")

        path = Path(raw).expanduser()
        if not path.is_absolute():
            raise ScanValidationError(
                "Directory path must be absolute. Relative paths are not allowed."
            )

        try:
            path = path.resolve()
        except OSError as exc:
            raise ScanValidationError(f"Directory path could not be resolved: {path}") from exc

        if not path.exists():
            raise ScanValidationError(f"Directory does not exist: {path}")
        if not path.is_dir():
            raise ScanValidationError(f"Path is not a directory: {path}")

        self._ensure_not_blocked(path)
        return path

    def _is_filesystem_root(self, path: Path) -> bool:
        resolved = path.resolve()
        return resolved == resolved.parent

    def _is_same_or_under(self, path: Path, root: Path) -> bool:
        try:
            if path == root or path.is_relative_to(root):
                return True
        except (OSError, ValueError, RuntimeError):
            return False
        if os.name != "nt":
            return False
        path_key = os.path.normcase(str(path))
        root_key = os.path.normcase(str(root))
        if path_key == root_key:
            return True
        prefix = root_key if root_key.endswith("\\") else root_key + "\\"
        return path_key.startswith(prefix)

    def _ensure_not_blocked(self, path: Path) -> None:
        resolved = path.resolve()
        if self._is_filesystem_root(resolved):
            raise ScanValidationError(
                f"Approving or scanning a drive or filesystem root is not allowed: {resolved}"
            )

        try:
            home = Path.home().resolve()
            if resolved == home:
                raise ScanValidationError(
                    "Approving or scanning the entire user profile directory is not allowed."
                )
        except (OSError, RuntimeError):
            pass

        for blocked in self._blocked_paths:
            if self._is_same_or_under(resolved, blocked):
                raise ScanValidationError(
                    f"Scanning blocked system directory is not allowed: {resolved}"
                )

    def _is_supported_file(self, file_path: Path) -> bool:
        extension = file_path.suffix.lower()
        return extension in self.settings.supported_extensions

    def scan_directory(
        self,
        directory_path: str | Path,
        *,
        compute_hashes: bool = True,
    ) -> ScanResult:
        scan_root = self._normalize_directory(directory_path)
        result = ScanResult(scan_root=str(scan_root))

        logger.info("Starting file scan at %s", scan_root)

        for current_root, dirnames, filenames in scan_root.walk(top_down=True):
            current_path = Path(current_root)

            # Prune blocked or hidden system directories during traversal.
            pruned_dirnames: list[str] = []
            for dirname in dirnames:
                child = current_path / dirname
                if self._should_skip_directory(child):
                    continue
                pruned_dirnames.append(dirname)
            dirnames[:] = pruned_dirnames

            for filename in filenames:
                file_path = current_path / filename
                result.files_scanned += 1

                if not self._is_supported_file(file_path):
                    result.files_skipped += 1
                    continue

                try:
                    if file_path.stat().st_size > self.settings.max_scan_file_size_bytes:
                        result.files_skipped += 1
                        logger.debug("Skipping oversized file: %s", file_path)
                        continue

                    sha256 = None
                    if compute_hashes:
                        sha256 = self.hashing_service.safe_compute_sha256(file_path)

                    metadata = self.metadata_service.safe_extract_metadata(
                        file_path, sha256=sha256
                    )
                    if metadata is None:
                        result.files_skipped += 1
                        continue

                    result.files.append(
                        ScannedFile(
                            name=str(metadata["name"]),
                            full_path=str(metadata["full_path"]),
                            extension=metadata["extension"],  # type: ignore[arg-type]
                            file_type=str(metadata["file_type"]),
                            size_bytes=int(metadata["size_bytes"]),
                            created_at=metadata["created_at"],  # type: ignore[arg-type]
                            modified_at=metadata["modified_at"],  # type: ignore[arg-type]
                            accessed_at=metadata["accessed_at"],  # type: ignore[arg-type]
                            sha256=metadata["sha256"],  # type: ignore[arg-type]
                            parent_directory=str(metadata["parent_directory"]),
                        )
                    )
                except OSError as exc:
                    message = str(exc)
                    result.errors.append((str(file_path), message))
                    logger.warning("Could not process %s: %s", file_path, message)

        logger.info(
            "Scan complete for %s: indexed=%s skipped=%s errors=%s",
            scan_root,
            len(result.files),
            result.files_skipped,
            len(result.errors),
        )
        return result

    def _should_skip_directory(self, directory: Path) -> bool:
        name = directory.name
        if name.startswith("$") or name in {"System Volume Information"}:
            return True

        try:
            resolved = directory.resolve()
        except OSError:
            return True
        if self._is_filesystem_root(resolved):
            return True
        for blocked in self._blocked_paths:
            if self._is_same_or_under(resolved, blocked):
                return True
        return False
