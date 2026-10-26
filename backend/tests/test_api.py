"""API and integration tests."""

import os
from datetime import datetime, timezone
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.db import get_file_index, reset_file_index
from app.main import create_app
from app.services.file_scanner import ScannedFile


def _client(tmp_path: Path) -> TestClient:
    reset_file_index(database_path=tmp_path / "test.db")
    return TestClient(create_app())


def _approve(client: TestClient, directory: Path) -> None:
    response = client.post(
        "/api/files/approved-roots",
        json={"directory_path": str(directory)},
    )
    assert response.status_code == 200
    assert response.json()["path"] == str(directory.resolve())


def test_health_endpoint(tmp_path: Path) -> None:
    client = _client(tmp_path)
    response = client.get("/api/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["service"] == "DocCareerNest AI"


def test_scan_requires_approved_root(tmp_path: Path) -> None:
    client = _client(tmp_path)
    scan_dir = tmp_path / "scan-target"
    scan_dir.mkdir()
    (scan_dir / "resume.txt").write_text("content", encoding="utf-8")

    denied = client.post(
        "/api/files/scan",
        json={"directory_path": str(scan_dir), "compute_hashes": True},
    )
    assert denied.status_code == 400
    assert "approved scan root" in denied.json()["detail"]


def test_scan_search_duplicates_and_latest_with_real_files(tmp_path: Path) -> None:
    client = _client(tmp_path)

    scan_dir = tmp_path / "scan-target"
    scan_dir.mkdir()
    older = scan_dir / "resume.txt"
    older.write_text("same content", encoding="utf-8")
    duplicate_dir = scan_dir / "backup"
    duplicate_dir.mkdir()
    newer = duplicate_dir / "resume-copy.txt"
    newer.write_text("same content", encoding="utf-8")
    (scan_dir / "notes.md").write_text("unique", encoding="utf-8")

    older_ts = datetime(2024, 1, 1, tzinfo=timezone.utc).timestamp()
    newer_ts = datetime(2026, 1, 1, tzinfo=timezone.utc).timestamp()
    os.utime(older, (older_ts, older_ts))
    os.utime(newer, (newer_ts, newer_ts))

    _approve(client, scan_dir)

    scan_response = client.post(
        "/api/files/scan",
        json={"directory_path": str(scan_dir), "compute_hashes": True},
    )
    assert scan_response.status_code == 200
    scan_payload = scan_response.json()
    assert scan_payload["files_indexed"] == 3
    assert scan_payload["scan_root"] == str(scan_dir.resolve())

    search_response = client.post(
        "/api/files/search",
        json={"query": "resume", "limit": 10},
    )
    assert search_response.status_code == 200
    search_payload = search_response.json()
    assert search_payload["total"] == 2

    duplicates_response = client.post("/api/files/duplicates", json={})
    assert duplicates_response.status_code == 200
    duplicates_payload = duplicates_response.json()
    assert duplicates_payload["total_groups"] == 1
    assert duplicates_payload["duplicate_groups"][0]["file_count"] == 2

    latest_response = client.get("/api/files/latest", params={"query": "resume"})
    assert latest_response.status_code == 200
    latest_file = latest_response.json()["file"]
    assert latest_file is not None
    assert latest_file["name"] == "resume-copy.txt"

    file_id = scan_payload["files"][0]["id"]
    get_response = client.get(f"/api/files/{file_id}")
    assert get_response.status_code == 200
    assert get_response.json()["id"] == file_id


def test_scan_allows_subdirectory_of_approved_root(tmp_path: Path) -> None:
    client = _client(tmp_path)
    root = tmp_path / "docs"
    nested = root / "resumes"
    nested.mkdir(parents=True)
    (nested / "cv.txt").write_text("cv", encoding="utf-8")

    _approve(client, root)
    response = client.post(
        "/api/files/scan",
        json={"directory_path": str(nested), "compute_hashes": True},
    )
    assert response.status_code == 200
    assert response.json()["files_indexed"] == 1


def test_search_excludes_files_outside_approved_roots(tmp_path: Path) -> None:
    client = _client(tmp_path)
    approved_dir = tmp_path / "approved"
    approved_dir.mkdir()
    (approved_dir / "keep.txt").write_text("keep", encoding="utf-8")
    _approve(client, approved_dir)
    client.post(
        "/api/files/scan",
        json={"directory_path": str(approved_dir), "compute_hashes": True},
    )

    outside = tmp_path / "outside"
    outside.mkdir()
    outside_file = outside / "secret.txt"
    outside_file.write_text("secret", encoding="utf-8")
    now = datetime.now(timezone.utc)
    get_file_index().upsert_scanned_files(
        str(outside.resolve()),
        [
            ScannedFile(
                name="secret.txt",
                full_path=str(outside_file.resolve()),
                extension=".txt",
                file_type="document",
                size_bytes=6,
                created_at=now,
                modified_at=now,
                accessed_at=now,
                sha256="not-a-real-hash-for-isolation",
                parent_directory=str(outside.resolve()),
            )
        ],
    )

    search_response = client.post("/api/files/search", json={"query": "secret", "limit": 10})
    assert search_response.json()["total"] == 0

    keep_search = client.post("/api/files/search", json={"query": "keep", "limit": 10})
    assert keep_search.json()["total"] == 1

    duplicates_response = client.post("/api/files/duplicates", json={})
    duplicate_paths = [
        item["full_path"]
        for group in duplicates_response.json()["duplicate_groups"]
        for item in group["files"]
    ]
    assert str(outside_file.resolve()) not in duplicate_paths


def test_latest_returns_null_when_index_is_empty(tmp_path: Path) -> None:
    client = _client(tmp_path)
    response = client.get("/api/files/latest")
    assert response.status_code == 200
    assert response.json()["file"] is None


def test_approve_rejects_blocked_directory(tmp_path: Path) -> None:
    from app.core.config import get_settings

    settings = get_settings()
    blocked = next((Path(path) for path in settings.blocked_scan_paths if Path(path).exists()), None)
    if blocked is None:
        pytest.skip("No blocked system path exists on this machine")

    client = _client(tmp_path)
    response = client.post(
        "/api/files/approved-roots",
        json={"directory_path": str(blocked)},
    )
    assert response.status_code == 400
