"""Tests for directory scan validation and blocked paths."""

from pathlib import Path

import pytest

from app.core.config import Settings
from app.services.file_scanner import FileScanner, ScanValidationError


def test_scan_rejects_blocked_directory(tmp_path: Path) -> None:
    blocked = tmp_path / "system-root"
    blocked.mkdir()
    (blocked / "secret.txt").write_text("do not scan", encoding="utf-8")

    settings = Settings(blocked_scan_paths=[str(blocked)])
    scanner = FileScanner(settings=settings)

    with pytest.raises(ScanValidationError, match="blocked system directory"):
        scanner.scan_directory(blocked)


def test_scan_rejects_missing_directory(tmp_path: Path) -> None:
    scanner = FileScanner()
    with pytest.raises(ScanValidationError, match="does not exist"):
        scanner.scan_directory(tmp_path / "missing-dir")


def test_validate_directory_returns_resolved_path(tmp_path: Path) -> None:
    scanner = FileScanner()
    resolved = scanner.validate_directory(tmp_path)
    assert resolved == tmp_path.resolve()
