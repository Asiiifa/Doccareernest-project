"""Tests for SHA-256 hashing service."""

from pathlib import Path

from app.services.hashing_service import HashingService


def test_compute_sha256_is_deterministic(tmp_path: Path) -> None:
    file_path = tmp_path / "sample.txt"
    file_path.write_text("DocCareerNest hashing test", encoding="utf-8")

    service = HashingService()
    first_hash = service.compute_sha256(file_path)
    second_hash = service.compute_sha256(file_path)

    assert first_hash == second_hash
    assert len(first_hash) == 64


def test_same_content_produces_same_hash(tmp_path: Path) -> None:
    content = "duplicate content"
    file_a = tmp_path / "a.txt"
    file_b = tmp_path / "b.txt"
    file_a.write_text(content, encoding="utf-8")
    file_b.write_text(content, encoding="utf-8")

    service = HashingService()
    assert service.compute_sha256(file_a) == service.compute_sha256(file_b)


def test_safe_compute_sha256_returns_none_for_missing_file(tmp_path: Path) -> None:
    service = HashingService()
    assert service.safe_compute_sha256(tmp_path / "missing.txt") is None
